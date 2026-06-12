# GCP Deployment Plan

> **Implementation status:** Stages 1–3 (plus link-credential access control
> from Stage 4) are **built and tested** — see "What's implemented" below.
> Remaining user actions: run `infra/setup.sh`, set four GitHub variables,
> merge to main. Stage 4's full Firebase Auth and Stage 5 are still to build.

From the current prototype (Next.js, in-process generation, file-backed store)
to the production architecture in [02-technical-architecture](./02-technical-architecture.md),
in five independently shippable stages. Each stage leaves a working, demoable
system.

## What's implemented (and how to deploy it)

| Piece | Where | Verified by |
|---|---|---|
| Container image (standalone Next.js, non-root, port 8080) | `web/Dockerfile` | standalone bundle boot + page/API probes |
| Async store: Firestore backend (ADC, ordered write chains) + file backend for local dev | `web/src/lib/store/` | full event loop against the Firestore emulator, incl. cross-process persistence |
| Queued generation: Cloud Tasks enqueue + private worker endpoint with OIDC / shared-secret verification | `web/src/lib/generation.ts`, `web/src/app/api/internal/generate/` | 403 unauth / 200 authed; idempotent re-delivery |
| Link-credential access control (`REQUIRE_ACCESS_KEYS=1`): host key + per-player keys checked server-side on every route | `web/src/lib/access.ts` | negative + positive tests on every endpoint |
| One-time GCP bootstrap (APIs, Firestore, secret, SAs, queue, WIF) | `infra/setup.sh` | bash -n + idempotent gcloud calls |
| CI/CD: WIF-authenticated source deploys of both services | `.github/workflows/deploy.yml` | activates on merge to main |

**To go live:**

```bash
# 1. One-time bootstrap (your machine, gcloud authed as project owner)
ANTHROPIC_API_KEY=sk-ant-... ./infra/setup.sh YOUR_PROJECT_ID us-central1

# 2. Add the four GCP_* repository variables it prints
#    (GitHub → Settings → Secrets and variables → Actions → Variables)

# 3. Merge this branch to main (activates the deploy workflow), or run
#    the "Deploy to Cloud Run" workflow manually from the Actions tab.
```

**Runtime environment variables** (set by the deploy workflow):

| Var | Service | Purpose |
|---|---|---|
| `GOOGLE_CLOUD_PROJECT` | both | selects the Firestore store backend |
| `ANTHROPIC_API_KEY` (secret) | both | live Writers' Room (web needs it for refinement) |
| `TASKS_QUEUE` / `TASKS_LOCATION` / `WORKER_URL` / `TASKS_SA_EMAIL` | web | enqueue generation to the worker |
| `WORKER_URL` + `TASKS_SA_EMAIL` | generator | OIDC audience + expected caller for worker auth |
| `REQUIRE_ACCESS_KEYS=1` | web | enforce host/player link credentials |
| `INTERNAL_SHARED_SECRET` | optional | worker auth alternative for non-OIDC setups |

**Target project layout:** one GCP project per environment (`mgn-staging`,
`mgn-prod`), Firebase enabled on both, region `us-central1` (or nearest to
first users — everything below is single-region).

---

## Stage 0 — Prerequisites (½ day, one-time)

```bash
gcloud projects create mgn-staging && gcloud config set project mgn-staging
gcloud billing projects link mgn-staging --billing-account=BILLING_ID

gcloud services enable \
  run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com \
  firestore.googleapis.com secretmanager.googleapis.com cloudtasks.googleapis.com \
  cloudscheduler.googleapis.com identitytoolkit.googleapis.com storage.googleapis.com

# Firestore (Native mode) + Firebase
gcloud firestore databases create --location=us-central1
firebase projects:addfirebase mgn-staging

# The Anthropic key lives in Secret Manager, nowhere else
printf '%s' "$ANTHROPIC_API_KEY" | gcloud secrets create anthropic-api-key --data-file=-
```

