import type { DerivedParams, ModeId, StoryGenome } from "./types";

export const GENOME_DIMENSIONS: (keyof StoryGenome)[] = [
  "betrayal", "romance", "familyConflict", "revenge", "corporateGreed",
  "hiddenIdentity", "blackmail", "politicalIntrigue", "treasureHunting",
  "espionage", "comedy", "tragedy", "suspense", "adventure", "horror",
  "supernatural",
];

export const MODES: { id: ModeId; label: string; tagline: string }[] = [
  { id: "party", label: "Party", tagline: "Laughs, roleplay, easy mystery" },
  { id: "story", label: "Story", tagline: "Drama, relationships, reveals" },
  { id: "detective", label: "Detective", tagline: "Evidence, deduction, red herrings" },
  { id: "puzzle", label: "Puzzle", tagline: "Documents, timelines, codes" },
  { id: "expert", label: "Expert", tagline: "Interlocking clues, minimal hints" },
];

const MODE_GENOME: Record<ModeId, Partial<StoryGenome>> = {
  party: { comedy: 75, suspense: 35, betrayal: 40, familyConflict: 45 },
  story: { familyConflict: 70, romance: 55, betrayal: 65, tragedy: 45, suspense: 55 },
  detective: { suspense: 75, betrayal: 70, blackmail: 55, hiddenIdentity: 60 },
  puzzle: { suspense: 70, hiddenIdentity: 65, blackmail: 50, espionage: 35 },
  expert: { suspense: 80, betrayal: 75, hiddenIdentity: 70, blackmail: 60 },
};

const MODE_DIFFICULTY: Record<ModeId, number> = {
  party: 1, story: 2, detective: 4, puzzle: 4, expert: 5,
};

export function defaultGenome(blend: Partial<Record<ModeId, number>>): StoryGenome {
  const genome = Object.fromEntries(GENOME_DIMENSIONS.map((d) => [d, 20])) as unknown as StoryGenome;
  for (const [mode, weight] of Object.entries(blend) as [ModeId, number][]) {
    for (const [dim, value] of Object.entries(MODE_GENOME[mode] ?? {})) {
      const k = dim as keyof StoryGenome;
      genome[k] = Math.min(100, Math.round(genome[k] + value * weight));
    }
  }
  return genome;
}

export function deriveParams(
  blend: Partial<Record<ModeId, number>>,
  runtimeMinutes: number
): DerivedParams {
  let difficulty = 0;
  let total = 0;
  for (const [mode, weight] of Object.entries(blend) as [ModeId, number][]) {
    difficulty += MODE_DIFFICULTY[mode] * weight;
    total += weight;
  }
  difficulty = total > 0 ? difficulty / total : 2;
  const d = Math.max(1, Math.min(5, Math.round(difficulty))) as DerivedParams["difficulty"];
  return {
    difficulty: d,
    clueDensity: d >= 4 ? "medium" : "high",
    redHerringRatio: [0, 0.1, 0.2, 0.3, 0.4, 0.5][d],
    hintPolicy: d <= 1 ? "proactive" : d <= 3 ? "onRequest" : d === 4 ? "tiered" : "none",
    acts: runtimeMinutes <= 60 ? 2 : 3,
  };
}

export function describeBlend(blend: Partial<Record<ModeId, number>>): string {
  return Object.entries(blend)
    .filter(([, w]) => (w ?? 0) > 0)
    .map(([m, w]) => `${Math.round((w ?? 0) * 100)}% ${m}`)
    .join(" / ");
}
