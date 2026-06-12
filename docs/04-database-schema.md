# Database Schema & Story Bible Schema

Firestore (document model). Conventions: `camelCase` fields, ISO-8601
timestamps, soft state machines as string enums. Security partitioning
rationale in [02-technical-architecture §4](./02-technical-architecture.md).

---

## 1. Collection Layout

```
users/{userId}                                host accounts, billing ref, preferences
events/{eventId}                              event root (public-to-members metadata)
  members/{memberId}                          role bindings (host/cohost/player)
  players/{playerId}                          invitation + RSVP + engagement state
  characters/{characterId}                    public character card
    private/briefing                          dossier: secrets, objectives, voice (player + host)
    private/promptDeck                        conditional prompt deck (server → delivered items only)
  bible/core                                  STORY BIBLE (server-only; see §3)
  bible/solution                              culprit/truth (server + director-host reads via function)
  evidence/{evidenceId}                       public shell: { title, type, releasedAt? }
    private/payload                           content + media refs (key-released on reveal)
  beats/{beatId}                              act/beat manifests (server-only until opened)
  runtime/state                               live state machine doc (member-readable, server-writable)
  deliveries/{playerId}/items/{itemId}        per-player pushed content (prompts, whispers, keys)
  accusations/{playerId}                      write-only until finale flag
  votes/{ballotId}/casts/{playerId}
  audit/{entryId}                             every verb & edit (host-readable post-event subset)
pipelines/{jobId}                             generation job: status, checkpoints, traces ref
assets/{assetId}                              media registry → Cloud Storage paths, signed URL meta
promptVersions/{versionId}                    prompt lineage for the quality flywheel
telemetry/* → BigQuery export                 judge scores, edits, NPS (analytics, not runtime)
```

### events/{eventId}

```jsonc
{
  "title": "The Last Vintage",
  "status": "draft|generating|review|published|preEvent|live|finale|completed|cancelled",
  "hostId": "users/abc",
  "config": {
    "modeBlend": { "party": 0.7, "detective": 0.3 },       // weights sum to 1
    "theme": "50th anniversary gala at a family winery",
    "tones": ["dramatic", "lighthearted"],
    "runtimeMinutes": 120,
    "contentRating": "teen",
    "playerCount": 8,
    "spoilerMode": "director|playerHost"
  },
  "genome": { "betrayal": 80, "familyConflict": 90, "comedy": 35, /* …16 dims */ },
  "derived": { "difficulty": 3, "clueDensity": "med", "redHerringRatio": 0.3,
               "hintPolicy": "onRequest", "acts": 3 },
  "qualityReport": { "composite": 87, "scores": { /* 7 axes */ }, "version": 2 },
  "scheduledFor": "2026-07-18T23:00:00Z",
  "createdAt": "...", "publishedAt": "..."
}
```

### characters/{characterId} (public card) + private/briefing

```jsonc
// public card — readable by all members
{ "name": "Margaux Rosewood", "role": "Heir apparent & COO",
  "publicPersona": "...", "portraitAssetId": "...", "costume": "...",
  "assignedPlayerId": "players/p2" }

// private/briefing — player + host only
{ "privateSelf": "...", "connectionToVictim": "...",
  "secrets": [{ "id": "s1", "text": "...", "category": "crimeWeb|personal",
                "knownBy": ["characters/theo"], "exposureCost": "..." }],
  "objectives": [{ "id": "o1", "text": "...", "type": "protect|obtain|extract|broker",
                   "successCriteria": "...", "conflictsWith": ["characters/elena#o2"] }],
  "relationships": [{ "characterId": "...", "publicLabel": "sister",
                      "privateTruth": "rivals for the estate", "leverage": "..." }],
  "voice": { "sampleLines": ["..."], "tic": "...", "howToPlayMe": "..." },
  "whatToKnow": ["..."], "preEventActivity": "..." }
```

### evidence/{evidenceId}

