import type { Character, MysteryPackage, QualityReport } from "../types";
import type { CheckpointFn, GenerationContext, WritersRoomProvider } from "./provider";
import { LAST_VINTAGE } from "../sample/lastVintage";

// Offline Writers' Room: serves the hand-authored benchmark mystery so the
// full product loop (create → generate → refine → run → finale) works with no
// API key. Characters beyond the player count stay in the story as host-voiced
// NPC suspects — the same mechanism production uses for no-shows.

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function adaptToEvent(ctx: GenerationContext): MysteryPackage {
  const pkg: MysteryPackage = JSON.parse(JSON.stringify(LAST_VINTAGE));
  const players = ctx.config.players;
  pkg.characters.forEach((c, i) => {
    c.assignedPlayer = players[i]?.name; // undefined → host-voiced NPC
  });
  return pkg;
}

async function generate(ctx: GenerationContext, checkpoint: CheckpointFn): Promise<MysteryPackage> {
  const beat = async (stage: Parameters<CheckpointFn>[0], label: string) => {
    checkpoint(stage, label);
    await sleep(700);
  };

  await beat("premise", "Showrunner pitched the premise: a 50th-anniversary gala no one will forget.");
  await beat("solution", "The crime has been committed. The room knows who. (You'll know when you choose to.)");
  await beat("world", "Worldbuilder closed the only road out — a storm is rolling in.");
  await beat("cast", `Character Writer cast your ${ctx.config.players.length} players. Everyone has something to hide.`);
  await beat("evidence", "Mystery Writer planted the evidence chains — and two beautiful red herrings.");
  await beat("drama", "Drama Writer choreographed the confrontations. Beat 6 is going to be a scene.");
  await beat("beats", "Pacing Agent scheduled the night across three acts.");

  return adaptToEvent(ctx);
}

async function refineCharacter(
  _ctx: GenerationContext,
  pkg: MysteryPackage,
  characterId: string,
  instructions: string
): Promise<{ character: Character; continuityNote: string }> {
  await sleep(900);
  const original = pkg.characters.find((c) => c.id === characterId);
  if (!original) throw new Error(`Unknown character: ${characterId}`);
  const character: Character = JSON.parse(JSON.stringify(original));
  character.voice.howToPlayMe = `${character.voice.howToPlayMe} Host direction: ${instructions}`;
  character.publicPersona = `${character.publicPersona} (Host refinement applied: ${instructions})`;
  return {
    character,
    continuityNote:
      "Offline demo provider applied the direction as a flavor note. With ANTHROPIC_API_KEY set, the Character Writer agent rewrites the character and the Continuity Editor verifies the change against the Story Bible.",
  };
}

async function judge(_ctx: GenerationContext, pkg: MysteryPackage): Promise<QualityReport> {
  await sleep(700);
  const promptCount = pkg.beats.reduce((n, b) => n + b.prompts.length, 0);
  const scores = {
    story: 88,
    characters: Math.min(95, 60 + pkg.characters.length * 4),
    mystery: 90,
    engagement: Math.min(92, 50 + promptCount * 2),
    genomeFit: 84,
    replayability: 80,
  };
  const composite = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length);
  return {
    scores,
    composite,
    verdict: composite >= 70 ? "pass" : "fail",
    mostMemorableMoment:
      "Beat 6: the blackmail note and the 6:15 photograph land together — the room's lead suspect is exonerated by his own disgrace, and every eye turns to the woman who never left the terrace. Except she did.",
  };
}

export const mockProvider: WritersRoomProvider = {
  name: "offline-demo (set ANTHROPIC_API_KEY for live generation)",
  generate,
  refineCharacter,
  judge,
};
