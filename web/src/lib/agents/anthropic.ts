import Anthropic from "@anthropic-ai/sdk";
import type { Character, MysteryPackage, QualityReport } from "../types";
import type { CheckpointFn, GenerationContext, WritersRoomProvider } from "./provider";
import { systemPrompt, hostInputBlock, TASKS } from "./prompts";

// Live Writers' Room on the Claude API. The prototype consolidates the
// nine-agent pipeline (docs/03-agent-architecture.md) into four structured
// calls: story spine → cast → mystery content → quality judge, with the
// machine continuity gate (validate.ts) between content and judge.

const MODEL = "claude-opus-4-8";
const client = new Anthropic();

// Per-call usage telemetry — the prototype slice of the pipeline tracing
// described in docs/02 §6. Consumed by scripts/live-smoke.ts for real
// cost-per-story numbers.
export interface AgentUsage {
  role: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreateTokens: number;
  ms: number;
}
export const usageLog: AgentUsage[] = [];

// — JSON-schema helpers (structured outputs require additionalProperties:false) —
type Schema = Record<string, unknown>;
const str: Schema = { type: "string" };
const num: Schema = { type: "number" };
const arr = (items: Schema): Schema => ({ type: "array", items });
const en = (...values: string[]): Schema => ({ type: "string", enum: values });
const obj = (properties: Record<string, Schema>): Schema => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});

const characterSchema = obj({
  id: str,
  name: str,
  role: str,
  publicPersona: str,
  privateSelf: str,
  connectionToVictim: str,
  costume: str,
  secrets: arr(obj({ id: str, text: str, category: en("crimeWeb", "personal") })),
  objectives: arr(obj({ id: str, text: str, type: en("protect", "obtain", "extract", "broker"), successCriteria: str })),
  relationships: arr(obj({ characterId: str, publicLabel: str, privateTruth: str })),
  voice: obj({ sampleLines: arr(str), tic: str, howToPlayMe: str }),
  whatToKnow: arr(str),
});

const spineSchema = obj({
  title: str,
  logline: str,
  tonalNorthStar: str,
  setting: str,
  whyTonight: str,
  victim: obj({ name: str, role: str, description: str }),
  solution: obj({
    culpritRole: str, // descriptive — bound to a characterId in the cast stage
    motive: str,
    means: str,
    opportunity: str,
    staging: str,
    intendedMisread: str,
    revealNarration: str,
  }),
});

const castSchema = obj({
  culpritId: str,
  characters: arr(characterSchema),
});

const contentSchema = obj({
  evidence: arr(
    obj({
      id: str,
      title: str,
      type: en("document", "physical", "testimony", "photo", "audio"),
      content: str,
      discoveryFraming: str,
      releaseBeat: num,
      pointsTo: str,
      falsifies: str, // "" when not an exoneration
    })
  ),
  beats: arr(
    obj({
      id: str,
      act: num,
      title: str,
      hostScript: str,
      hostNotes: str,
      prompts: arr(obj({ characterId: str, text: str })),
      releasesEvidence: arr(str),
      skippable: { type: "boolean" } as Schema,
    })
  ),
  hintLadder: arr(str),
  awards: arr(obj({ title: str, criteria: str })),
});

const judgeSchema = obj({
  scores: obj({ story: num, characters: num, mystery: num, engagement: num, genomeFit: num, replayability: num }),
  composite: num,
  verdict: en("pass", "fail"),
  mostMemorableMoment: str,
});

const refineSchema = obj({ character: characterSchema, continuityNote: str });

async function agentCall<T>(role: string, ctx: GenerationContext, task: string, context: string, schema: Schema): Promise<T> {
  const startedAt = Date.now();
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 32000,
    thinking: { type: "adaptive" },
    output_config: { format: { type: "json_schema", schema } },
    system: systemPrompt(role, ctx.config, ctx.genome, ctx.derived),
    messages: [{ role: "user", content: `${context}\n\n${task}` }],
  });
  const message = await stream.finalMessage();
  usageLog.push({
    role,
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
    cacheReadTokens: message.usage.cache_read_input_tokens ?? 0,
    cacheCreateTokens: message.usage.cache_creation_input_tokens ?? 0,
    ms: Date.now() - startedAt,
  });
  if (message.stop_reason === "refusal") {
    throw new Error("The model declined this generation request. Adjust the theme or tone and retry.");
  }
  const text = message.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") throw new Error("No structured output returned.");
  return JSON.parse(text.text) as T;
}

interface Spine {
  title: string; logline: string; tonalNorthStar: string; setting: string; whyTonight: string;
  victim: MysteryPackage["victim"];
  solution: Omit<MysteryPackage["solution"], "culpritId"> & { culpritRole: string };
}

