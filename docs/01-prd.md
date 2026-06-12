# Product Requirements Document

**Product:** Mystery Game Night — AI-Powered Interactive Mystery Experience Platform
**Status:** v1.0 (MVP scope marked throughout; see [06-roadmap](./06-roadmap-and-monetization.md))

---

## 1. Problem & Opportunity

Murder mystery parties are beloved and broken. Box kits and PDF downloads offer:

- Generic characters that fit nobody in the room
- One static script with zero replayability (someone always knows the ending)
- A host who spends the evening as a stressed rules administrator
- Mysteries that are either unsolvable or trivially obvious
- No accommodation for group size, runtime, kids, or tone

Meanwhile, the bar for "a great night with friends" has been raised by escape
rooms, prestige TV, and premium experiences like *Knives Out* watch parties.
People want **bespoke**: a story about *their* group, at *their* difficulty, in
*their* theme.

**Opportunity:** Generative AI makes bespoke narrative economically possible for
the first time. The platform that wins is the one whose stories are *good* — not
the one with the most features.

## 2. Target Users

| Persona | Description | Primary need |
|---|---|---|
| **The Host** (buyer) | Organizes game nights, birthdays, holiday parties, team events. 25–45, plans 1–6 events/year. | Look like a genius with minimal prep; stay in control without working all night. |
| **The Player** | Invited guest. Anywhere from theater-kid extrovert to quiet observer. | A role that fits, a reason to talk to people, a fair shot at solving it. |
| **The Enthusiast** | Mystery/puzzle devotee (Hunt A Killer, escape room regulars). | Genuinely hard, genuinely fair deduction. |
| **The Corporate Organizer** (Phase 2) | HR/team-lead running offsites. | Zero-risk content, inclusive roles, invoicing. |

## 3. Experience Modes

The host picks a mode (or blend). Modes are **generation parameter presets**, not
separate products — they configure the Story Genome, difficulty knobs, and
content mix.

| Mode | Difficulty | Clue density | Red herring ratio | Hint policy | Content emphasis |
|---|---|---|---|---|---|
| **Party** | Low | High, obvious | Low (playful) | Proactive | Humor, roleplay prompts, social missions |
| **Story** | Moderate | Medium | Medium | On request | Relationship arcs, dramatic reveals, emotional beats |
| **Detective** | High | Medium, layered | High | Sparse | Evidence analysis, interrogation, deduction |
| **Puzzle** | High | Dense, structured | High, falsifiable | Tiered ladder | Documents, ciphers, timelines, contradictions |
| **Expert** | Maximum | Sparse, interlocking | Maximum | Nearly none | Multi-step inference chains, layered motives |

