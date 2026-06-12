# MVP Definition, Phase 2 Roadmap & Monetization

---

## 1. MVP Definition (Deliverable 13)

**MVP thesis:** prove one thing — *AI can write a mystery party people rave
about.* Everything that doesn't test that claim is cut.

### In

| Area | Scope |
|---|---|
| Modes | Party, Detective, and blends of the two (covers the social↔puzzle spectrum) |
| Players | 4–12, single session, English, in-person |
| Generation | Full Writers' Room text pipeline with both gates; hero images (invitation, portraits, map, 4–8 evidence photos); TTS narration + per-player voicemails; HTML/print evidence documents |
| Host | Wizard → live-progress generation → review/refine (rename, reassign, NL refine, regenerate character, reroll story) → invitations via email → live dashboard (advance/reveal/nudge/panic) |
| Player | Magic-link briefing, live phone experience (Now card, evidence wallet, secrets, objectives, deliveries), accusation, scorecard + recap |
| Fairness | Solution-first generation, knowledge ledger, machine-checked solvability proof, falsifiable herrings |
| Ops | Print pack, no-show absorption, offline prefetch, audit log |

### Out (deliberately)

Story/Puzzle/Expert presets as named modes (the dials exist; the marketing
doesn't), multi-session, 13–20 players, remote play, host marketplace, native
apps, Player-Host spoiler mode (Director only at MVP), localization.

### MVP success gate (go/no-go for Phase 2)

- ≥ 50 completed real-world events
- Host NPS ≥ 50; ≥ 60% of players submit a final accusation
- Correct-accusation rate between 25–75% across Detective-weighted events
  (below = unfair, above = too easy — this range *is* the product working)
- ≥ 30% of hosts run a second event within 90 days

### Build order (12 weeks, 3 engineers + founder-PM)

1. **Wks 1–3:** Schema + Story Bible + pipeline skeleton with mock provider; sample mystery hand-authored as the quality benchmark (the prototype in `web/` is this milestone).
2. **Wks 3–6:** Real Writers' Room (text), both gates, solvability validator; internal playtests with paper handouts.
3. **Wks 6–9:** Host console + player PWA + runtime verbs on Firebase; email invitations.
4. **Wks 9–12:** Media pipeline (images/TTS), print pack, refinement UX, 10 supervised beta parties, polish from telemetry.

Playtests start week 3 with humans, paper, and a script — story quality risk is
retired before most code exists.

## 2. Phase 2 Roadmap (Deliverable 14)

**P2.1 — Depth (months 4–6)**
- Puzzle & Expert modes (cipher/document puzzle library, tiered hint ladders surfaced in UI)
- Player-Host spoiler mode; co-host role
- 13–20 players via faction architecture; multi-session campaigns (persistent Bible across nights)
- Replay packs: same cast, new mystery, returning world ("Rosewood Estate, one year later")

**P2.2 — Breadth (months 6–9)**
- Corporate/teams product: SSO, invoicing, content-safety presets, facilitator mode, 2×10-player parallel pods
- Genre expansions as curated genome presets: spy thriller, heist (no-murder), fantasy intrigue, sci-fi, holiday seasonal drops
- Localization (ES, FR, DE); remote/hybrid play (video-call-native runtime)

**P2.3 — Platform (months 9–12)**
- Creator tools: publish your refined mystery as a template; revenue share
- Live AI NPC (an interrogatable suspect voiced by TTS — built on the same fixed-truth guarantee: it can lie, but only along authored lines)
- Photo-wall + highlight reel generation; public recap pages as the viral loop
- API/white-label for venues (escape rooms, wineries, cruise lines, hotels)

## 3. Monetization Strategy (Deliverable 15)

**Model: per-event pricing, not subscription.** Hosting is episodic (1–6×/year);
subscriptions churn. Charge where the value spikes — the event — and price
against the alternatives: a box kit ($30–60, generic) and an escape room
($30–40/person).

| Tier | Price | What you get |
|---|---|---|
| **Free Taste** | $0 | 4-player, 60-min Party-mode event, no media, watermark recaps. The demo *is* the funnel. |
| **Party** | $39/event | Up to 8 players, full text pipeline, invitations, print pack, 1 reroll |
| **Premiere** | $79/event | Up to 12 players, hero images + full audio, unlimited refinements, 3 rerolls, replay pack discount |
| **Host's Circle** (sub, later) | $149/yr | 4 Premiere credits + seasonal drops + early genres — for the 20% who host 4+/year |
| **Teams** | $25/seat, $300 min | Corporate features, facilitator, invoicing |

**Margin math:** Premiere COGS ≈ $4–8 (LLM + media + email) → ~90% gross
margin; the budget-ceiling/degradation system in the pipeline protects this.

**Growth loops:**
1. Every player gets a personal recap page → "host your own" CTA (8–12 exposed prospects per event).
2. Awards/recaps designed for social sharing.
3. Seasonal spikes (Halloween, NYE, holiday office parties) — drop curated genome presets ahead of each.

**Pricing risks & mitigations:** reroll abuse → quality gate keeps rerolls rare,
caps make them an upsell; piracy of generated kits → low risk, value is the
*live runtime* + bespoke cast, not the PDF.