```jsonc
// public shell
{ "title": "Pesticide cabinet key log", "type": "document|physical|testimony|photo|audio",
  "icon": "ledger", "releasedAt": null }
// private/payload (encrypted blob prefetched; key delivered on reveal)
{ "content": { "renderTemplate": "ledger", "body": "...", "assetId": null },
  "pointsToSteps": ["step4"], "falsifies": ["herring2"],
  "releaseBeat": "act2.beat3", "carriers": ["characters/elena", "characters/marcus"],
  "discoveryFraming": "Found taped behind the storeroom door." }
```

### beats/{beatId} (manifest = what the runtime executes)

```jsonc
{ "act": 2, "index": 3, "title": "The Cellar Door",
  "openConditions": { "afterBeat": "act2.beat2", "minutesIntoAct": 25 },
  "onOpen": [
    { "op": "releaseEvidence", "evidenceId": "ev-keylog" },
    { "op": "playAudio", "target": "host", "assetId": "aud-announcement-2" },
    { "op": "deliverPrompt", "playerId": "p4", "promptId": "deck-elena-7" },
    { "op": "startVote", "ballotId": "lockTheCellar", "durationSec": 180 }
  ],
  "hostNotes": "If the table hasn't questioned Theo yet, nudge p3 first.",
  "skippable": true, "contingencyFor": null }
```

### runtime/state, deliveries, accusations

```jsonc
// runtime/state — single realtime doc all clients listen to
{ "phase": "live", "currentAct": 2, "currentBeat": "act2.beat3",
  "clock": { "startedAt": "...", "pausedAt": null, "offsetMs": 0 },
  "releasedEvidence": ["ev-glass", "ev-keylog"],
  "openBallots": ["lockTheCellar"],
  "engagement": { "p1": { "lastActiveAt": "...", "idleScore": 0.2 } },
  "pacingSuggestions": [{ "id": "...", "text": "12 min behind — beat 2.4 is skippable",
                          "action": { "op": "skipBeat", "beatId": "act2.beat4" } }] }

// deliveries/{playerId}/items/{itemId}
{ "kind": "prompt|whisper|evidenceKey|audio", "payload": { /* … */ },
  "deliveredAt": "...", "ackedAt": null }

// accusations/{playerId}
{ "culpritId": "...", "motive": "...", "means": "...", "submittedAt": "...",
  "scored": { "culprit": true, "motive": true, "means": false } }
```

---

## 2. Pipeline & Asset Docs

```jsonc
// pipelines/{jobId}
{ "eventId": "...", "stage": "evidenceGraph",         // see pipeline stages doc 03 §3
  "status": "running|blocked|failed|complete",
  "checkpoints": [{ "stage": "solution", "at": "...", "ok": true,
                    "summaryForHost": "The crime has been committed…" }],
  "reviseLoops": { "continuity": 1, "quality": 0 },
  "spend": { "llmTokens": 412000, "images": 9, "ttsSeconds": 340, "usd": 4.91 },
  "traceRef": "gs://traces/..." }

// assets/{assetId}
{ "eventId": "...", "kind": "image|audio|printPack",
  "role": "portrait|map|crimeScene|invitation|narration|voicemail",
  "storagePath": "events/e1/assets/map.png",
  "brief": "...", "model": "...", "durationSec": 38 }
```

---

## 3. Story Bible Schema (`bible/core`) — Deliverable 5

The Bible is the single source of narrative truth. Server-only; every agent
call receives a *slice*; every merge is schema-validated and versioned.