**Hybrid modes:** the host can blend (e.g., 80% Party / 20% Detective). Blending
interpolates the numeric difficulty parameters and instructs the Writers' Room on
content ratio ("mostly comedic social play; one meaty evidence chain for the
table's resident detective").

### Mode-specific guarantees

- **Party:** every player gets ≥3 funny roleplay prompts and ≥1 social mission; the mystery is solvable from conversation alone.
- **Puzzle/Expert:** every deduction step is documented in the solvability proof (see §6); zero hints required for a competent group.
- **All modes:** the culprit is fixed at generation; evidence is sufficient; red herrings are falsifiable.

## 4. Story Genome System

Every story is generated from a **Story Genome**: 16 weighted dimensions (0–100)
plus structural parameters. The genome is the contract between host intent and
the Writers' Room — every agent receives it and is judged against it.

**Thematic dimensions:** betrayal, romance, family conflict, revenge, corporate
greed, hidden identity, blackmail, political intrigue, treasure hunting,
espionage, comedy, tragedy, suspense, adventure, horror, supernatural.

**Structural parameters (derived from mode + host choices):**

```
difficulty: 1–5            clueDensity: low|med|high     redHerringRatio: 0–0.5
hintPolicy: proactive|onRequest|tiered|none
contentRating: family|teen|adult
pacing: { acts: 3, beatsPerAct: 3–6, runtimeMinutes: 60–180 }
```

Rules:
- Hosts adjust dimensions directly (sliders) or implicitly (theme/tone choices map to genome deltas — "haunted mansion" raises supernatural + suspense).
- The Quality Judge scores generated content *against the genome* ("host asked for 85 comedy; this script is grim").
- `contentRating: family` hard-caps horror/tragedy and converts murder to theft/sabotage/disappearance plots.

## 5. Host Customization (Co-Creation)

The host is a co-creator and is never locked into generated content.

| Surface | Capabilities |
|---|---|
| **Theme** | Free-text ("Knives Out at a yacht club", "1980s ski lodge", "startup acquisition gone wrong") + curated gallery. |
| **Tone** | Silly → lighthearted → family → dramatic → serious → dark → suspenseful (multi-select with weights). |
| **Runtime** | 60 / 90 / 120 / 180 min / multi-session (Phase 2). Drives act and beat counts. |
| **Players** | 4–12 (MVP). Names + optional notes ("Jess is shy", "Marcus and Dana are married", "Sam is 11"). |
| **Character refinement** | Rename, reassign, regenerate one character, or refine with natural language: "make her more sarcastic", "make him secretly related to the victim", "turn this role into a retired naval officer". Refinements run through the Continuity Editor so a change can't break the mystery. |
| **Inside jokes / real life** | Free-text notes woven in by the Character Writer ("reference the camping trip disaster"). |
| **Regeneration** | Whole-story reroll keeps the genome; targeted reroll keeps everything else fixed. |

**Constraint engine:** host edits that would break solvability (e.g., "make the
culprit's alibi airtight") are flagged with a plain-language explanation and an
offered alternative — never silently rejected, never silently applied.

## 6. Fair Mystery Guarantee (the core quality mechanic)

The platform's signature promise: **surprising but inevitable.**

1. **Solution-first generation.** The Mystery Writer generates culprit, motive,
   means, and opportunity *first*, then builds the evidence graph backward from
   the solution. The culprit is never selected at the end.
2. **Evidence graph.** Every fact needed to convict is a node; edges are
   inference steps. Each node maps to ≥1 discoverable evidence item with a
   planned release beat and discovering player(s).
3. **Solvability proof.** The Continuity Editor must produce a machine-checked
   derivation: from the set of evidence released by the final act, the culprit is
   identifiable via ≥2 independent inference chains, and **no innocent character
   survives the same derivation** (every red herring has a planted exoneration).
4. **Knowledge ledger.** The Story Bible tracks who can know what, when. No
   character briefing contains information that character couldn't know; no clue
   contradicts a prior clue.
5. **Quality gate.** The Quality Judge scores the mystery (see
   [03-agent-architecture](./03-agent-architecture.md)); below-threshold stories
   are revised or regenerated before the host ever sees them.

## 7. Dual Victory System

Every player pursues two scores:

- **Group objective:** solve the mystery (final accusation, with stated motive/means/opportunity).
- **Personal objectives:** 2–4 character goals — protect a secret, recover an item, get a named character to admit something, broker an alliance.

Tension is by design: objectives are generated to *cross-cut* the investigation
(your alibi witness is the person blackmailing you). A player can solve the
murder and fail their character, or win their character's game while sheltering
the culprit. The finale scores both, so a quiet player who nailed their personal
arc gets a podium moment alongside the table's Poirot.

**Scoring at finale:**
- Group: accusation correctness (culprit / motive / means each scored).
- Personal: objectives completed, secrets kept vs. exposed.
- Awards generated per game ("Best Performance", "Most Devious", "The One Who Knew All Along") so everyone leaves with a story about themselves.

## 8. Host Workflow (Deliverable 6)

```
CREATE ──► GENERATE ──► REFINE ──► INVITE ──► PRE-EVENT ──► RUN ──► FINALE ──► AFTERMATH
```

1. **Create (5 min).** Pick mode/blend, theme, tone, runtime, content rating;
   enter player names + notes; tweak genome sliders (optional — defaults are good).
2. **Generate (3–10 min, async).** Watch the Writers' Room work: live progress
   ("Mystery Writer is planting the second red herring…"). Email when done.
3. **Refine.** Review story summary (with optional spoiler shield — see below),
   cast list, and per-character cards. Rename, reassign, regenerate, or NL-refine.
   Approve when delighted.
4. **Invite.** Themed invitations emailed per player: character intro, costume
   suggestions, what-to-know, a teaser secret, optional pre-event activity.
   RSVP tracking; replacement characters generated for dropouts.
5. **Pre-event.** Anticipation drip (optional): an in-character message 2 days
   out, a "news article" the morning of.
6. **Run.** Host dashboard: timeline of acts/beats, three live verbs
   (*advance / reveal / nudge*), Pacing Agent suggestions, engagement heatmap,
   panic button. Audio plays through the host's speaker; evidence pushes to
   player phones or is pre-printed.
7. **Finale.** Trigger final accusations → group vote → reveal narration (audio)
   → dual-victory scoreboard → awards.
8. **Aftermath.** Recap page ("the story so far, the story you never saw"),
   shareable awards, photo wall, one-tap "host another".

**Spoiler shield:** hosts choose *Director Mode* (sees everything, including the
solution) or *Player-Host Mode* (gets a character too; refinement views redact
the solution; the dashboard shows beat titles, not secrets). Default: Director.

## 9. Player Workflow (Deliverable 7)

1. **Invitation (email, days before).** Theme art, character name + hook,
   costume suggestion, three things you know, one secret teaser. No app install —
   magic link.
2. **Character briefing (web, before event).** Full dossier: backstory, public
   persona, relationships ("you trust Margaux; you owe Theo money"), secrets,
   objectives, "how to play me" tips with sample lines for nervous players.
3. **During the event (phone, glanceable).** Private dashboard:
   - **Now card:** the one thing to do right now ("Find out where Bianca was at 6 PM — she'll lie.")
   - Objectives tracker, evidence wallet, secrets vault, relationship map
   - Private deliveries: a note slipped to *you*, an audio voicemail only *you* hear
   - Accusation composer (finale only)
   Sessions are designed for <60 seconds of screen time per glance; nudges arrive
   when the Player Experience Agent detects a player idling outside the action.
4. **Finale.** Submit accusation (culprit + motive + means), group vote, reveal,
   personal scorecard, awards.
5. **After.** Recap from *your character's* point of view — what you knew, what
   you never found out, what was happening behind your back. This is the artifact
   people share.

## 10. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Story quality | Quality Judge gate ≥ threshold before host review; <5% host full-rerolls long-term target. |
| Generation time | P50 < 5 min, P95 < 12 min for full pipeline including media. |
| Runtime latency | Beat advance → all player screens updated < 2 s (Firestore listeners). |
| Resilience | Event runs offline-tolerant: all act content prefetched to clients at act start; printable evidence pack always available. |
| Privacy | Player secrets unreadable by other players (enforced server-side, not just UI); see security model. |
| Accessibility | Full text alternatives for audio; dyslexia-friendly evidence fonts; no color-only signals. |
| Cost | Marginal generation cost per event tracked per agent; budget ceiling aborts to graceful degradation (fewer hero images, never fewer story passes). |

## 11. Success Metrics

- **Quality:** post-event host NPS; "would replay" %; Quality Judge score distribution; full-reroll rate.
- **Engagement:** % players who submit a final accusation; % personal objectives attempted; median idle-gap per player (target < 8 min).
- **Business:** events created → run conversion; repeat-host rate at 90 days; referral rate from player recap pages (players become hosts).

## 12. Out of Scope (MVP)

Remote/hybrid play, 13–20 players, multi-session campaigns, live AI NPC actors,
marketplace for community mysteries, native mobile apps, languages beyond
English. All addressed in [Phase 2](./06-roadmap-and-monetization.md).
