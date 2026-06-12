import { NextRequest, NextResponse } from "next/server";
import { getEvent } from "@/lib/store";

// Host (director-mode) view of an event — includes the solution.
// The player-scoped view lives at /player/[characterId] and never ships
// secrets that aren't the player's own (docs/02 §4).

export async function GET(_req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const event = getEvent(eventId);
  if (!event) {
    return NextResponse.json({ error: { code: "notFound", message: "Event not found." } }, { status: 404 });
  }
  return NextResponse.json(event);
}
