import type { NextRequest } from "next/server";
import type { MysteryEvent } from "./types";

// Link-credential access control for the public deployment. This is the
// prototype stand-in for the invitation-token → Firebase custom-claims flow
// in docs/02 §4: every host/player link carries an unguessable key, checked
// server-side on every route. Off by default locally so the demo stays
// frictionless; the deploy workflow sets REQUIRE_ACCESS_KEYS=1.

export function keysEnforced(): boolean {
  return process.env.REQUIRE_ACCESS_KEYS === "1";
}

function presentedKey(req: NextRequest): string | null {
  return req.nextUrl.searchParams.get("k") ?? req.headers.get("x-access-key");
}

export function isHost(event: MysteryEvent, req: NextRequest): boolean {
  if (!keysEnforced()) return true;
  const k = presentedKey(req);
  return k !== null && k === event.keys.host;
}

export function isPlayer(event: MysteryEvent, characterId: string, req: NextRequest): boolean {
  if (!keysEnforced()) return true;
  const k = presentedKey(req);
  if (k === null) return false;
  return k === event.keys.players[characterId] || k === event.keys.host;
}
