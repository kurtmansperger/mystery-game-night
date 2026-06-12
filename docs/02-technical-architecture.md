# Technical Architecture

Covers: system architecture, event runtime architecture, API design, security model.

---

## 1. System Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│  CLIENTS (Next.js 15, React, TypeScript, Tailwind — mobile-first PWA)  │
│  Host console · Player experience · Marketing site · Print renderer    │
└────────────┬───────────────────────────────────────────┬───────────────┘
             │ HTTPS (API routes / callable fns)          │ Firestore SDK
             ▼                                            ▼ (realtime listeners)
┌─────────────────────────┐                 ┌─────────────────────────────┐
│  API LAYER              │                 │  FIRESTORE                  │
│  Cloud Functions v2     │◄───────────────►│  events, storyBibles,       │
│  (short-lived ops:      │                 │  characters, evidence,      │
│   runtime verbs, RSVP,  │                 │  runtimeState, players,     │
│   accusations, auth)    │                 │  deliveries, accusations    │
└──────────┬──────────────┘                 └─────────────┬───────────────┘
           │ enqueue (Cloud Tasks)                        │
           ▼                                              │
┌─────────────────────────────────────────────┐           │
│  GENERATION SERVICE (Cloud Run jobs)        │───────────┘ checkpoints
│  AI Writers' Room orchestrator              │
│  • Claude API (structured outputs)          │
│  • Image generation (hero assets)           │
│  • TTS (narration, voicemails)              │
│  • Quality gates & solvability validator    │
└──────────┬──────────────────────────────────┘
           ▼
┌─────────────────────────┐   ┌──────────────────────┐   ┌───────────────┐
│ Cloud Storage           │   │ Email (Resend/SES)   │   │ Cloud         │
│ images, audio, print    │   │ invites, briefings,  │   │ Scheduler     │
│ packs (signed URLs)     │   │ recaps               │   │ pre-event drip│
└─────────────────────────┘   └──────────────────────┘   └───────────────┘
```

**Key split:** Cloud Functions for anything < 30 s (runtime verbs, auth,
webhooks); Cloud Run jobs for the 3–10 min generation pipeline. Both write to
Firestore; clients learn everything via realtime listeners, so there is no
polling anywhere in the product.

### Frontend

- **Next.js App Router.** Marketing + host console + player experience in one app.
- **Player experience is a PWA** with aggressive prefetch: at each act boundary,
  all content the player *could* receive that act is downloaded (encrypted
  payloads unlocked by key delivery at reveal time — see §5). Wi-Fi dies, the
  party doesn't.
- **Print renderer:** server-rendered, print-CSS pages for evidence packs, name
  badges, and table tents — first-class output, not an afterthought (phones-down
  principle).

### AI integration

- **Claude API** with structured outputs (tool-use JSON schemas) for all
  Writers' Room agents. Model routing: top-tier model for Showrunner / Mystery
  Writer / Quality Judge; mid-tier for bulk drafting (documents, flavor);
  small model for runtime assists (hint phrasing, nudge copy).
- **Long-term memory = the Story Bible**, not conversation history. Every agent
  call is stateless: it receives the genome, the relevant Bible slice, and its
  task. This makes generation resumable, parallelizable, and debuggable.
- Media: image generation for hero assets; TTS for narration/voicemails with a
  per-event voice cast (consistent narrator voice; distinct character voices).

## 2. Event Runtime Architecture (Deliverable 8)

The runtime is a **scheduler over pre-validated content** — it never invents facts.

### State machine

```
draft → generating → review → published → preEvent → live → finale → completed
                        │                              │
                        └── regenerate (loops) ──┐     ├─ paused
                                                 ▼     ▼
                                              cancelled (any pre-live state)
