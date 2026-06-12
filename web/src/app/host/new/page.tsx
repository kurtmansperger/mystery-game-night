"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GENOME_DIMENSIONS, MODES, defaultGenome } from "@/lib/genome";
import type { ModeId, StoryGenome } from "@/lib/types";

export default function NewEvent() {
  const router = useRouter();
  const [primary, setPrimary] = useState<ModeId>("party");
  const [secondary, setSecondary] = useState<ModeId | "none">("detective");
  const [blendPct, setBlendPct] = useState(30);
  const [theme, setTheme] = useState("");
  const [tone, setTone] = useState("dramatic with dry humor");
  const [runtime, setRuntime] = useState(120);
  const [rating, setRating] = useState<"family" | "teen" | "adult">("teen");
  const [players, setPlayers] = useState<{ name: string; note: string }[]>([
    { name: "", note: "" }, { name: "", note: "" }, { name: "", note: "" }, { name: "", note: "" },
  ]);
  const [showGenome, setShowGenome] = useState(false);
  const [genomeEdits, setGenomeEdits] = useState<Partial<StoryGenome>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modeBlend = useMemo(() => {
    if (secondary === "none" || secondary === primary) return { [primary]: 1 };
    return { [primary]: (100 - blendPct) / 100, [secondary]: blendPct / 100 };
  }, [primary, secondary, blendPct]);

  const genome = useMemo(
    () => ({ ...defaultGenome(modeBlend), ...genomeEdits }),
    [modeBlend, genomeEdits]
  );

  const namedPlayers = players.filter((p) => p.name.trim());

  async function submit() {
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        theme, tone, modeBlend, runtimeMinutes: runtime, contentRating: rating,
        players: namedPlayers, genome,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error?.message ?? "Something went wrong.");
      setSubmitting(false);
      return;
    }
    router.push(`/host/${data.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl text-brass-bright">New Mystery</h1>
        <p className="text-faded text-sm mt-1">The Writers&apos; Room takes direction. Give it some.</p>
      </div>

      <section className="space-y-3">
        <span className="label">What kind of night?</span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setPrimary(m.id)}
              className={`card text-left cursor-pointer !p-3 ${primary === m.id ? "border-brass bg-panel2" : "hover:border-brass/50"}`}
            >
              <div className="font-semibold text-sm">{m.label}</div>
              <div className="text-[11px] text-faded mt-1 leading-tight">{m.tagline}</div>
            </button>
          ))}
        </div>
        <div className="card !p-3 flex flex-wrap items-center gap-3 text-sm">
          <span className="text-faded">Blend with</span>
          <select className="input !w-auto" value={secondary} onChange={(e) => setSecondary(e.target.value as ModeId | "none")}>
            <option value="none">nothing — pure {primary}</option>
            {MODES.filter((m) => m.id !== primary).map((m) => (
              <option key={m.id} value={m.id}>{m.label.toLowerCase()}</option>
            ))}
          </select>
          {secondary !== "none" && (
            <>
              <input type="range" min={10} max={50} step={5} value={blendPct}
                onChange={(e) => setBlendPct(Number(e.target.value))} className="accent-[#d4a04c]" />
              <span className="text-brass">{100 - blendPct}% {primary} / {blendPct}% {secondary}</span>
            </>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <label className="label" htmlFor="theme">Theme</label>
          <input id="theme" className="input" value={theme} onChange={(e) => setTheme(e.target.value)}
            placeholder='e.g. "Knives Out at a yacht club", "1980s ski lodge", "a 50th-anniversary gala at a family winery"' />
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="label" htmlFor="tone">Tone</label>
            <input id="tone" className="input" value={tone} onChange={(e) => setTone(e.target.value)} />
          </div>
          <div>
            <span className="label">Runtime</span>
            <div className="flex gap-1">
              {[60, 90, 120, 180].map((r) => (
                <button key={r} onClick={() => setRuntime(r)}
                  className={`btn-ghost !px-3 ${runtime === r ? "border-brass text-brass-bright" : ""}`}>
                  {r}m
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="label">Rating</span>
            <div className="flex gap-1">
              {(["family", "teen", "adult"] as const).map((r) => (
                <button key={r} onClick={() => setRating(r)}
                  className={`btn-ghost !px-3 ${rating === r ? "border-brass text-brass-bright" : ""}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <span className="label">Who&apos;s coming? ({namedPlayers.length} players, 4–12)</span>
        {players.map((p, i) => (
          <div key={i} className="flex gap-2">
            <input className="input !w-40" placeholder={`Player ${i + 1}`} value={p.name}
              onChange={(e) => setPlayers(players.map((q, j) => (j === i ? { ...q, name: e.target.value } : q)))} />
            <input className="input flex-1" placeholder="note for the writers (shy, married to Dana, age 11, loves drama…)"
              value={p.note}
              onChange={(e) => setPlayers(players.map((q, j) => (j === i ? { ...q, note: e.target.value } : q)))} />
          </div>
        ))}
        {players.length < 12 && (
          <button className="btn-ghost" onClick={() => setPlayers([...players, { name: "", note: "" }])}>
            + add player
          </button>
        )}
        <p className="text-xs text-faded">Notes shape characters — shy players get structured roles, couples get entangled, kids get age-fit parts.</p>
      </section>

      <section>
        <button className="text-sm text-brass hover:text-brass-bright cursor-pointer" onClick={() => setShowGenome(!showGenome)}>
          {showGenome ? "▾" : "▸"} Story Genome (advanced)
        </button>
        {showGenome && (
          <div className="card mt-2 grid sm:grid-cols-2 gap-x-6 gap-y-2">
            {GENOME_DIMENSIONS.map((dim) => (
              <label key={dim} className="flex items-center gap-2 text-xs">
                <span className="w-32 text-faded capitalize">{dim.replace(/([A-Z])/g, " $1").toLowerCase()}</span>
                <input type="range" min={0} max={100} value={genome[dim]} className="flex-1 accent-[#d4a04c]"
                  onChange={(e) => setGenomeEdits({ ...genomeEdits, [dim]: Number(e.target.value) })} />
                <span className="w-8 text-right text-brass">{genome[dim]}</span>
              </label>
            ))}
          </div>
        )}
      </section>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button className="btn w-full py-3 text-base" disabled={submitting || namedPlayers.length < 4} onClick={submit}>
        {submitting ? "Summoning the Writers' Room…" : namedPlayers.length < 4 ? "Name at least 4 players" : "Summon the Writers' Room ▸"}
      </button>
    </div>
  );
}
