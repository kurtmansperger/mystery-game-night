import type {
  Character,
  Checkpoint,
  EventConfig,
  DerivedParams,
  MysteryPackage,
  PipelineStage,
  QualityReport,
  StoryGenome,
} from "../types";

export interface GenerationContext {
  config: EventConfig;
  genome: StoryGenome;
  derived: DerivedParams;
}

export type CheckpointFn = (stage: PipelineStage, label: string, ok?: boolean) => void;

export interface WritersRoomProvider {
  name: string;
  /** Run the full generation pipeline, emitting spoiler-safe checkpoints as it goes. */
  generate(ctx: GenerationContext, checkpoint: CheckpointFn): Promise<MysteryPackage>;
  /** Apply a natural-language refinement to one character (continuity-checked). */
  refineCharacter(
    ctx: GenerationContext,
    pkg: MysteryPackage,
    characterId: string,
    instructions: string
  ): Promise<{ character: Character; continuityNote: string }>;
  /** Independent quality review. */
  judge(ctx: GenerationContext, pkg: MysteryPackage): Promise<QualityReport>;
}

export function makeCheckpoint(stage: PipelineStage, label: string, ok = true): Checkpoint {
  return { stage, label, at: new Date().toISOString(), ok };
}

export async function getProvider(): Promise<WritersRoomProvider> {
  if (process.env.ANTHROPIC_API_KEY) {
    const { anthropicProvider } = await import("./anthropic");
    return anthropicProvider;
  }
  const { mockProvider } = await import("./mock");
  return mockProvider;
}
