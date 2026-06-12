# Mystery Game Night

An AI-powered platform for interactive mystery experiences — murder mystery
parties written by an AI Writers' Room, custom-built for your group, played
in person with phones as props rather than the show.

> Every guest a suspect. Every party an original.

## Repository layout

| Path | What it is |
|---|---|
| [`docs/`](./docs/00-overview.md) | Complete product & technical architecture: PRD, system architecture, AI Writers' Room agent architecture + prompt templates, Firestore & Story Bible schemas, security model, API design, wireframes, MVP definition, Phase 2 roadmap, monetization. |
| [`web/`](./web/README.md) | First working prototype — Next.js + TypeScript + Tailwind. Full product loop: host wizard → staged AI generation with live checkpoints → continuity & quality gates → review/refine → live beat-by-beat runtime → player phones → accusations, reveal, scoreboard. |

## Quick start

```bash
cd web
npm install
npm run dev          # offline demo mystery, no key needed
# export ANTHROPIC_API_KEY=...   # for live Claude Writers' Room generation
```

Open http://localhost:3000 and host a mystery.

## The pitch in one paragraph

Box-kit murder mysteries are generic, single-use, and turn the host into a
stressed rules engine. Mystery Game Night generates a bespoke mystery for your
exact group — characters written for your friends, a solution fixed before the
first clue exists (fair by construction, machine-checked), evidence and drama
paced across acts, and a host dashboard with exactly three live verbs:
*advance, reveal, nudge*. The deepest design commitments are in
[docs/00-overview.md](./docs/00-overview.md), including the assumptions we
deliberately rejected (no live AI plot generation at runtime; fixed truth with
variable outcomes; documents over image-gen; the host is a director, not a
sysadmin).
