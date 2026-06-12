import fs from "node:fs";
import path from "node:path";
import type { MysteryEvent } from "../types";
import type { EventStore } from "./index";

// Local-dev backend: one JSON file, loaded once, written on every save.

const DATA_FILE = path.join(process.cwd(), ".data", "events.json");

export class FileStore implements EventStore {
  private events: Map<string, MysteryEvent>;

  constructor() {
    this.events = this.load();
  }

  private load(): Map<string, MysteryEvent> {
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

  async saveEvent(event: MysteryEvent): Promise<void> {
    this.events.set(event.id, event);
    try {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(Object.fromEntries(this.events)));
    } catch {
      // Best-effort persistence; the in-memory copy stays authoritative.
    }
  }

  async getEvent(id: string): Promise<MysteryEvent | undefined> {
    return this.events.get(id);
  }

  async listEvents(): Promise<MysteryEvent[]> {
    return [...this.events.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}
