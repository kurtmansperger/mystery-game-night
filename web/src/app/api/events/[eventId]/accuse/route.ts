import { NextRequest, NextResponse } from "next/server";
import { getEvent, saveEvent } from "@/lib/store";
import { isPlayer } from "@/lib/access";

// Accusations are submitted AS a character (authorized by that player's link
// key); the player name is derived server-side from the cast assignment.

export async function POST(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const event = await getEvent(eventId);
  if (!event?.package) {
    return NextResponse.json({ error: { code: "notFound", message: "Event not ready." } }, { status: 404 });
  }
  if (event.status !== "finale") {
    return NextResponse.json({ error: { code: "badState", message: "Accusations are not open yet." } }, { status: 409 });
  }
  const body = await req.json();
  const characterId = String(body.characterId ?? "");
  const culpritId = String(body.culpritId ?? "");
  const motive = String(body.motive ?? "").slice(0, 500);

  const me = event.package.characters.find((c) => c.id === characterId);
  if (!me?.assignedPlayer || !isPlayer(event, characterId, req)) {
    return NextResponse.json({ error: { code: "forbidden", message: "Not your accusation to make." } }, { status: 403 });
  }
  if (!event.package.characters.some((c) => c.id === culpritId)) {
    return NextResponse.json({ error: { code: "invalid", message: "Pick a suspect." } }, { status: 400 });
  }
  if (event.runtime.accusations.some((a) => a.playerName === me.assignedPlayer)) {
    return NextResponse.json({ error: { code: "conflict", message: "Accusation already submitted — no edits after." } }, { status: 409 });
  }
  event.runtime.accusations.push({
    playerName: me.assignedPlayer,
    culpritId,
    motive,
    submittedAt: new Date().toISOString(),
  });
  event.runtime.log.push({ at: new Date().toISOString(), entry: `${me.assignedPlayer} submitted a final accusation.` });
  await saveEvent(event);
  return NextResponse.json({ ok: true });
}
