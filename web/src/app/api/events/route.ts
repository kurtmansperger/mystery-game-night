import { NextRequest, NextResponse } from "next/server";
import type { EventConfig, MysteryEvent, StoryGenome } from "@/lib/types";
import { defaultGenome, deriveParams } from "@/lib/genome";
import { listEvents, newId, saveEvent } from "@/lib/store";
import { runPipeline } from "@/lib/agents/orchestrator";

export async function GET() {
  const events = listEvents().map((e) => ({
    id: e.id,
    status: e.status,
    title: e.package?.title ?? e.config.theme,
    players: e.config.players.length,
    createdAt: e.createdAt,
  }));
  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const config: EventConfig = {
    theme: String(body.theme ?? "").slice(0, 500) || "A 50th-anniversary gala at a family winery",
    tone: String(body.tone ?? "dramatic with dry humor").slice(0, 200),
    modeBlend: body.modeBlend ?? { party: 0.7, detective: 0.3 },
    runtimeMinutes: [60, 90, 120, 180].includes(body.runtimeMinutes) ? body.runtimeMinutes : 120,
    contentRating: ["family", "teen", "adult"].includes(body.contentRating) ? body.contentRating : "teen",
    players: Array.isArray(body.players)
      ? body.players
          .slice(0, 12)
          .map((p: { name?: string; note?: string }) => ({
            name: String(p.name ?? "").slice(0, 60),
            note: p.note ? String(p.note).slice(0, 200) : undefined,
          }))
          .filter((p: { name: string }) => p.name)
      : [],
  };
  if (config.players.length < 4) {
    return NextResponse.json(
      { error: { code: "invalid", message: "At least 4 named players are required.", hint: "Add players in step 3." } },
      { status: 400 }
    );
  }

  const genome: StoryGenome = body.genome ?? defaultGenome(config.modeBlend);
  const event: MysteryEvent = {
    id: newId(),
    status: "generating",
    config,
    genome,
    derived: deriveParams(config.modeBlend, config.runtimeMinutes),
    checkpoints: [],
    runtime: { currentBeat: -1, releasedEvidence: [], accusations: [], log: [] },
    createdAt: new Date().toISOString(),
  };
  saveEvent(event);

  // Fire-and-forget; the client follows progress via GET polling
  // (Firestore listeners in production — docs/02 §2).
  void runPipeline(event);

  return NextResponse.json({ id: event.id }, { status: 201 });
}
