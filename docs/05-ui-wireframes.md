# UI Wireframes

Mobile-first. Design language: "prestige playbill" — rich dark surfaces, warm
accent (brass/amber), serif display type for fiction, sans for chrome. The
fiction is always typographically distinct from the interface.

---

## 1. Host — Event Creation Wizard (mobile)

```
┌──────────────────────────────┐  ┌──────────────────────────────┐  ┌──────────────────────────────┐
│ ●○○○  New Mystery            │  │ ○●○○  The Feel               │  │ ○○●○  The Cast               │
│                              │  │                              │  │                              │
│ What kind of night?          │  │ Theme                        │  │ Who's coming?  (4–12)        │
│ ┌──────────┐ ┌──────────┐    │  │ ┌──────────────────────────┐ │  │ ┌──────────────────────────┐ │
│ │ 🎉 PARTY │ │ 🎭 STORY │    │  │ │ "Knives Out at a yacht   │ │  │ │ Jess        ✎ shy, first │ │
│ │ laughs & │ │ drama &  │    │  │ │  club…"                  │ │  │ │             timer        │ │
│ │ roleplay │ │ secrets  │    │  │ └──────────────────────────┘ │  │ ├──────────────────────────┤ │
│ └──────────┘ └──────────┘    │  │ or pick: [Ski Lodge '85]     │  │ │ Marcus ♥ Dana  ✎ married │ │
│ ┌──────────┐ ┌──────────┐    │  │ [Haunted Manor] [Gala] [+]   │  │ ├──────────────────────────┤ │
│ │ 🔍 DETECT│ │ 🧩 PUZZLE│    │  │                              │  │ │ Sam         ✎ age 11     │ │
│ └──────────┘ └──────────┘    │  │ Tone                         │  │ │ + add player             │ │
│      [ ⚖ blend modes… ]      │  │ silly ──────●─── suspenseful │  │ └──────────────────────────┘ │
│                              │  │ Rating  (family)(teen)(adult)│  │ notes shape their characters │
│ Runtime (60)(90)(120)(180)   │  │                              │  │                              │
│                              │  │ ▸ Story Genome (advanced)    │  │                              │
│              [ Continue ▸ ]  │  │   betrayal ▮▮▮▮▮▮▮▮░░  80    │  │       [ ◂ ] [ Summon the     │
│                              │  │   comedy   ▮▮▮░░░░░░░  35    │  │             Writers' Room ▸] │
└──────────────────────────────┘  └──────────────────────────────┘  └──────────────────────────────┘
```

## 2. Host — Generation (the Writers' Room writes, live)

```
┌──────────────────────────────┐
│ The Writers' Room is in      │   Progress is theater: each checkpoint posts an
│ session…              ⏳ 4:12 │   in-fiction teaser, never spoilers.
│                              │
│ ✓ Showrunner pitched the     │
│   premise: a 50th-anniversary│
│   gala no one will forget    │
│ ✓ The crime has been         │
│   committed. We know who.    │
│   (You'll know when you      │
│    choose to.)               │
│ ● Mystery Writer is planting │
│   the second red herring…    │
│ ○ Casting your friends       │
│ ○ Continuity attack          │
│ ○ Quality review             │
│                              │
│ ☕ ~4 min left — we'll email  │
│    you when it's ready       │
└──────────────────────────────┘
```

## 3. Host — Review & Refine

```
┌────────────────────────────────────────────┐
│ THE LAST VINTAGE            quality ★ 87   │
│ A 50th-anniversary gala at Rosewood Estate │
│                                            │
│ [Story] [Cast] [Evidence] [Timeline] [⚙]   │
│ ────────────────────────────────────────── │
│ 🙈 Spoiler shield: Director mode (on)      │
│                                            │
│ CAST                            8 players  │
│ ┌────────────────────────────────────────┐ │
│ │ ◐ Margaux Rosewood  → Jess             │ │
│ │   Heir apparent & COO                  │ │
│ │   "how to play me": one icy sentence…  │ │
│ │   [↻ regenerate] [✎ refine] [⇄ assign] │ │
│ └────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────┐ │
│ │ ✎ refine: "make her more sarcastic"___ │ │
│ │            [apply — continuity-checked]│ │
│ └────────────────────────────────────────┘ │
│                                            │
│      [ ↻ Reroll story ]  [ ✓ Approve &     │
│                             send invites ] │
└────────────────────────────────────────────┘
```

## 4. Player — Invitation email → Character briefing

