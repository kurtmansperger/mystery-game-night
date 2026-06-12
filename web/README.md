# Mystery Game Night — Working Prototype

The first working prototype (deliverable 16) of the AI-powered interactive
mystery platform specified in [`../docs/`](../docs/00-overview.md).

## What it does

The full product loop, end to end:

1. **Host wizard** (`/host/new`) — mode + blend, theme, tone, runtime, content
   rating, named players with writer notes, and the full 16-dimension Story
   Genome with advanced sliders.
2. **AI Writers' Room generation** — a staged pipeline (premise → solution →
   cast → evidence → drama → beats) with live, spoiler-safe checkpoints the
   host watches in real time.
3. **Two gates** — the Continuity Editor's machine-checked structural gate
   (solvability proxy, no dead roles, falsifiable herrings, consistent release
   schedule) and an independent Quality Judge score.
4. **Review & refine** (`/host/[id]`) — spoiler shield (Director mode toggle),
   cast cards, and natural-language character refinement
   ("make her more sarcastic") applied through the Character Writer.
5. **Live runtime** — beat-by-beat host dashboard with host scripts, private
   prompt visibility, an evidence locker with early-reveal, and an event log.
6. **Player experience** (`/player/[eventId]/[characterId]`) — mobile-first
   private dashboard: Now card, role/voice/costume, secrets vault, dual-victory
   objectives, evidence wallet, relationship map, accusation composer.
7. **Finale** — accusations, the reveal narration, group scoreboard, awards.

## Providers

| Provider | When | What it does |
|---|---|---|
| **Claude Writers' Room** | `ANTHROPIC_API_KEY` is set | Live generation on `claude-opus-4-8` with adaptive thinking and structured outputs: story spine → cast → evidence/beats → independent Quality Judge, plus real NL character refinement. |
| **Offline demo** | no key | Serves *The Last Vintage*, a fully hand-authored 8-character benchmark mystery demonstrating every structural rule (solution-first, dual chains, falsifiable herrings, dual victory). Unassigned characters become host-voiced NPC suspects. |

## Run it

```bash
cd web
npm install
# optional, for live generation:
# export ANTHROPIC_API_KEY=sk-ant-...
npm run dev
```

Open http://localhost:3000, create an event with ≥4 players, watch the room
write, then open the player links in separate tabs/phones.

## Prototype shortcuts (vs. the production architecture in docs/)

- **In-memory store** stands in for Firestore (`src/lib/store.ts`); events
  reset on server restart. Realtime listeners are simulated with polling.
- **No auth** — player URLs stand in for single-use invite tokens. The
  player API route *does* enforce server-side data partitioning (no solution,
  no unreleased evidence, no other players' secrets ever leave the server).
- **No media pipeline** — image/TTS generation is specified in docs but not
  wired; evidence is rendered text/descriptions.
- The consolidated 4-call pipeline stands in for the full 11-agent room; the
  prompt scaffolds in `src/lib/agents/prompts.ts` mirror the production
  templates in `docs/03-agent-architecture.md`.
