// Core domain model — a prototype-scale slice of the full Story Bible schema
// documented in docs/04-database-schema.md.

export type ModeId = "party" | "story" | "detective" | "puzzle" | "expert";

export interface StoryGenome {
  betrayal: number;
  romance: number;
  familyConflict: number;
  revenge: number;
  corporateGreed: number;
  hiddenIdentity: number;
  blackmail: number;
  politicalIntrigue: number;
  treasureHunting: number;
  espionage: number;
  comedy: number;
  tragedy: number;
  suspense: number;
  adventure: number;
  horror: number;
  supernatural: number;
}

export interface EventConfig {
  theme: string;
  tone: string;
  modeBlend: Partial<Record<ModeId, number>>; // weights, sum to 1
  runtimeMinutes: 60 | 90 | 120 | 180;
  contentRating: "family" | "teen" | "adult";
  players: { name: string; note?: string }[];
}

export interface DerivedParams {
  difficulty: 1 | 2 | 3 | 4 | 5;
  clueDensity: "low" | "medium" | "high";
  redHerringRatio: number;
  hintPolicy: "proactive" | "onRequest" | "tiered" | "none";
  acts: number;
}

export interface Secret {
  id: string;
  text: string;
  category: "crimeWeb" | "personal";
}

export interface Objective {
  id: string;
  text: string;
  type: "protect" | "obtain" | "extract" | "broker";
  successCriteria: string;
}

export interface Relationship {
  characterId: string;
  publicLabel: string;
  privateTruth: string;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  publicPersona: string;
  privateSelf: string;
  connectionToVictim: string;
  costume: string;
  secrets: Secret[];
  objectives: Objective[];
  relationships: Relationship[];
  voice: { sampleLines: string[]; tic: string; howToPlayMe: string };
  whatToKnow: string[];
  assignedPlayer?: string;
}

export interface EvidenceItem {
  id: string;
  title: string;
  type: "document" | "physical" | "testimony" | "photo" | "audio";
  content: string; // rendered body text (documents) or description
  discoveryFraming: string;
  releaseBeat: number; // index into beats
  pointsTo: string; // which inference this supports, in plain language
  falsifies?: string; // red herring this exonerates, if any
}

export interface Beat {
  id: string;
  act: number;
  title: string;
  hostScript: string; // what the host reads aloud / does
  hostNotes: string;
  prompts: { characterId: string; text: string }[]; // private "Now" cards
  releasesEvidence: string[]; // evidence ids
  skippable: boolean;
}

export interface Solution {
  culpritId: string;
  motive: string;
  means: string;
  opportunity: string;
  staging: string;
  intendedMisread: string;
  revealNarration: string;
}

export interface MysteryPackage {
  title: string;
  logline: string;
  tonalNorthStar: string;
  setting: string;
  whyTonight: string;
  victim: { name: string; role: string; description: string };
  characters: Character[];
  evidence: EvidenceItem[];
  beats: Beat[];
  solution: Solution;
  hintLadder: string[]; // tiered hints toward the solution
  awards: { title: string; criteria: string }[];
}

// ——— Pipeline & runtime ———

export type PipelineStage =
  | "premise"
  | "solution"
  | "world"
  | "cast"
  | "evidence"
  | "drama"
  | "beats"
  | "continuityGate"
  | "qualityGate";

export interface Checkpoint {
  stage: PipelineStage;
  label: string; // spoiler-safe teaser shown to the host
  at: string;
  ok: boolean;
}

export interface QualityReport {
  scores: Record<string, number>;
  composite: number;
  verdict: "pass" | "fail";
  mostMemorableMoment: string;
}

export interface ContinuityReport {
  verdict: "pass" | "fail";
  checks: { name: string; ok: boolean; detail: string }[];
}

export interface Accusation {
  playerName: string;
  culpritId: string;
  motive: string;
  submittedAt: string;
  correct?: boolean;
}

export type EventStatus =
  | "draft"
  | "generating"
  | "review"
  | "live"
  | "finale"
  | "completed"
  | "failed";

export interface MysteryEvent {
  id: string;
  status: EventStatus;
  /** Link credentials: host link carries keys.host, player links carry keys.players[characterId].
   *  Enforced when REQUIRE_ACCESS_KEYS=1 (production); open in local dev. */
  keys: { host: string; players: Record<string, string> };
  config: EventConfig;
  genome: StoryGenome;
  derived: DerivedParams;
  checkpoints: Checkpoint[];
  package?: MysteryPackage;
  quality?: QualityReport;
  continuity?: ContinuityReport;
  runtime: {
    currentBeat: number; // -1 before start
    releasedEvidence: string[];
    accusations: Accusation[];
    log: { at: string; entry: string }[];
  };
  error?: string;
  createdAt: string;
}