async function generate(ctx: GenerationContext, checkpoint: CheckpointFn): Promise<MysteryPackage> {
  checkpoint("premise", "The Showrunner is pitching premises...");
  const spine = await agentCall<Spine>("Showrunner", ctx, TASKS.storySpine, hostInputBlock(ctx.config), spineSchema);
  checkpoint("solution", `Premise locked: "${spine.title}". The crime has been committed — the room knows who.`);

  checkpoint("cast", "The Character Writer is casting your friends...");
  const cast = await agentCall<{ culpritId: string; characters: Character[] }>(
    "Character Writer",
    ctx,
    TASKS.cast,
    `${hostInputBlock(ctx.config)}\n\n<story_bible_slice>\n${JSON.stringify(spine)}\n</story_bible_slice>`,
    castSchema
  );
  cast.characters.forEach((c, i) => (c.assignedPlayer = ctx.config.players[i]?.name));
  checkpoint("evidence", "Cast locked. The Mystery Writer is planting evidence chains and red herrings...");

  const content = await agentCall<Pick<MysteryPackage, "evidence" | "beats" | "hintLadder" | "awards">>(
    "Mystery Writer",
    ctx,
    TASKS.mysteryContent.replace("${acts}", String(ctx.derived.acts)),
    `<story_bible_slice>\n${JSON.stringify({ spine, characters: cast.characters, culpritId: cast.culpritId })}\n</story_bible_slice>`,
    contentSchema
  );
  checkpoint("drama", "Evidence graph complete. Confrontations choreographed.");
  checkpoint("beats", "The night is scheduled. Sending the draft to the editors...");

  const { culpritRole: _omit, ...solutionRest } = spine.solution;
  return {
    title: spine.title,
    logline: spine.logline,
    tonalNorthStar: spine.tonalNorthStar,
    setting: spine.setting,
    whyTonight: spine.whyTonight,
    victim: spine.victim,
    characters: cast.characters,
    evidence: content.evidence.map((e) => ({ ...e, falsifies: e.falsifies || undefined })),
    beats: content.beats,
    solution: { culpritId: cast.culpritId, ...solutionRest },
    hintLadder: content.hintLadder,
    awards: content.awards,
  };
}

async function refineCharacter(
  ctx: GenerationContext,
  pkg: MysteryPackage,
  characterId: string,
  instructions: string
): Promise<{ character: Character; continuityNote: string }> {
  const original = pkg.characters.find((c) => c.id === characterId);
  if (!original) throw new Error(`Unknown character: ${characterId}`);
  const slice = {
    character: original,
    victim: pkg.victim,
    isCulprit: pkg.solution.culpritId === characterId,
    castNames: pkg.characters.map((c) => ({ id: c.id, name: c.name, role: c.role })),
  };
  const result = await agentCall<{ character: Character; continuityNote: string }>(
    "Character Writer",
    ctx,
    TASKS.refine(instructions),
    `<story_bible_slice>\n${JSON.stringify(slice)}\n</story_bible_slice>`,
    refineSchema
  );
  result.character.id = characterId; // identity is structural; never rewritten
  result.character.assignedPlayer = original.assignedPlayer;
  return result;
}

async function revise(ctx: GenerationContext, pkg: MysteryPackage, critique: string): Promise<MysteryPackage> {
  const spine = {
    title: pkg.title, logline: pkg.logline, tonalNorthStar: pkg.tonalNorthStar,
    setting: pkg.setting, whyTonight: pkg.whyTonight, victim: pkg.victim,
    solution: pkg.solution,
  };
  const critiqueBlock = `<critique>\nAn earlier draft failed an editorial gate. Fix EVERY issue below while preserving everything that works:\n${critique}\n</critique>`;

  // Cast-stage failures (dead roles, culprit position) require recasting
  // before the content pass; everything else is content-stage.
  let characters = pkg.characters;
  let culpritId = pkg.solution.culpritId;
  if (/bystander|first four|culprit/i.test(critique)) {
    const cast = await agentCall<{ culpritId: string; characters: Character[] }>(
      "Character Writer (revision)",
      ctx,
      `${TASKS.cast}\n\nThis is a REVISION of the existing cast below — repair it, do not start over.\n<existing_cast>${JSON.stringify(pkg.characters)}</existing_cast>`,
      `${hostInputBlock(ctx.config)}\n\n<story_bible_slice>${JSON.stringify(spine)}</story_bible_slice>\n\n${critiqueBlock}`,
      castSchema
    );
    cast.characters.forEach((c, i) => (c.assignedPlayer = ctx.config.players[i]?.name));
    characters = cast.characters;
    culpritId = cast.culpritId;
  }

  const content = await agentCall<Pick<MysteryPackage, "evidence" | "beats" | "hintLadder" | "awards">>(
    "Mystery Writer (revision)",
    ctx,
    `${TASKS.mysteryContent.replace("${acts}", String(ctx.derived.acts))}\n\nThis is a REVISION — the previous draft is below. Repair it against the critique; keep what works.\n<previous_draft>${JSON.stringify({ evidence: pkg.evidence, beats: pkg.beats })}</previous_draft>`,
    `<story_bible_slice>${JSON.stringify({ spine, characters, culpritId })}</story_bible_slice>\n\n${critiqueBlock}`,
    contentSchema
  );

  return {
    ...pkg,
    characters,
    solution: { ...pkg.solution, culpritId },
    evidence: content.evidence.map((e) => ({ ...e, falsifies: e.falsifies || undefined })),
    beats: content.beats,
    hintLadder: content.hintLadder,
    awards: content.awards,
  };
}

async function judge(ctx: GenerationContext, pkg: MysteryPackage): Promise<QualityReport> {
  // The judge sees only host/player-visible content plus the solution —
  // never the authoring rationale (anti-sycophancy, docs/03 §4.7).
  const visible = {
    title: pkg.title, logline: pkg.logline, setting: pkg.setting,
    victim: pkg.victim, characters: pkg.characters, evidence: pkg.evidence,
    beats: pkg.beats, solution: pkg.solution,
  };
  return agentCall<QualityReport>(
    "Quality Judge",
    ctx,
    TASKS.judge,
    `<story_bible_slice>\n${JSON.stringify(visible)}\n</story_bible_slice>`,
    judgeSchema
  );
}

export const anthropicProvider: WritersRoomProvider = {
  name: `claude writers' room (${MODEL})`,
  generate,
  refineCharacter,
  judge,
  revise,
};
