"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface EventSummary {
  id: string;
  status: string;
  title: string;
  players: number;
  createdAt: string;
}

export default function Home() {
  const [events, setEvents] = useState<EventSummary[] | null>(null);

  useEffect(() => {
    fetch("/api/events").then((r) => r.json()).then((d) => setEvents(d.events));
  }, []);

  return (
    <div className="space-y-10">
      <section className="text-center py-10">
        <p className="text-xs uppercase tracking-[0.3em] text-faded mb-4">An AI writers&apos; room for your living room</p>
        <h1 className="font-display text-4xl sm:text-5xl text-brass-bright leading-tight">
          Every guest a suspect.<br />Every party an original.
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-faded">
          Describe your group and your theme. A room of AI writers generates a bespoke murder mystery —
          characters built for your friends, evidence that plays fair, and a finale worth retelling.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/host/new" className="btn text-base px-6 py-3">Summon the Writers&apos; Room</Link>
        </div>
        <p className="mt-4 text-xs text-faded/70">
          No API key? The demo runs a fully authored sample mystery, <em>The Last Vintage</em>.
        </p>
      </section>

      <section>
        <h2 className="label">Your events</h2>
        {!events && <p className="text-faded text-sm">Loading…</p>}
        {events && events.length === 0 && (
          <p className="text-faded text-sm">No events yet. The cellar is quiet… for now.</p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {events?.map((e) => (
            <Link key={e.id} href={`/host/${e.id}`} className="card hover:border-brass transition-colors">
              <div className="font-display text-lg text-brass-bright">{e.title}</div>
              <div className="text-xs text-faded mt-1">
                {e.players} players · <span className="uppercase">{e.status}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid sm:grid-cols-3 gap-3 text-sm">
        {[
          ["Solution-first fairness", "The culprit is fixed before the first clue is written. Every mystery ships with a machine-checked solvability proof."],
          ["Every player matters", "Each character carries goals, secrets, leverage, and a moment in the spotlight. No bystanders."],
          ["Phones down", "The app prompts, then pushes you back into the room. The party is the product."],
        ].map(([title, body]) => (
          <div key={title} className="card">
            <div className="text-brass font-semibold">{title}</div>
            <p className="text-faded mt-1">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
