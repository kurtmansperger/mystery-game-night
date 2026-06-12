import type { MysteryEvent } from "../types";

// Storage abstraction (async — Firestore-shaped). Backend selection:
//   Firestore  when GOOGLE_CLOUD_PROJECT / FIRESTORE_PROJECT_ID /
//              FIRESTORE_EMULATOR_HOST is set (Cloud Run, emulator)
//   File       otherwise (local dev: web/.data/events.json)
// Production schema: docs/04-database-schema.md.

export interface EventStore {
  saveEvent(event: MysteryEvent): Promise<void>;
  getEvent(id: string): Promise<MysteryEvent | undefined>;
  listEvents(): Promise<MysteryEvent[]>;
}

function useFirestore(): boolean {
  return Boolean(
    process.env.FIRESTORE_PROJECT_ID ||
      process.env.GOOGLE_CLOUD_PROJECT ||
      process.env.FIRESTORE_EMULATOR_HOST
  );
}

const g = globalThis as unknown as { __mgnEventStore?: Promise<EventStore> };

async function buildStore(): Promise<EventStore> {
  if (useFirestore()) {
    const { FirestoreStore } = await import("./firestoreStore");
    return new FirestoreStore();
  }
  const { FileStore } = await import("./fileStore");
  return new FileStore();
}

function store(): Promise<EventStore> {
  return (g.__mgnEventStore ??= buildStore());
}

export async function saveEvent(event: MysteryEvent): Promise<void> {
  return (await store()).saveEvent(event);
}

export async function getEvent(id: string): Promise<MysteryEvent | undefined> {
  return (await store()).getEvent(id);
}

export async function listEvents(): Promise<MysteryEvent[]> {
  return (await store()).listEvents();
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Unguessable access key (host link / player link credentials). */
export function newKey(): string {
  return Array.from({ length: 3 }, () => Math.random().toString(36).slice(2, 10)).join("");
}
