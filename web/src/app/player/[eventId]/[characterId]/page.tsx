"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import type { Character } from "@/lib/types";

interface PlayerView {
  eventStatus: string;
  title: string;
  logline: string;
  setting: string;
  victim: { name: string; role: string; description: string };
  me: Character;
  cast: { id: string; name: string; role: string; publicPersona: string; assignedPlayer: string | null }[];
  act: number | null;
  beatTitle: string | null;
  nowCard: string | null;
  evidence: { id: string; title: string; type: string; content: string; discoveryFraming: string }[];
  finaleOpen: boolean;
  myAccusation: { culpritId: string; correct?: boolean } | null;
  reveal: { culpritId: string; culpritName?: string; narration: string; motive: string; means: string } | null;
}

const icons: Record<string, string> = { document: "📜", physical: "🍷", testimony: "🗣", photo: "📷", audio: "🎙" };

export default function PlayerPage({ params }: { params: Promise<{ eventId: string; characterId: string }> }) {
  const { eventId, characterId } = use(params);
  const [view, setView] = useState<PlayerView | null>(null);
  const [tab, setTab] = useState<"now" | "me" | "evidence" | "people">("now");
  const [secretsOpen, setSecretsOpen] = useState(false);
  const [openEvidence, setOpenEvidence] = useState<string | null>(null);
  const [accuseId, setAccuseId] = useState("");
  const [accuseMotive, setAccuseMotive] = useState("");
  const [accuseMsg, setAccuseMsg] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Player link credential (?k=...) — forwarded on every API call.
  const [accessKey] = useState(() =>
    typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("k") ?? ""
  );

  const load = useCallback(async () => {
    const res = await fetch(`/api/events/${eventId}/player/${characterId}?k=${accessKey}`);
    if (res.ok) setView(await res.json());
  }, [eventId, characterId, accessKey]);

  useEffect(() => {
    load();
    pollRef.current = setInterval(load, 2500);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [load]);

  async function submitAccusation() {
    const res = await fetch(`/api/events/${eventId}/accuse?k=${accessKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characterId, culpritId: accuseId, motive: accuseMotive }),
    });
    const data = await res.json();
    setAccuseMsg(res.ok ? "Submitted. No edits after." : data.error?.message);
    load();
  }

  if (!view) return <p className="text-faded">Opening your briefing…</p>;
  const me = view.me;

  return (
    <div className="max-w-md mx-auto space-y-4 pb-16">
      <header className="text-center">
        <div className="text-[11px] uppercase tracking-[0.25em] text-faded">{view.title}</div>
        {view.act ? (
          <div className="font-display text-brass-bright">Act {view.act} · {view.beatTitle}</div>
        ) : (
          <div className="font-display text-brass-bright">Before the event</div>
        )}
      </header>

      {/* NOW card — the one thing to do right now */}
      {view.eventStatus === "live" && (
        <div className="card border-brass bg-panel2">
          <div className="label !text-brass">Now</div>
          <p className="font-display text-lg leading-snug">
            {view.nowCard ?? "Stay in character. Work the room — someone here is lying to you."}
          </p>
          <p className="text-[11px] text-faded mt-3">⚠ Put the phone down. Say it to a person.</p>
        </div>
      )}

      {view.reveal && (
        <div className="card border-brass bg-panel2">
          <div className="label !text-brass">The truth</div>
          <p className="font-display leading-relaxed text-sm">{view.reveal.narration}</p>
          <p className="mt-2 text-brass-bright font-display">It was {view.reveal.culpritName}.</p>
          {view.myAccusation && (
            <p className="mt-2 text-sm">
              Your accusation: {view.myAccusation.correct ? <span className="text-brass-bright">CORRECT ✓ — well played, detective.</span> : <span className="text-faded">incorrect — but how was your night, {me.name}?</span>}
            </p>
          )}
        </div>
      )}

      {view.finaleOpen && !view.myAccusation && (
        <div className="card border-wine">
          <div className="label">Final accusation — one shot, no edits</div>
          <select className="input mt-1" value={accuseId} onChange={(e) => setAccuseId(e.target.value)}>
            <option value="">I accuse…</option>
            {view.cast.filter((c) => c.id !== me.id).map((c) => (
              <option key={c.id} value={c.id}>{c.name} — {c.role}</option>
            ))}
          </select>
          <input className="input mt-2" placeholder="because… (motive, one line)" value={accuseMotive}
            onChange={(e) => setAccuseMotive(e.target.value)} />
          <button className="btn w-full mt-2" disabled={!accuseId} onClick={submitAccusation}>Submit</button>
          {accuseMsg && <p className="text-xs text-faded mt-1">{accuseMsg}</p>}
        </div>
      )}
      {view.finaleOpen && view.myAccusation && (
        <div className="card text-sm text-faded">Accusation locked in. Eyes up — the reveal is coming.</div>
      )}

      <nav className="flex gap-1 text-sm">
        {([["now", "🎭 Role"], ["me", "🔒 Secrets"], ["evidence", `🗂 Evidence ${view.evidence.length}`], ["people", "👥 People"]] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t as typeof tab)}
            className={`btn-ghost flex-1 !px-2 ${tab === t ? "border-brass text-brass-bright" : ""}`}>
            {label}
          </button>
        ))}
      </nav>

      {tab === "now" && (
        <div className="space-y-3">
          <div className="card">
            <div className="font-display text-2xl text-brass-bright">{me.name}</div>
            <div className="text-xs text-brass">{me.role}</div>
            <p className="text-sm text-faded mt-2">{me.publicPersona}</p>
            <p className="text-sm mt-3"><b className="text-brass">How to play me:</b> <span className="text-faded">{me.voice.howToPlayMe}</span></p>
            <p className="text-sm mt-1"><b className="text-brass">Your tell:</b> <span className="text-faded">{me.voice.tic}</span></p>
            <p className="text-sm mt-1"><b className="text-brass">Wear:</b> <span className="text-faded">{me.costume}</span></p>
          </div>
          <div className="card">
            <div className="label">Lines, if you&apos;re nervous</div>
            <ul className="space-y-2 text-sm font-display italic text-faded">
              {me.voice.sampleLines.map((l, i) => <li key={i}>{l}</li>)}
            </ul>
          </div>
          <div className="card">
            <div className="label">What you know</div>
            <ul className="list-disc ml-4 space-y-1 text-sm text-faded">
              {me.whatToKnow.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        </div>
      )}

      {tab === "me" && (
        <div className="space-y-3">
          <div className="card">
            <div className="label">Who you really are</div>
            <p className="text-sm text-faded">{me.privateSelf}</p>
            <p className="text-sm text-faded mt-2"><b className="text-brass">The victim &amp; you:</b> {me.connectionToVictim}</p>
          </div>
          <div className="card border-wine">
            <button className="label !mb-0 w-full text-left cursor-pointer" onClick={() => setSecretsOpen(!secretsOpen)}>
              🔒 Your secrets — {secretsOpen ? "tap to hide" : "tap to open (shield your screen)"}
            </button>
            {secretsOpen && (
              <ul className="mt-3 space-y-2 text-sm">
                {me.secrets.map((s) => (
                  <li key={s.id} className="border-l-2 border-wine pl-2 text-faded">{s.text}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="card">
            <div className="label">🎯 Your objectives (your private scoreboard)</div>
            <ul className="space-y-2 text-sm">
              {me.objectives.map((o) => (
                <li key={o.id}>
                  <span className="text-parchment">{o.text}</span>
                  <div className="text-xs text-faded">✓ when: {o.successCriteria}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === "evidence" && (
        <div className="space-y-2">
          {view.evidence.length === 0 && <p className="text-sm text-faded text-center py-6">Nothing yet. The night is young.</p>}
          {view.evidence.map((e) => (
            <div key={e.id} className="card cursor-pointer" onClick={() => setOpenEvidence(openEvidence === e.id ? null : e.id)}>
              <div className="flex justify-between items-center text-sm">
                <span>{icons[e.type]} {e.title}</span>
                <span className="text-xs text-faded">{openEvidence === e.id ? "▾" : "▸"}</span>
              </div>
              {openEvidence === e.id && (
                <div className="mt-2 border-t border-line pt-2">
                  <p className="text-xs text-brass italic">{e.discoveryFraming}</p>
                  <p className="text-sm text-faded mt-2 font-display whitespace-pre-wrap">{e.content}</p>
                  <p className="text-[11px] text-faded mt-2">Share it with the table — out loud.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "people" && (
        <div className="space-y-2">
          {me.relationships.map((r) => {
            const c = view.cast.find((x) => x.id === r.characterId);
            return (
              <div key={r.characterId} className="card">
                <div className="text-sm"><span className="text-brass-bright">{c?.name ?? r.characterId}</span> <span className="text-xs text-faded">— {r.publicLabel}</span></div>
                <p className="text-xs text-faded mt-1">🔒 {r.privateTruth}</p>
              </div>
            );
          })}
          <div className="card">
            <div className="label">Everyone at the party</div>
            <ul className="space-y-1 text-xs text-faded">
              {view.cast.map((c) => (
                <li key={c.id}>
                  <span className="text-parchment">{c.name}</span> — {c.role}
                  {c.id === me.id ? " (you)" : c.assignedPlayer ? ` (${c.assignedPlayer})` : " (ask the host)"}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