```
EMAIL                                WEB BRIEFING (magic link)
┌───────────────────────────┐        ┌──────────────────────────────┐
│ [hero art: gala at dusk]  │        │ MARGAUX ROSEWOOD             │
│ You are cordially         │        │ [portrait]                   │
│ summoned to ROSEWOOD      │        │ Heir apparent & COO          │
│ ESTATE — July 18, 7 PM    │        │ ────────────────────────────│
│                           │        │ WHO YOU ARE      ▾           │
│ You will attend as        │        │ YOUR RELATIONSHIPS ▾         │
│ MARGAUX ROSEWOOD,         │        │  Theo — brother. You cover   │
│ heir apparent.            │        │  for him. You're done.       │
│                           │        │ WHAT TO WEAR     ▾           │
│ Wear: power suit, vintage │        │ 🔒 YOUR SECRETS  (tap & hold)│
│ brooch.                   │        │ 🎯 YOUR OBJECTIVES ▾         │
│ Know: the estate vote is  │        │ 💬 HOW TO PLAY ME            │
│ tonight.                  │        │  "Three sample lines if      │
│ One more thing… you've    │        │   you're nervous: …"         │
│ been lying to your mother.│        │                              │
│ [ Open your briefing ▸ ]  │        │ [ I'm ready for tonight ✓ ]  │
└───────────────────────────┘        └──────────────────────────────┘
```

## 5. Player — Live event (glanceable; <60s per look)

```
┌──────────────────────────────┐
│ ACT II · The Cellar Door     │ ← phase strip (always orienting)
│ ╔══════════════════════════╗ │
│ ║ NOW                      ║ │ ← the one thing to do right now
│ ║ Find out where Bianca    ║ │
│ ║ was at 6 PM. She'll lie. ║ │
│ ║              [done ✓]    ║ │
│ ╚══════════════════════════╝ │
│ ● New evidence: Key Log  ▸   │ ← tap to view, badge clears
│ ● A note was slipped to you ▸│
│                              │
│ [🎯 Goals 2/4] [🗂 Evidence 6]│
│ [🔒 Secrets]  [👥 People]    │
│                              │
│ ⚠ Put the phone down. Talk   │
│   to Bianca.                 │ ← the app pushes you back into the room
└──────────────────────────────┘

EVIDENCE WALLET (tap 🗂)             ACCUSATION (finale only)
┌──────────────────────────────┐    ┌──────────────────────────────┐
│ 🗂 Key Log    · doc  · NEW   │    │ FINAL ACCUSATION             │
│ 🍷 Wine glass · photo        │    │ I accuse… [ choose suspect ] │
│ 🎙 Voicemail  · audio 0:38   │    │ Because…  [ motive, 1 line ] │
│ tap any item → full screen,  │    │ By means… [ how, 1 line ]    │
│ zoomable, share-to-table     │    │ [ Submit — no edits after ]  │
└──────────────────────────────┘    └──────────────────────────────┘
```

## 6. Host — Live control dashboard (tablet/laptop)

```
┌──────────────────────────────────────────────────────────────┐
│ THE LAST VINTAGE · LIVE        ⏱ 1:12 / 2:00   [⏸] [🆘 panic] │
│ ──────────────────────────────────────────────────────────── │
│ ACT I ───●─── ACT II ──○──○──○─── ACT III ──○──○── FINALE    │
│            now: 2.3 The Cellar Door                          │
│                                                              │
│ ┌─ NEXT UP ────────────────────┐ ┌─ TABLE HEAT ────────────┐ │
│ │ Beat 2.4 · The Confrontation │ │ Jess    ▮▮▮▮▮▮  active  │ │
│ │ releases: voicemail (Theo)   │ │ Marcus  ▮▮▮▮    ok      │ │
│ │ [ ▶ ADVANCE ]                │ │ Sam     ▮▮      idle 9m │ │
│ └──────────────────────────────┘ │  └ [ ✉ nudge Sam ]      │ │
│ ┌─ PACING AGENT ───────────────┐ └─────────────────────────┘ │
│ │ 💡 You're 12 min behind.     │ ┌─ REVEAL ────────────────┐ │
│ │ Beat 2.4 is skippable.       │ │ 🔑 Key Log   [reveal]   │ │
│ │ [skip it] [keep it] [why?]   │ │ 🎙 Voicemail [reveal]   │ │
│ └──────────────────────────────┘ │ 🔊 Announcement [play ▶]│ │
│                                  └─────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```
Three live verbs (advance / reveal / nudge) + panic. Everything else is glass.

## 7. Finale & Aftermath

```
REVEAL (room watches host screen,     PLAYER SCORECARD (own phone)
narration audio plays)                ┌──────────────────────────────┐
┌──────────────────────────────┐      │ JESS as MARGAUX ROSEWOOD     │
│ [suspect board: 8 portraits] │      │ 🕵 Accusation: CORRECT ✓     │
│ votes tally in live…         │      │    motive ✓  means ✗         │
│ ▶ "It was the daughter who   │      │ 🎯 Objectives: 3 of 4        │
│    smiled all evening…"      │      │ 🔒 Secrets kept: 1 of 2      │
│ portraits dim one by one     │      │ 🏆 AWARD: "The One Who       │
│ until one remains…           │      │    Knew All Along"           │
└──────────────────────────────┘      │ [ ▸ What you never found out]│
                                      │ [ share recap ] [host next →]│
                                      └──────────────────────────────┘
```

## 8. Print Pack (phones-down support)

One-click PDF: character table tents, sealed secret envelopes (fold-and-tape),
evidence cards with QR fallback, host cheat-sheet. Layout uses the same
playbill design language so paper and screen feel like one production.
