import type { ContinuityReport, MysteryPackage } from "../types";

// The Continuity Editor's machine-checkable gate. The full production gate
// (knowledge-ledger derivations, timeline lattice) is documented in
// docs/03-agent-architecture.md §4.6; these are the structural invariants the
// prototype enforces on every generated package, from any provider.

export function continuityGate(pkg: MysteryPackage): ContinuityReport {
  const checks: ContinuityReport["checks"] = [];
  const charIds = new Set(pkg.characters.map((c) => c.id));
  const evidenceIds = new Set(pkg.evidence.map((e) => e.id));

  const culpritOk = charIds.has(pkg.solution.culpritId);
  checks.push({
    name: "Solution-first: culprit exists in cast",
    ok: culpritOk,
    detail: culpritOk ? `Culprit '${pkg.solution.culpritId}' is a cast member.` : `Culprit '${pkg.solution.culpritId}' not found in cast.`,
  });

  const culpritIndex = pkg.characters.findIndex((c) => c.id === pkg.solution.culpritId);
  checks.push({
    name: "Cast trims safely (culprit in first four)",
    ok: culpritIndex >= 0 && culpritIndex < 4,
    detail: `Culprit at cast position ${culpritIndex + 1}.`,
  });

  const deadRoles = pkg.characters.filter(
    (c) => c.secrets.length < 1 || c.objectives.length < 1 || c.relationships.length < 1
  );
  checks.push({
    name: "No bystanders: every character has secrets, objectives, relationships",
    ok: deadRoles.length === 0,
    detail: deadRoles.length ? `Dead roles: ${deadRoles.map((c) => c.name).join(", ")}` : `All ${pkg.characters.length} characters carry weight.`,
  });

  const badReleases = pkg.beats.flatMap((b) => b.releasesEvidence.filter((e) => !evidenceIds.has(e)));
  const badBeatRefs = pkg.evidence.filter((e) => e.releaseBeat < 0 || e.releaseBeat >= pkg.beats.length);
  checks.push({
    name: "Evidence release schedule is consistent",
    ok: badReleases.length === 0 && badBeatRefs.length === 0,
    detail:
      badReleases.length || badBeatRefs.length
        ? `Unknown evidence in beats: [${badReleases.join(", ")}]; out-of-range releaseBeat: [${badBeatRefs.map((e) => e.id).join(", ")}]`
        : "Every beat release maps to a real item; every item maps to a real beat.",
  });

  const orphanPrompts = pkg.beats.flatMap((b) => b.prompts.filter((p) => !charIds.has(p.characterId)));
  checks.push({
    name: "Knowledge ledger: prompts address real characters",
    ok: orphanPrompts.length === 0,
    detail: orphanPrompts.length ? `${orphanPrompts.length} prompts address unknown characters.` : "All private prompts reach cast members.",
  });

  // Solvability proxy: enough independent evidence must release before the
  // finale, and every red herring needs its planted exoneration.
  const finalBeat = pkg.beats.length - 1;
  const preFinale = pkg.evidence.filter((e) => e.releaseBeat < finalBeat);
  checks.push({
    name: "Solvability: sufficient evidence releases before the finale",
    ok: preFinale.length >= 6,
    detail: `${preFinale.length} of ${pkg.evidence.length} items release before the finale (minimum 6).`,
  });

  const exonerations = pkg.evidence.filter((e) => e.falsifies);
  checks.push({
    name: "Falsifiable herrings: exonerations are planted",
    ok: exonerations.length >= 1,
    detail: `${exonerations.length} planted exoneration item(s): ${exonerations.map((e) => e.title).join("; ") || "none"}.`,
  });

  const promptCoverage = new Set(pkg.beats.flatMap((b) => b.prompts.map((p) => p.characterId)));
  const unprompted = pkg.characters.filter((c) => !promptCoverage.has(c.id));
  checks.push({
    name: "Every player matters: each character receives prompts",
    ok: unprompted.length === 0,
    detail: unprompted.length ? `No prompts for: ${unprompted.map((c) => c.name).join(", ")}` : "Every character has at least one Now card.",
  });

  return {
    verdict: checks.every((c) => c.ok) ? "pass" : "fail",
    checks,
  };
}
