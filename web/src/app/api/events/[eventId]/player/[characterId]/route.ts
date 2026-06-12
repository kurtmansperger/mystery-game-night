import { NextRequest, NextResponse } from "next/server";
import { getEvent } from "@/lib/store";
import { isPlayer } from "@/lib/access";

// Player-scoped read: the server strips everything this player must not see —
// other characters' private docs, unreleased evidence, the solution, other
// players' accusations. UI hiding is not a control (docs/02 §4).

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string; characterId: string }> }
) {
  const { eventId, characterId } = await params;
  const event = await getEvent(eventId);
  if (!event?.package || !isPlayer(event, characterId, req)) {
    return NextResponse.json({ error: { code: "notFound", message: "Event not ready." } }, { status: 404 });
  }
  const pkg = event.package;
  const me = pkg.characters.find((c) => c.id === characterId);
  if (!me) {
    return NextResponse.json({ error: { code: "notFound", message: "Character not found." } }, { status: 404 });
  }

  const beatIndex = event.runtime.currentBeat;
  const currentBeat = beatIndex >= 0 ? pkg.beats[beatIndex] : undefined;
  const finaleOpen = event.status === "finale";
  const completed = event.status === "completed";

  return NextResponse.json({
    eventStatus: event.status,
    title: pkg.title,
    logline: pkg.logline,
    setting: pkg.setting,
    victim: pkg.victim,
    me, // own dossier: secrets, objectives, relationships, voice
    cast: pkg.characters.map((c) => ({
      id: c.id,
      name: c.name,
      role: c.role,
      publicPersona: c.publicPersona,
      assignedPlayer: c.assignedPlayer ?? null,
    })),
    act: currentBeat?.act ?? null,
    beatTitle: currentBeat?.title ?? null,
    nowCard: currentBeat?.prompts.find((p) => p.characterId === characterId)?.text ?? null,
    evidence: pkg.evidence
      .filter((e) => event.runtime.releasedEvidence.includes(e.id))
      .map(({ id, title, type, content, discoveryFraming }) => ({ id, title, type, content, discoveryFraming })),
    finaleOpen,
    myAccusation: event.runtime.accusations.find((a) => a.playerName === me.assignedPlayer) ?? null,
    // Reveal & scoring ship only after the host runs the finale.
    reveal: completed
      ? {
          culpritId: pkg.solution.culpritId,
          culpritName: pkg.characters.find((c) => c.id === pkg.solution.culpritId)?.name,
          narration: pkg.solution.revealNarration,
          motive: pkg.solution.motive,
          means: pkg.solution.means,
        }
      : null,
  });
}