```

### Live event loop

```
runtimeState (Firestore doc, one per event)
  phase: live | finale | completed
  currentAct / currentBeat
  clock: { startedAt, pausedAt?, scheduleOffsetMs }
  released: evidenceId[]      deliveredPrompts: { playerId: promptId[] }
  engagement: { playerId: { lastActiveAt, promptsCompleted, idleScore } }
```

1. **Beat scheduler** (Cloud Function, also triggerable by host verb): when a
   beat opens, it executes the beat's *manifest* — release evidence X to all,
   deliver private prompt Y to player P, play audio Z on host device, start a
   group vote timer.
2. **Pacing Agent (advisory):** a scheduled function compares wall-clock progress
   against the runtime plan and engagement signals, then writes *suggestions* to
   the host dashboard ("You're 12 min behind — beat 2.3 is skippable" / "Table's
   hot, hold the reveal 5 more minutes"). The host taps to act; suggestions never
   auto-execute.
3. **Player Experience Agent (runtime half):** monitors idle scores; when a
   player idles past threshold, selects the next prompt from that character's
   pre-generated *prompt deck* (each character ships with 8–12 conditional
   prompts tagged by beat range). Live LLM use here is limited to rephrasing a
   prompt with current context, never new facts.
4. **Contingency content:** every mystery ships with pre-generated fallbacks —
   tiered hint ladders per inference step, a "detective's notebook" recap if the
   table is lost, accelerated-finale variants for hard runtime overruns, and a
   beat-skip rewrite of the final narration. The panic button surfaces these.
5. **Audio routing:** announcements/narration play on the host's device
   (the room's speaker); voicemails/whispers play on the target player's phone
   with a "headphones on" affordance.

### Failure modes

| Failure | Behavior |
|---|---|
| Player phone dies | Host can re-issue magic link to any device; print pack covers evidence; character card is on paper. |
| Venue Wi-Fi dies | Act content already prefetched; runtime verbs queue locally on host device and reconcile. |
| Player no-show | Host taps "absorb character": their *required* knowledge redistributes via pre-planned fallback (every evidence node has ≥2 carriers — generation-time rule). |
| Host phone dies | Any player can be promoted to host via recovery code from the event email. |

## 3. API Design (Deliverable 10)

External surface is small; Firestore listeners carry all reads. Writes go
through callable functions / API routes (validation + authorization + audit).

```
AUTH
POST  /api/auth/host                      Firebase Auth (email/OAuth)
POST  /api/auth/player/redeem             { inviteToken } → player session (anonymous auth + custom claims)

EVENTS (host)
POST  /api/events                         create draft { mode, blend, theme, tone, runtime, players[], genome?, rating }
GET   /api/events/:id                     summary + status
POST  /api/events/:id/generate            enqueue pipeline → { jobId }   (progress via Firestore listener)
POST  /api/events/:id/regenerate          { scope: "story" | "character:<id>" | "asset:<id>", instructions? }
POST  /api/events/:id/characters/:cid/refine    { instructions }  → revised card + continuity report
POST  /api/events/:id/characters/:cid/assign    { playerName, email }
POST  /api/events/:id/publish             lock story, send invitations
POST  /api/events/:id/start               preEvent → live

RUNTIME (host verbs — idempotent, audited)
POST  /api/events/:id/advance             next beat (or { toBeat })
POST  /api/events/:id/reveal              { evidenceId }
POST  /api/events/:id/nudge               { playerId, promptId? }
POST  /api/events/:id/panic               → contingency menu for current state
POST  /api/events/:id/finale              open accusations

RUNTIME (player)
POST  /api/events/:id/accusations         { culpritId, motive, means }
POST  /api/events/:id/votes               { ballotId, choice }
POST  /api/events/:id/actions             { type: "shareEvidence" | "useAbility", payload }  (logged to Bible)

