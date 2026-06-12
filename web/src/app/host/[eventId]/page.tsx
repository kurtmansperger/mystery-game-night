"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import type { MysteryEvent } from "@/lib/types";

export default function HostDashboard({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const [event, setEvent] = useState<MysteryEvent | null>(null);
  const [spoilers, setSpoilers] = useState(false);
  const [busy, setBusy] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/events/${eventId}`);
    if (res.ok) setEvent(await res.json());
  }, [eventId]);

  useEffect(() => {
    load();
    pollRef.current = setInterval(load, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [load]);

  async function verb(op: string, extra: Record<string, unknown> = {}) {
    setBusy(true);
    await fetch(`/api/events/${eventId}/runtime`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ op, ...extra }),
    });
    await load();
    setBusy(false);
  }

  if (!event) return <p className="text-faded">Loading…</p>;

  if (event.status === "generating") return <GeneratingView event={event} />;
  if (event.status === "failed")
    return (
      <div className="card border-red-900">
        <h1 className="font-display text-xl text-red-400">The Writers&apos; Room hit a wall</h1>
        <p className="text-sm text-faded mt-2">{event.error}</p>
      </div>
    );

  const pkg = event.package!;
  const beat = event.runtime.currentBeat >= 0 ? pkg.beats[event.runtime.currentBeat] : null;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-widest text-faded">{event.status} · {event.config.players.length} players · {event.config.runtimeMinutes} min</div>
          <h1 className="font-display text-3xl text-brass-bright mt-1">{pkg.title}</h1>
          <p className="text-faded text-sm mt-1 max-w-2xl font-display italic">{pkg.logline}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {event.quality && (
            <div className="card !py-2 !px-3 text-sm">
              Quality <span className="text-brass-bright font-bold">★ {event.quality.composite}</span>
            </div>
          )}
          <button className="btn-ghost !py-1 !px-2 text-xs" onClick={() => setSpoilers(!spoilers)}>
            {spoilers ? "🙉 Director mode: solution visible" : "🙈 Spoiler shield on — tap to direct"}
          </button>
        </div>
      </header>

      {spoilers && (
        <div className="card border-wine bg-panel2">
          <div className="label !text-brass">The solution (director&apos;s eyes only)</div>
          <p className="text-sm">
            <span className="text-brass-bright font-semibold">
              {pkg.characters.find((c) => c.id === pkg.solution.culpritId)?.name}
            </span>{" "}
            — {pkg.solution.motive}
          </p>
          <p className="text-sm text-faded mt-2"><b>Means:</b> {pkg.solution.means}</p>
          <p className="text-sm text-faded mt-1"><b>Opportunity:</b> {pkg.solution.opportunity}</p>
          <p className="text-sm text-faded mt-1"><b>The misread:</b> {pkg.solution.intendedMisread}</p>
        </div>
      )}

      {event.status === "review" && <ReviewPanel event={event} eventId={eventId} onChanged={load} onStart={() => verb("start")} busy={busy} />}

      {(event.status === "live" || event.status === "finale") && beat && (
        <section className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="card">
              <div className="label">Act {beat.act} · Beat {event.runtime.currentBeat + 1} of {pkg.beats.length}</div>
              <h2 className="font-display text-2xl text-brass-bright">{beat.title}</h2>
              <p className="mt-3 font-display text-lg leading-relaxed">{beat.hostScript}</p>
              <p className="mt-3 text-xs text-faded border-t border-line pt-2">📋 {beat.hostNotes}</p>
            </div>
            <div className="card">
              <div className="label">Private prompts delivered this beat</div>
              <ul className="space-y-2 text-sm">
                {beat.prompts.map((p, i) => {
                  const c = pkg.characters.find((ch) => ch.id === p.characterId);
                  return (
                    <li key={i} className="flex gap-2">
                      <span className="text-brass shrink-0">{c?.name}{c?.assignedPlayer ? ` (${c.assignedPlayer})` : " (NPC)"}:</span>
                      <span className="text-faded">{p.text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            {event.status === "live" && (
              <button className="btn w-full py-3" disabled={busy} onClick={() => verb("advance")}>
                ▶ Advance to next beat
              </button>
            )}
            {event.status === "finale" && (
              <div className="card border-brass">
                <div className="label">Finale — accusations open</div>
                <p className="text-sm text-faded">
                  {event.runtime.accusations.length} of {event.config.players.length} accusations in:{" "}
                  {event.runtime.accusations.map((a) => a.playerName).join(", ") || "none yet"}
                </p>
                <button className="btn mt-3 w-full" disabled={busy} onClick={() => verb("complete")}>
                  🎭 Play the reveal
                </button>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <EvidencePanel event={event} onReveal={(id) => verb("reveal", { evidenceId: id })} busy={busy} />
            <LogPanel event={event} />
          </div>
        </section>
      )}

      {event.status === "completed" && <FinaleView event={event} />}

      {event.status !== "review" && <PlayerLinks event={event} eventId={eventId} />}
    </div>
  );
}

function GeneratingView({ event }: { event: MysteryEvent }) {
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="font-display text-2xl text-brass-bright">The Writers&apos; Room is in session…</h1>
      <p className="text-faded text-sm mt-1">Progress is theater. Spoilers are not.</p>
      <ol className="mt-6 space-y-3">
        {event.checkpoints.map((c, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className={c.ok ? "text-brass" : "text-red-400"}>{c.ok ? "✓" : "✗"}</span>
            <span className={i === event.checkpoints.length - 1 ? "text-parchment" : "text-faded"}>{c.label}</span>
          </li>
        ))}
        <li className="flex gap-3 text-sm text-faded animate-pulse">
          <span>●</span><span>…</span>
        </li>
      </ol>
    </div>
  );
}

function ReviewPanel({
  event, eventId, onChanged, onStart, busy,
}: { event: MysteryEvent; eventId: string; onChanged: () => void; onStart: () => void; busy: boolean }) {
  const pkg = event.package!;
  const [refining, setRefining] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  async function refine(characterId: string) {
    setWorking(true);
    setNote(null);
    const res = await fetch(`/api/events/${eventId}/characters/${characterId}/refine`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instructions: instruction }),
    });
    const data = await res.json();
    setNote(res.ok ? `✓ ${data.continuityNote}` : `✗ ${data.error?.message}`);
    setWorking(false);
    setInstruction("");
    onChanged();
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="label">The setting</div>
        <p className="font-display">{pkg.setting}</p>
        <p className="text-sm text-faded mt-2"><b className="text-brass">Why tonight:</b> {pkg.whyTonight}</p>
        <p className="text-sm text-faded mt-1"><b className="text-brass">The victim:</b> {pkg.victim.name}, {pkg.victim.role}. {pkg.victim.description}</p>
      </div>

      {event.continuity && (
        <div className="card">
          <div className="label">Continuity Editor&apos;s report — {event.continuity.verdict.toUpperCase()}</div>
          <ul className="grid sm:grid-cols-2 gap-1 text-xs">
            {event.continuity.checks.map((c) => (
              <li key={c.name} className={c.ok ? "text-faded" : "text-red-400"} title={c.detail}>
                {c.ok ? "✓" : "✗"} {c.name}
              </li>
            ))}
          </ul>
          {event.quality && (
            <p className="text-xs text-faded mt-3 border-t border-line pt-2">
              <b className="text-brass">Quality Judge:</b> “{event.quality.mostMemorableMoment}”
            </p>
          )}
        </div>
      )}

      <div>
        <div className="label">The cast — rename, refine, regenerate</div>
        <div className="grid sm:grid-cols-2 gap-3">
          {pkg.characters.map((c) => (
            <div key={c.id} className="card">
              <div className="flex justify-between items-baseline">
                <span className="font-display text-lg text-brass-bright">{c.name}</span>
                <span className="text-xs text-faded">{c.assignedPlayer ? `→ ${c.assignedPlayer}` : "NPC (host-voiced)"}</span>
              </div>
              <div className="text-xs text-brass">{c.role}</div>
              <p className="text-sm text-faded mt-2">{c.publicPersona}</p>
              <p className="text-xs text-faded mt-2 italic">“{c.voice.sampleLines[0]}”</p>
              {refining === c.id ? (
                <div className="mt-3 space-y-2">
                  <input
                    className="input" autoFocus
                    placeholder='e.g. "make her more sarcastic", "turn him into a retired naval officer"'
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && instruction && refine(c.id)}
                  />
                  <div className="flex gap-2">
                    <button className="btn !py-1 text-xs" disabled={working || !instruction} onClick={() => refine(c.id)}>
                      {working ? "Rewriting…" : "Apply (continuity-checked)"}
                    </button>
                    <button className="btn-ghost !py-1 text-xs" onClick={() => setRefining(null)}>cancel</button>
                  </div>
                </div>
              ) : (
                <button className="btn-ghost !py-1 text-xs mt-3" onClick={() => { setRefining(c.id); setNote(null); }}>
                  ✎ refine with the Writers&apos; Room
                </button>
              )}
            </div>
          ))}
        </div>
        {note && <p className="text-xs text-faded mt-2">{note}</p>}
      </div>

      <PlayerLinks event={event} eventId={eventId} />

      <button className="btn w-full py-3 text-base" disabled={busy} onClick={onStart}>
        ✓ Approve &amp; start the event
      </button>
    </div>
  );
}

function EvidencePanel({ event, onReveal, busy }: { event: MysteryEvent; onReveal: (id: string) => void; busy: boolean }) {
  const pkg = event.package!;
  const icons = { document: "📜", physical: "🍷", testimony: "🗣", photo: "📷", audio: "🎙" };
  return (
    <div className="card">
      <div className="label">Evidence locker</div>
      <ul className="space-y-2 text-sm">
        {pkg.evidence.map((e) => {
          const released = event.runtime.releasedEvidence.includes(e.id);
          return (
            <li key={e.id} className="flex items-center justify-between gap-2">
              <span className={released ? "text-parchment" : "text-faded/60"}>
                {icons[e.type]} {e.title}
              </span>
              {released ? (
                <span className="text-xs text-brass">released</span>
              ) : (
                <button className="btn-ghost !py-0.5 !px-2 text-xs" disabled={busy} onClick={() => onReveal(e.id)}>
                  reveal
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function LogPanel({ event }: { event: MysteryEvent }) {
  return (
    <div className="card">
      <div className="label">Event log</div>
      <ul className="space-y-1 text-xs text-faded max-h-48 overflow-y-auto">
        {[...event.runtime.log].reverse().map((l, i) => (
          <li key={i}>{new Date(l.at).toLocaleTimeString()} — {l.entry}</li>
        ))}
      </ul>
    </div>
  );
}

function PlayerLinks({ event, eventId }: { event: MysteryEvent; eventId: string }) {
  const pkg = event.package!;
  const assigned = pkg.characters.filter((c) => c.assignedPlayer);
  return (
    <div className="card">
      <div className="label">Player links (in production: emailed invitations with single-use tokens)</div>
      <ul className="grid sm:grid-cols-2 gap-1 text-sm">
        {assigned.map((c) => (
          <li key={c.id}>
            <a className="text-brass hover:text-brass-bright" href={`/player/${eventId}/${c.id}`} target="_blank" rel="noreferrer">
              {c.assignedPlayer} → plays {c.name} ↗
            </a>
          </li>
        ))}
      </ul>
      {assigned.length < pkg.characters.length && (
        <p className="text-xs text-faded mt-2">
          {pkg.characters.length - assigned.length} character(s) without players remain in the story as host-voiced NPC suspects.
        </p>
      )}
    </div>
  );
}

function FinaleView({ event }: { event: MysteryEvent }) {
  const pkg = event.package!;
  const culprit = pkg.characters.find((c) => c.id === pkg.solution.culpritId);
  return (
    <div className="space-y-4">
      <div className="card border-brass bg-panel2">
        <div className="label">The reveal — read aloud, slowly</div>
        <p className="font-display text-lg leading-relaxed">{pkg.solution.revealNarration}</p>
        <p className="mt-3 text-brass-bright font-display text-xl">It was {culprit?.name}.</p>
      </div>
      <div className="card">
        <div className="label">Scoreboard — group objective</div>
        <ul className="space-y-1 text-sm">
          {event.runtime.accusations.map((a) => (
            <li key={a.playerName} className="flex justify-between">
              <span>{a.playerName} accused {pkg.characters.find((c) => c.id === a.culpritId)?.name}{a.motive ? ` — “${a.motive}”` : ""}</span>
              <span className={a.correct ? "text-brass-bright" : "text-faded"}>{a.correct ? "✓ CORRECT" : "✗"}</span>
            </li>
          ))}
          {event.runtime.accusations.length === 0 && <li className="text-faded">No accusations were submitted.</li>}
        </ul>
      </div>
      <div className="card">
        <div className="label">Awards — read these out, they&apos;re the souvenirs</div>
        <ul className="space-y-1 text-sm">
          {pkg.awards.map((a) => (
            <li key={a.title}>
              <span className="text-brass-bright">🏆 {a.title}</span>
              <span className="text-faded"> — {a.criteria}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
