import fs from "node:fs";
import path from "node:path";
import type { MysteryEvent } from "./types";

// File-backed store standing in for Firestore in the prototype (production
// schema: docs/04-database-schema.md). Events persist across dev-server and
// machine restarts in web/.data/events.json (gitignored). Kept on globalThis
// so Next.js module reloads share one instance.

const DATA_FILE = path.join(process.cwd(), ".data", "events.json");

function loadFromDisk(): Map<string, MysteryEvent> {
  try {
    const raw = JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) as Record<string, MysteryEvent>;
    const map = new Map(Object.entries(raw));
    // A generation interrupted by a restart can never finish — surface that.
    for (const e of map.values()) {
      if (e.status === "generating") {
        e.status = "failed";
        e.error = "Generation was interrupted by a server restart. Send it back to the Writers' Room to retry.";
      }
    }
    return map;
  } catch {
    return new Map();
  }
}

const g = globalThis as unknown as { __mgnStore?: Map<string, MysteryEvent> };
const store: Map<string, MysteryEvent> = (g.__mgnStore ??= loadFromDisk());

function persist(): void {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(Object.fromEntries(store)));
  } catch {
    // Persistence is best-effort in the prototype; the in-memory copy stays authoritative.
  }
}

export function saveEvent(event: MysteryEvent): void {
  store.set(event.id, event);
  persist();
}

export function getEvent(id: string): MysteryEvent | undefined {
  return store.get(id);
}

export function listEvents(): MysteryEvent[] {
  return [...store.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}
