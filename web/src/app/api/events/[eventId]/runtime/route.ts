import { NextRequest, NextResponse } from "next/server";
import { getEvent, saveEvent } from "@/lib/store";
import { isHost } from "@/lib/access";

// Host runtime verbs: start / advance / reveal / finale / complete.
// Idempotent-ish for the prototype; production adds Idempotency-Key + audit
// (docs/02 §3).

export async function POST(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const event = await getEvent(eventId);
  if (!event?.package || !isHost(event, req)) {
    return NextResponse.json({ error: { code: "notFound", message: "Event not ready." } }, { status: 404 });
  }
  const pkg = event.package;
  const body = await req.json();
  const op: string = body.op;
  const log = (entry: string) => event.runtime.log.push({ at: new Date().toISOString(), entry });

  const releaseBeatEvidence = (beatIndex: number) => {
    for (const id of pkg.beats[beatIndex]?.releasesEvidence ?? []) {
      if (!event.runtime.releasedEvidence.includes(id)) {
        event.runtime.releasedEvidence.push(id);
        log(`Evidence released: ${pkg.evidence.find((e) => e.id === id)?.title ?? id}`);
      }
    }
  };

  switch (op) {
    case "start": {
      if (event.status !== "review") {
        return NextResponse.json({ error: { code: "badState", message: `Cannot start from '${event.status}'.` } }, { status: 409 });
      }
      event.status = "live";
      event.runtime.currentBeat = 0;
      releaseBeatEvidence(0);
      log(`Event started — Act 1, "${pkg.beats[0].title}"`);
      break;
    }
    case "advance": {
      if (event.status !== "live") {
        return NextResponse.json({ error: { code: "badState", message: "Event is not live." } }, { status: 409 });
      }
      const next = event.runtime.currentBeat + 1;
      if (next >= pkg.beats.length) {
        return NextResponse.json({ error: { code: "badState", message: "Already at the final beat — open the finale." } }, { status: 409 });
      }
      event.runtime.currentBeat = next;
      releaseBeatEvidence(next);
      log(`Advanced to Act ${pkg.beats[next].act}, beat "${pkg.beats[next].title}"`);
      if (next === pkg.beats.length - 1) {
        event.status = "finale";
        log("Finale beat reached — accusations are open.");
      }
      break;
    }
    case "reveal": {
      const item = pkg.evidence.find((e) => e.id === body.evidenceId);
      if (!item) {
        return NextResponse.json({ error: { code: "notFound", message: "Evidence not found." } }, { status: 404 });
      }
      if (!event.runtime.releasedEvidence.includes(item.id)) {
        event.runtime.releasedEvidence.push(item.id);
        log(`Host revealed early: ${item.title}`);
      }
      break;
    }
    case "complete": {
      if (event.status !== "finale") {
        return NextResponse.json({ error: { code: "badState", message: "Finale is not open." } }, { status: 409 });
      }
      for (const a of event.runtime.accusations) {
        a.correct = a.culpritId === pkg.solution.culpritId;
      }
      event.status = "completed";
      log("Reveal played. The night belongs to the scoreboard now.");
      break;
    }
    default:
      return NextResponse.json({ error: { code: "invalid", message: `Unknown op '${op}'.` } }, { status: 400 });
  }

  await saveEvent(event);
  return NextResponse.json({ ok: true, status: event.status, currentBeat: event.runtime.currentBeat });
}
