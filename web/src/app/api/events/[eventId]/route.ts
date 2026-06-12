import { NextRequest, NextResponse } from "next/server";
import { getEvent } from "@/lib/store";
import { isHost } from "@/lib/access";

// Host (director-mode) view of an event — includes the solution and the
// player link keys. Requires the host key when enforcement is on.

export async function GET(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const event = await getEvent(eventId);
  if (!event || !isHost(event, req)) {
    return NextResponse.json({ error: { code: "notFound", message: "Event not found." } }, { status: 404 });
  }
  return NextResponse.json(event);
}
