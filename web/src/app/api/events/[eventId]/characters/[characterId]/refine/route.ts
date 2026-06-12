import { NextRequest, NextResponse } from "next/server";
import { getEvent, saveEvent } from "@/lib/store";
import { getProvider } from "@/lib/agents/provider";
import { isHost } from "@/lib/access";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string; characterId: string }> }
) {
  const { eventId, characterId } = await params;
  const event = await getEvent(eventId);
  if (!event?.package || !isHost(event, req)) {
    return NextResponse.json({ error: { code: "notFound", message: "Event not ready." } }, { status: 404 });
  }
  if (event.status !== "review") {
    return NextResponse.json(
      { error: { code: "badState", message: "Characters can only be refined during review, before the event starts." } },
      { status: 409 }
    );
  }
  const { instructions } = await req.json();
  if (!instructions || String(instructions).trim().length < 3) {
    return NextResponse.json({ error: { code: "invalid", message: "Tell the Writers' Room what to change." } }, { status: 400 });
  }

  try {
    const provider = await getProvider();
    const ctx = { config: event.config, genome: event.genome, derived: event.derived };
    const { character, continuityNote } = await provider.refineCharacter(
      ctx,
      event.package,
      characterId,
      String(instructions).slice(0, 1000)
    );
    const index = event.package.characters.findIndex((c) => c.id === characterId);
    event.package.characters[index] = character;
    await saveEvent(event);
    return NextResponse.json({ character, continuityNote });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "refineFailed", message: err instanceof Error ? err.message : "Refinement failed." } },
      { status: 500 }
    );
  }
}
