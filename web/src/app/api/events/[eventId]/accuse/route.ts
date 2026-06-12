import { NextRequest, NextResponse } from "next/server";
import { getEvent, saveEvent } from "@/lib/store";

export async function POST(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const event = getEvent(eventId);
  if (!event?.package) {
    return NextResponse.json({ error: { code: "notFound", message: "Event not ready." } }, { status: 404 });
  }
  if (event.status !== "finale") {
    return NextResponse.json({ error: { code: "badState", message: "Accusations are not open yet." } }, { status: 409 });
  }
  const body = await req.json();
  const playerName = String(body.playerName ?? "").slice(0, 60);
  const culpritId = String(body.culpritId ?? "");
  const motive = String(body.motive ?? "").slice(0, 500);
  if (!playerName || !event.package.characters.some((c) => c.id === culpritId)) {
    return NextResponse.json({ error: { code: "invalid", message: "Pick a suspect." } }, { status: 400 });
  }
  if (event.runtime.accusations.some((a) => a.playerName === playerName)) {
    return NextResponse.json({ error: { code: "conflict", message: "Accusation already submitted — no edits after." } }, { status: 409 });
  }
  event.runtime.accusations.push({ playerName, culpritId, motive, submittedAt: new Date().toISOString() });
  event.runtime.log.push({ at: new Date().toISOString(), entry: `${playerName} submitted a final accusation.` });
  saveEvent(event);
  return NextResponse.json({ ok: true });
}
