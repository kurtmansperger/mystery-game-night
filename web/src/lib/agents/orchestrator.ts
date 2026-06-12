import type { MysteryEvent } from "../types";
import { saveEvent } from "../store";
import { getProvider, makeCheckpoint } from "./provider";
import { continuityGate } from "./validate";

// Pipeline runner: generate → continuity gate → quality gate, with live
// checkpoints written to the store so the host watches the room work.
// In production this is a Cloud Run job writing to Firestore
// (docs/02-technical-architecture.md §1); here it runs in-process.

export async function runPipeline(event: MysteryEvent): Promise<void> {
  const ctx = { config: event.config, genome: event.genome, derived: event.derived };
  try {
    const provider = await getProvider();

    let pkg = await provider.generate(ctx, (stage, label, ok = true) => {
      event.checkpoints.push(makeCheckpoint(stage, label, ok));
      saveEvent(event);
    });

    event.checkpoints.push(makeCheckpoint("continuityGate", "The Continuity Editor is attacking the story..."));
    saveEvent(event);
    let continuity = continuityGate(pkg);

    // Revise loop (docs/03 §3 step 10): the gate's critique goes back to the
    // drafting agents, max 2 attempts, then fail closed.
    const MAX_REVISIONS = 2;
    for (let attempt = 1; continuity.verdict === "fail" && provider.revise && attempt <= MAX_REVISIONS; attempt++) {
      const critique = continuity.checks
        .filter((c) => !c.ok)
        .map((c) => `- ${c.name}: ${c.detail}`)
        .join("\n");
      event.checkpoints.push(
        makeCheckpoint("continuityGate", `The editor sent notes back to the room (revision ${attempt} of ${MAX_REVISIONS})...`)
      );
      saveEvent(event);
      pkg = await provider.revise(ctx, pkg, critique);
      continuity = continuityGate(pkg);
    }

    event.continuity = continuity;
    if (continuity.verdict === "fail") {
      const failures = continuity.checks.filter((c) => !c.ok).map((c) => c.name).join("; ");
      throw new Error(`Continuity gate failed after revisions: ${failures}`);
    }
    event.checkpoints.push(makeCheckpoint("continuityGate", "Continuity Editor signed off: solvable, fair, no dead roles."));
    saveEvent(event);

    event.checkpoints.push(makeCheckpoint("qualityGate", "The Quality Judge is reading with a red pen..."));
    saveEvent(event);
    let quality = await provider.judge(ctx, pkg);

    // One revision shot at a below-the-bar score, then ship the honest number.
    if (quality.verdict === "fail" && provider.revise) {
      event.checkpoints.push(
        makeCheckpoint("qualityGate", `Judge scored it ${quality.composite}/100 — one more pass through the room...`)
      );
      saveEvent(event);
      const lowAxes = Object.entries(quality.scores)
        .filter(([, v]) => v < 70)
        .map(([k, v]) => `- Quality Judge scored ${k} at ${v}/100 — raise it.`)
        .join("\n");
      const revised = await provider.revise(ctx, pkg, lowAxes || `- Composite quality ${quality.composite}/100 is below the bar — sharpen the weakest material.`);
      const revisedContinuity = continuityGate(revised);
      if (revisedContinuity.verdict === "pass") {
        pkg = revised;
        event.continuity = revisedContinuity;
        quality = await provider.judge(ctx, pkg);
      }
    }
    event.quality = quality;
    event.checkpoints.push(
      makeCheckpoint(
        "qualityGate",
        quality.verdict === "pass"
          ? `Quality Judge verdict: ${quality.composite}/100. Approved.`
          : `Quality Judge verdict: ${quality.composite}/100 — below the bar.`,
        quality.verdict === "pass"
      )
    );

    event.package = pkg;
    event.status = "review";
    saveEvent(event);
  } catch (err) {
    event.status = "failed";
    event.error = err instanceof Error ? err.message : String(err);
    saveEvent(event);
  }
}
