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

    const pkg = await provider.generate(ctx, (stage, label, ok = true) => {
      event.checkpoints.push(makeCheckpoint(stage, label, ok));
      saveEvent(event);
    });

    event.checkpoints.push(makeCheckpoint("continuityGate", "The Continuity Editor is attacking the story..."));
    saveEvent(event);
    const continuity = continuityGate(pkg);
    event.continuity = continuity;
    if (continuity.verdict === "fail") {
      const failures = continuity.checks.filter((c) => !c.ok).map((c) => c.name).join("; ");
      throw new Error(`Continuity gate failed: ${failures}`);
    }
    event.checkpoints.push(makeCheckpoint("continuityGate", "Continuity Editor signed off: solvable, fair, no dead roles."));
    saveEvent(event);

    event.checkpoints.push(makeCheckpoint("qualityGate", "The Quality Judge is reading with a red pen..."));
    saveEvent(event);
    const quality = await provider.judge(ctx, pkg);
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