```typescript
interface StoryBible {
  version: number;                    // bumped on every merged change
  changeLog: BibleChange[];           // { at, actor: agent|host, stage, summary, factsTouched[] }

  premise: {
    logline: string;
    tonalNorthStar: string;           // one sentence every agent writes toward
    whyTonight: string;               // the in-fiction pressure forcing the crime now
    victim: { name: string; role: string; lovedBecause: string[]; hatedBecause: string[] };
  };

  world: {
    setting: string; era: string;
    locations: { id: string; name: string; description: string;
                 props: string[]; mapAssetId?: string }[];
    institutions: { id: string; name: string; relevance: string }[];
    loreFacts: Fact[];
    rules: string[];                  // "no cell service at the estate" — constraints agents must honor
  };

  // ——— TRUTH (never mutated after continuity gate) ———
  solution: {
    culpritId: string;
    motive: { surface: string; root: string; dinnerTableTest: string };
    means: string; opportunity: string; staging: string;
    intendedMisread: string;          // what the room believes until the Act 1→2 turn
  };
  truthTimeline: TimelineEntry[];     // { time, characterId, location, action, verifiableBy[] }
                                      // the alibi lattice: one entry stream per character

  // ——— FACTS & KNOWLEDGE LEDGER (the fairness machine) ———
  facts: Fact[];
  /* Fact = {
       id: string; text: string;
       visibility: "public" | "hostOnly" | "hidden";
       knownBy: CharacterId[];               // who may reference it in play
       knowableBy: { characterId, how }[];   // who COULD learn it, and the route
       revealedByBeat?: BeatId;              // when it enters public knowledge
       supports?: InferenceStepId[];         // load-bearing for the proof?
     }
     Invariant (ledger check): no character-facing text references a fact whose
     knownBy/knowableBy excludes that character at that point in the timeline. */

  characters: CharacterEntry[];       // mirrors character docs + authorial notes
  relationships: { a: CharacterId; b: CharacterId; publicLabel: string;
                   privateTruth: string; leverage?: string; tension: number }[];

  evidenceGraph: {
    inferenceSteps: { id: string; fact: string; derivesFrom: string[];
                      evidenceIds: string[]; hintLadder: [string, string, string] }[];
    chains: string[][];               // ≥2 independent paths to the culprit
    redHerrings: { suspectId: string; hook: string; plantedEvidenceIds: string[];
                   exonerationEvidenceId: string }[];
    solvabilityProof?: SolvabilityProof;   // written by the Continuity Editor
  };

  objectives: { characterId: string; objectives: Objective[] }[];

  narrative: {
    acts: { index: number; title: string; turn: string;     // the recontextualizing turn
            beats: BeatRef[] }[];
    confrontations: Confrontation[];
    spotlightPlan: Record<CharacterId, BeatId>;
    endings: {                        // fixed truth, variable outcomes
      revealNarrationBase: string;    // master reveal script
      outcomeVariants: { condition: OutcomeCondition; narrationDelta: string }[];
      awards: { id: string; title: string; criteria: string }[];
    };
  };

  threads: { id: string; description: string;
             status: "active" | "resolved" | "redHerring";
             resolutionBeat?: BeatId }[];   // every active thread must resolve or be
                                            // explicitly a herring — no dangling plots

  worldState?: {                      // runtime-appended (the only post-publish writes)
    playerActions: { at: string; playerId: string; action: string }[];
    exposedSecrets: SecretId[];
  };
}
```

**Slicing rules (what each agent sees):** Character Writer gets premise, world,
solution, prior characters; Drama Writer gets all narrative-facing truth but
not hint ladders; Quality Judge gets only host/player-visible artifacts plus
solution; Visual/Audio Directors get rendered briefs without unreleased fact
text where avoidable. Slices keep prompts small and reduce leak surface.

---

## 4. Indexes & Operational Notes

- Composite indexes: `events(hostId, status)`, `deliveries items(playerId, deliveredAt)`,
  `pipelines(eventId, status)`.
- `runtime/state` is the only hot-write doc (~1 write per verb; well under
  Firestore's 1 write/sec/doc guidance for a 3-hour party).
- Bible docs can approach the 1 MiB doc limit for large casts → `bible/core`
  shards `facts` and `evidenceGraph` into subdocs past 700 KiB (the merge layer
  abstracts this).
- TTL policies: `deliveries` and `audit` 180 days; player PII purge job at 90
  days (keeps anonymized telemetry only).
