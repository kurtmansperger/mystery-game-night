import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import type { MysteryEvent } from "../types";
import type { EventStore } from "./index";

// Cloud backend. Auth is Application Default Credentials (the Cloud Run
// service account — no key files). One document per event for now; splits
// into the docs/04 subcollections when media references arrive.

const COLLECTION = "events";

export class FirestoreStore implements EventStore {
  private db: Firestore;
  // Per-event write chains keep checkpoint saves ordered without making the
  // hot path wait on every progress write.
  private chains = new Map<string, Promise<void>>();

  constructor() {
    if (!getApps().length) {
      initializeApp(
        process.env.FIRESTORE_PROJECT_ID ? { projectId: process.env.FIRESTORE_PROJECT_ID } : undefined
      );
    }
    this.db = getFirestore();
    this.db.settings({ ignoreUndefinedProperties: true });
  }

  async saveEvent(event: MysteryEvent): Promise<void> {
    // Serialize NOW (the caller mutates the object), write in order.
    const snapshot = JSON.parse(JSON.stringify(event)) as MysteryEvent;
    const prev = this.chains.get(event.id) ?? Promise.resolve();
    const next = prev
      .catch(() => undefined)
      .then(() => this.db.collection(COLLECTION).doc(event.id).set(snapshot) as unknown as Promise<void>)
      .then(() => undefined);
    this.chains.set(event.id, next);
    return next;
  }

  async getEvent(id: string): Promise<MysteryEvent | undefined> {
    const snap = await this.db.collection(COLLECTION).doc(id).get();
    return snap.exists ? (snap.data() as MysteryEvent) : undefined;
  }

  async listEvents(): Promise<MysteryEvent[]> {
    const snap = await this.db.collection(COLLECTION).orderBy("createdAt", "desc").limit(100).get();
    return snap.docs.map((d) => d.data() as MysteryEvent);
  }
}
