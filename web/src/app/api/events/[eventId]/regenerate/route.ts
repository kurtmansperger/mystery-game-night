import { NextRequest, NextResponse } from "next/server";
import { getEvent, saveEvent } from "@/lib/store";
import { isHost } from "@/lib/access";
import { startGeneration } from "@/lib/generation";

// Whole-story reroll: keeps the host's config and genome, sends everything
// else back to the Writers' Room. Allowed from review (host wasn't delighted)
// or failed (retry after an aborted/interrupted run).

export async function POST(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const event = await getEvent(eventId);
  if (!event || !isHost(event, req)) {
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
  event.keys.players = {}; // reroll rotates player links; host key survives
  event.runtime = { currentBeat: -1, releasedEvidence: [], accusations: [], log: [] };
  await saveEvent(event);

  await startGeneration(event);
  return NextResponse.json({ ok: true });
}