Also: register/decide the domain; create an Artifact Registry repo
(`gcloud artifacts repositories create web --repository-format=docker --location=us-central1`).

---

## Stage 1 — Prototype on Cloud Run, as-is (1 day) ✅ demoable on a real URL

Get the existing app on the public internet with zero code restructuring.

**Code changes (small):**
1. `next.config.ts`: `output: "standalone"` — produces a self-contained server for a slim image.
2. Add `web/Dockerfile` (multi-stage: `npm ci` → `next build` → copy `.next/standalone`, run as non-root, `PORT=8080`).
3. Point the file store at `/tmp` (Cloud Run's writable tmpfs) via env var.

**The two traps that will bite this specific codebase:**

| Trap | Why | Fix at this stage |
|---|---|---|
| **In-memory/file store** — Cloud Run instances are ephemeral and horizontally scaled; two instances = two disjoint stores, restarts wipe events | The store was built as a Firestore stand-in | `--min-instances=1 --max-instances=1` for the demo. All traffic hits one warm instance; events survive between requests (not deploys). Real fix is Stage 2. |
| **Fire-and-forget generation** — `void runPipeline(event)` keeps working *after* the HTTP response returns; Cloud Run **throttles CPU to ~0 outside requests** by default, freezing the pipeline mid-call | Generation currently runs in-process | `--no-cpu-throttling` (CPU always allocated). Real fix is Stage 3. |

**Deploy:**

```bash
gcloud run deploy mgn-web --source web/ \
  --region us-central1 --allow-unauthenticated \
  --min-instances 1 --max-instances 1 --no-cpu-throttling \
  --memory 1Gi --timeout 300 \
  --set-secrets ANTHROPIC_API_KEY=anthropic-api-key:latest
```

Cloud Build builds from source; the service account needs
`roles/secretmanager.secretAccessor`. Custom domain + managed TLS via
`gcloud run domain-mappings create` (or a load balancer later).

**Cost:** ~$15–30/mo (one always-allocated small instance) + ~$1/generated
story. Everything else is in free tiers at this scale.

---

## Stage 2 — Firestore persistence (2–3 days)

Swap `web/src/lib/store.ts` for a Firestore implementation behind the same
four-function interface (`saveEvent/getEvent/listEvents/newId`) — the call
sites don't change.

- `firebase-admin` SDK with Application Default Credentials (the Cloud Run
  service account; **no JSON key files anywhere**).
- Collection layout: start with one `events/{id}` doc per event (the prototype
  object), then split into the subcollections from
  [04-database-schema](./04-database-schema.md) (`characters/`, `evidence/`,
  `runtime/state`) as part of Stage 4's security partitioning.
- Watch the 1 MiB doc limit — a generated package is ~50–150 KB today, fine,
  but split before adding media references.
- Remove `--max-instances=1` (state is now shared); keep min-instances=1 for
  warm starts or drop to 0 to save money.

**Exit criterion:** kill the service, redeploy, events are all still there.

---

## Stage 3 — Generation off the request path (3–4 days)

Replace `void runPipeline()` with the queue architecture from docs/02:

1. **Second Cloud Run service** `mgn-generator` (same image, env-flagged route,
   or a separate entrypoint): one endpoint that runs the full pipeline for an
   event ID, writing checkpoints to Firestore as it goes. Request timeout
   15–30 min (Cloud Run allows up to 60), `--no-cpu-throttling` not needed —
   the work happens *inside* a request now.
2. **Cloud Tasks queue** `generation`: the web app's `POST /generate` enqueues
   a task targeting the generator (OIDC-authenticated service-to-service —
   generator is **not** publicly invokable). Retry config: max 2 attempts,
   min backoff 60s; the pipeline is resumable from checkpoints so a retry
   continues rather than restarts.
3. **Idempotency**: task name = `gen-{eventId}-{attempt}` so a double-tap on
   "Summon the Writers' Room" can't double-spend.
4. **Budget ceiling**: per-event token budget check between stages (the usage
   log from the smoke harness already measures this); abort to `failed` with
   a friendly error rather than runaway spend.

This also un-blocks scale-to-zero on the web service: nothing long-running
lives there anymore.

**Exit criterion:** generation survives a web-service deploy mid-pipeline.

---

## Stage 4 — Identity & security (1 week)

The prototype's honor-system URLs become real auth:

- **Hosts:** Firebase Auth (Google + email link). Next.js middleware verifies
  ID tokens on `/host/*` routes and API writes; event docs carry `hostId`.
- **Players:** invitation email carries a single-use token →
  `POST /api/auth/player/redeem` → Firebase **anonymous auth** session with
  custom claims `{eventId, playerId}`. Tokens stored hashed, revocable.
- **Firestore security rules** (docs/02 §4): members read public event data
  and their own `characters/{id}/private/*`; `bible/`, unreleased evidence
  payloads, and pre-finale accusations are server-only. Player reads can then
  move to direct Firestore listeners (Stage 5) without trusting the client.
- **Server hardening:** App Check on client SDK calls; per-event rate limits
  on refine/regenerate endpoints (they cost real money); audit log entries on
  every runtime verb (already in the prototype's `runtime.log` — promote to a
  subcollection).

**Exit criterion:** dev-tools snooping on a player session can't retrieve the
solution or another player's secrets *from any endpoint or listener*.

---

## Stage 5 — Realtime, media, email (1–2 weeks, parallelizable)

- **Realtime:** replace the 2-second polling with Firestore client listeners
  on `runtime/state` and the player's `deliveries` — host taps *advance* and
  every phone updates in <1s. (This is why Firestore was chosen; no
  WebSocket infra to run.)
- **Media:** Cloud Storage bucket (`mgn-prod-assets`), uniform access,
  signed URLs with long TTL. Image generation + TTS calls happen in the
  generator service post-text-lock; print-pack PDFs rendered server-side.
- **Email:** Resend or SendGrid (GCP has no first-party transactional email).
  Templates for invitation, briefing, recap. Webhook → Firestore for
  bounce/RSVP state.
- **Scheduler:** Cloud Scheduler for the pre-event drip and PII-purge jobs.

---

## CI/CD & operations (set up during Stage 1, grow with it)

- **Deploys from GitHub Actions via Workload Identity Federation** — no
  service-account keys in GitHub secrets. Staging deploys on merge to `main`;
  prod on tag. (The existing `live-pipeline.yml` smoke test becomes a
  pre-deploy quality gate: block deploy if the generated story fails gates.)
- **Observability:** Cloud Logging with structured logs (pipeline stage,
  event ID, tokens, USD — the smoke harness fields), Error Reporting, an
  uptime check on `/`, and a log-based metric + alert on `status=failed`
  events and per-day Anthropic spend.
- **Budgets:** GCP budget alert at $50/$100; application-level daily token
  ceiling with a kill switch env var.

---

## Cost picture (steady state, pre-launch scale)

| Item | Monthly |
|---|---|
| Cloud Run web (min 1 warm instance; scale-to-zero after Stage 3 if preferred) | $5–30 |
| Cloud Run generator (pay per generation minute) | ~$0.01/story |
| Firestore, Cloud Tasks, Secret Manager, Storage, Scheduler | free tier → <$5 |
| Email (Resend free tier: 3k/mo) | $0 |
| **Anthropic generation** | **~$1.06/story** (measured) — the dominant marginal cost |

A staging environment running 100 test stories/month lands around **$40–60/mo
total**. The fixed costs stay flat well past launch; spend scales with
stories generated, which scales with revenue.

## Suggested order of execution

Stage 1 can ship **today** (Dockerfile + two flags). Stages 2 and 3 are the
real architectural work and should land before any outside playtest. Stage 4
before any stranger touches it. Stage 5 before charging money.
