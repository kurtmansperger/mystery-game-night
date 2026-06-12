import type { MysteryEvent } from "./types";

// In-memory store standing in for Firestore in the prototype.
// The production schema this maps onto is documented in docs/04-database-schema.md.
// Stored on globalThis so it survives Next.js dev-server module reloads.

const g = globalThis as unknown as { __mgnStore?: Map<string, MysteryEvent> };
const store: Map<string, MysteryEvent> = (g.__mgnStore ??= new Map());

export function saveEvent(event: MysteryEvent): void {
  store.set(event.id, event);
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
