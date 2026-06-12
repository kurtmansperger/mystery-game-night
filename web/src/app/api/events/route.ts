import { NextRequest, NextResponse } from "next/server";
import type { EventConfig, MysteryEvent, StoryGenome } from "@/lib/types";
import { defaultGenome, deriveParams } from "@/lib/genome";
import { listEvents, newId, newKey, saveEvent } from "@/lib/store";
import { keysEnforced } from "@/lib/access";
import { startGeneration } from "@/lib/generation";

export async function GET() {
  // With access keys enforced (public deployment), there is no anonymous
  // event listing — links are the only way in. Open locally for convenience.
  if (keysEnforced()) return NextResponse.json({ events: [] });
  const events = (await listEvents()).map((e) => ({
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
    keys: { host: newKey(), players: {} },
    config,
    genome,
    derived: deriveParams(config.modeBlend, config.runtimeMinutes),
    checkpoints: [],
    runtime: { currentBeat: -1, releasedEvidence: [], accusations: [], log: [] },
    createdAt: new Date().toISOString(),
  };
  await saveEvent(event);

  // Cloud Tasks queue in production; in-process locally (docs/07 stage 3).
  await startGeneration(event);

  return NextResponse.json({ id: event.id, hostKey: event.keys.host }, { status: 201 });
}
