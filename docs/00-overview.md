# Mystery Game Night — Platform Overview

> AI-powered interactive mystery experiences for groups gathering in person.

## What this is

A SaaS platform where a host describes the party they want — theme, tone, runtime,
who's coming — and an AI Writers' Room generates a complete, professionally-written
mystery experience: characters, secrets, relationships, evidence, visuals, audio,
and a paced event timeline. Players receive personalized character briefings before
the event and a private phone interface during it. The phone is a prop and a
prompter; the party happens in the room.

## Document map

| Doc | Contents | Deliverables covered |
|---|---|---|
| [01-prd.md](./01-prd.md) | Product requirements, experience modes, Story Genome, host/player workflows, dual victory system | 1, 6, 7 |
| [02-technical-architecture.md](./02-technical-architecture.md) | System architecture, event runtime, API design, security model | 2, 8, 10, 11 |
| [03-agent-architecture.md](./03-agent-architecture.md) | Writers' Room agents, generation pipeline, prompt templates | 3, 9 |
| [04-database-schema.md](./04-database-schema.md) | Firestore schema, Story Bible schema | 4, 5 |
| [05-ui-wireframes.md](./05-ui-wireframes.md) | Wireframes for host, player, and runtime surfaces | 12 |
| [06-roadmap-and-monetization.md](./06-roadmap-and-monetization.md) | MVP definition, Phase 2 roadmap, monetization strategy | 13, 14, 15 |
| [`web/`](../web/README.md) | First working prototype (Next.js + TypeScript + Tailwind) | 16 |

## North star

**Story quality is the product.** Every architectural decision below is downstream
of one question: does this make the story better, or does it make players talk to
each other more? A technically impressive system that produces a mediocre mystery
is a failure.

## Challenged assumptions (read this first)

The brief implies several defaults we deliberately rejected. These are the most
consequential product/engineering decisions in the platform:

### 1. No live AI plot generation during the event
Generating story content in real time during the party is the obvious
architecture and the wrong one. Live generation means latency at the worst
possible moment, unbounded cost, and — fatally — no way to guarantee the mystery
stays *fair* (a clue invented at 9:14 PM can't have been foreshadowed at 8:02 PM).

**Decision:** All narrative truth is generated and validated *before* the event.
The runtime *selects and schedules* from pre-validated content (conditional beats,
contingency reveals, hint ladders). Live AI is reserved for low-risk assistive
tasks: host-requested hints, in-character flavor responses, and pacing suggestions
— never new facts.

### 2. "Multiple endings" ≠ branching truth
True branching plot (different culprits per playthrough decided late) destroys
fairness and multiplies QA surface. **Decision:** *Fixed truth, variable
outcomes.* The crime's truth is immutable from generation time. Endings vary by
what players *achieve* — accusation correctness, personal objectives completed,
secrets exposed or kept — which yields dozens of distinct finale narrations from
one validated truth. Replayability comes from regeneration, not in-game branching.

### 3. Not every artifact should be a generated image
Image models are weak at dense legible text, and documents are where mystery
lovers live. **Decision:** Hero assets (invitation art, estate map, crime scene,
character portraits) are image-generated. Evidence *documents* — letters,
receipts, ledgers, newspaper clippings, autopsy notes — are AI-written text
rendered through styled HTML/print templates. They look better, cost ~100x less,
and are printable for phones-down play.

### 4. Player count caps at 12 for MVP, not 20
Relationship richness is O(n²); a 20-player web of meaningful pairwise secrets is
beyond reliable single-pass generation quality today. **Decision:** MVP supports
4–12 players. 13–20 ships in Phase 2 via *faction architecture* (3–4 clusters
with dense intra-cluster and sparse inter-cluster relationships), which is also
how good large-cast theater actually works.

### 5. The host is a director, not a sysadmin
Murder mystery box kits fail when the host becomes a stressed-out rules engine.
**Decision:** the host dashboard has exactly three live verbs — *advance*,
*reveal*, *nudge* — plus a panic button ("we're lost, help"). The Pacing Agent
recommends; the host taps. Everything else is automated or pre-decided.

### 6. Long-running generation doesn't belong in Cloud Functions
The full Writers' Room pipeline runs 3–10 minutes with critique loops. **Decision:**
generation runs on Cloud Run jobs (same GCP project, triggered via Cloud Tasks),
writing progress checkpoints to Firestore so the host watches the room "write"
in real time. Cloud Functions handle short-lived runtime operations only.

## The one-sentence pitch per discipline

- **PM:** Box-kit murder mysteries are a $200M+ wedge with 40-year-old content; we make every kit bespoke.
- **Narrative designer:** A writers' room that knows your friends.
- **Escape room designer:** The evidence chain is the puzzle; the living room is the room.
- **TTRPG designer:** Everyone gets a character sheet with teeth — goals, secrets, and leverage.
- **AI architect:** Solution-first generation with adversarial validation; runtime is a scheduler, not an author.
- **Mystery writer:** Surprising but inevitable — we generate the solution first and work backwards, like every good mystery ever written.