WEBHOOKS / INTERNAL
POST  /internal/pipeline/checkpoint       Cloud Run → progress + partial artifacts
POST  /webhooks/email                     delivery/bounce events → RSVP state
```

Conventions: JSON bodies, Zod-validated; errors as
`{ error: { code, message, hint } }`; all runtime verbs idempotent via
`Idempotency-Key`; every state-changing call appends to the event audit log.

## 4. Security Model (Deliverable 11)

**Threat model headline: the attacker is at the party.** A curious player
opening dev tools must not be able to read the solution, other players'
secrets, or unreleased evidence. UI hiding is not a control; data simply does
not reach the client before its reveal condition.

### Identity & authorization

- **Hosts:** Firebase Auth (email link / Google / Apple). Custom claim `host` per event via membership doc.
- **Players:** no account required. Invite email carries a single-use,
  event-scoped token → anonymous Firebase Auth session with custom claims
  `{ eventId, playerId }`. Tokens are revocable (re-invite) and expire after the event.
- **Roles:** `host`, `cohost` (runtime verbs only, no solution access in
  Player-Host Mode), `player`.

### Data partitioning (server-enforced)

| Data class | Who can read | Mechanism |
|---|---|---|
| Public event content (theme, cast list, released evidence) | All event members | Firestore rules: membership check |
| Character private docs (secrets, objectives, prompts) | That player + host | Per-doc `playerId` rule |
| Unreleased evidence / future beats | Nobody client-side | Lives under `private/` subtree readable only by service accounts; copied (or key-released, see §5) on reveal |
| Solution (culprit, truth timeline) | Director-mode host only | Separate doc; Player-Host mode strips it from all host reads server-side |
| Other players' accusations pre-finale | Nobody | Write-only collection until finale flips a release flag |

### Firestore rules sketch

```
match /events/{eventId} {
  allow read: if isMember(eventId);
  match /characters/{charId}/private/{doc} {
    allow read: if request.auth.token.playerId == resource.data.playerId
                || isDirectorHost(eventId);
  }
  match /private/{document=**} { allow read, write: if false; }  // server only
  match /runtime/state { allow read: if isMember(eventId); allow write: if false; }
}
```

### Offline prefetch without spoilers (§2 dependency)

Prefetched future content is delivered as AES-GCM-encrypted blobs; the per-item
key is what the reveal verb actually publishes (tiny payload → instant reveal
even on bad Wi-Fi, and pre-reveal blobs are useless to dev-tools snoops).

### Platform security & safety

- All host inputs (theme, notes, refinement instructions) are treated as
  untrusted: prompt-injection-resistant agent prompts (instructions/data
  separation), output schema validation, and content-safety pass on generated
  text (names of real people, content-rating compliance).
- PII: player emails used solely for event mail; purged 90 days post-event by
  scheduled job. Recap pages use unguessable URLs with player-controlled opt-out.
- Audit log on every runtime verb and host edit (who/what/when) — also powers
  the post-game "behind the scenes" recap.
- Rate limits per event on generation and refinement endpoints; global cost
  ceilings per workspace.

## 5. Real-time & Scale Notes

- One Firestore listener per player on `runtime/state` + their `deliveries`
  subcollection: fan-out is O(players), trivially within Firestore limits for
  ≤20 players/event; thousands of concurrent events shard naturally by event doc.
- Hot path (advance/reveal) touches ≤3 docs; no transactions across events.
- Generated media on Cloud Storage behind long-TTL signed URLs, cache-friendly.
- Multi-region not required for MVP (events are single-venue); Firestore
  `nam5` multi-region for durability.

## 6. Observability & Quality Telemetry

- **Pipeline traces:** every agent call logged with prompt hash, model, tokens,
  latency, validation outcome; full trace attached to each story for replay/debug.
- **Story quality flywheel:** Quality Judge scores + host edit patterns + reroll
  reasons + post-event NPS land in BigQuery; this dataset tunes prompts and
  judge thresholds — it is the company's core asset.
- Runtime: beat-lag histograms, idle-score distributions, hint usage per
  inference step (a step that always needs hints is a generation bug).
