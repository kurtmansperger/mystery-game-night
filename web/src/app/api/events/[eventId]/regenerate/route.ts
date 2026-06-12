import { NextRequest, NextResponse } from "next/server";
import { getEvent, saveEvent } from "@/lib/store";
import { runPipeline } from "@/lib/agents/orchestrator";

// Whole-story reroll: keeps the host's config and genome, sends everything
// else back to the Writers' Room. Allowed from review (host wasn't delighted)
// or failed (retry after an aborted/interrupted run).

export async function POST(_req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const event = getEvent(eventId);
  if (!event) {
    return NextResponse.json({ error: { code: "notFound", message: "Event not found." } }, { status: 404 });
  }
  if (event.status !== "review" && event.status !== "failed") {
    return NextResponse.json(
      { error: { code: "badState", message: `Cannot reroll from '${event.status}' — only before the event starts.` } },
      { status: 409 }
    );
  }

  event.status = "generating";
  event.checkpoints = [];
  event.package = undefined;
  event.quality = undefined;
  event.continuity = undefined;
  event.error = undefined;
  event.runtime = { currentBeat: -1, releasedEvidence: [], accusations: [], log: [] };
  saveEvent(event);

  void runPipeline(event);
  return NextResponse.json({ ok: true });
}
