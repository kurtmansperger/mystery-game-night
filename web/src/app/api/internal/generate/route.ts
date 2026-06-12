import { NextRequest, NextResponse } from "next/server";
import { getEvent } from "@/lib/store";
import { runPipeline } from "@/lib/agents/orchestrator";

// Cloud Tasks worker endpoint: runs the full Writers' Room pipeline inside
// one long request on the generator service. Never publicly invokable in
// production — callers must present either the shared secret (emulator /
// simple setups) or a Cloud Tasks OIDC token from the expected service
// account (docs/07 stage 3).

async function authorized(req: NextRequest): Promise<boolean> {
  const secret = process.env.INTERNAL_SHARED_SECRET;
  if (secret) return req.headers.get("x-internal-secret") === secret;

  const expectedEmail = process.env.TASKS_SA_EMAIL;
  if (expectedEmail) {
    const idToken = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!idToken) return false;
    try {
      const { OAuth2Client } = await import("google-auth-library");
      const ticket = await new OAuth2Client().verifyIdToken({
        idToken,
        audience: process.env.WORKER_URL,
      });
      const payload = ticket.getPayload();
      return Boolean(payload?.email_verified && payload.email === expectedEmail);
    } catch {
      return false;
    }
  }

  // No verifier configured: open in dev, closed in production.
  return process.env.NODE_ENV !== "production";
}

export async function POST(req: NextRequest) {
  if (!(await authorized(req))) {
    return NextResponse.json({ error: { code: "forbidden", message: "Not authorized." } }, { status: 403 });
  }
  const { eventId } = await req.json();
  const event = await getEvent(String(eventId ?? ""));
  if (!event) {
    // 200 so Cloud Tasks doesn't retry a deleted event forever.
    return NextResponse.json({ skipped: "event not found" });
  }
  if (event.status !== "generating") {
    return NextResponse.json({ skipped: `status is '${event.status}'` }); // idempotent re-delivery
  }
  await runPipeline(event);
  const done = await getEvent(event.id);
  return NextResponse.json({ ok: true, status: done?.status });
}
