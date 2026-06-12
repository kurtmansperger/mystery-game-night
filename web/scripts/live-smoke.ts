// Live pipeline smoke test: generates one complete story on the real Claude
// Writers' Room, runs both gates, and reports story quality + per-call cost.
// Run: npm run smoke:live  (requires ANTHROPIC_API_KEY)
// In CI it also writes a Markdown report to $GITHUB_STEP_SUMMARY.

import { appendFileSync } from "node:fs";

const PRICE_IN_PER_MTOK = 5; // claude-opus-4-8
const PRICE_OUT_PER_MTOK = 25;
const PRICE_CACHE_READ_PER_MTOK = 0.5;
const PRICE_CACHE_WRITE_PER_MTOK = 6.25;

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set — cannot run the live pipeline.");
    process.exit(1);
  }
  const { anthropicProvider, usageLog } = await import("../src/lib/agents/anthropic");
  const { continuityGate } = await import("../src/lib/agents/validate");
  const { defaultGenome, deriveParams } = await import("../src/lib/genome");
  const ctx = {
    config: {
      theme: "a startup acquisition gone wrong — the all-hands party the night before the deal closes",
      tone: "dramatic with dry humor",
      modeBlend: { party: 0.6, detective: 0.4 } as Record<string, number>,
      runtimeMinutes: 120 as const,
      contentRating: "teen" as const,
      players: [
        { name: "Jess", note: "shy, first-timer" },
        { name: "Marcus", note: "married to Dana" },
        { name: "Dana", note: "married to Marcus, loves drama" },
        { name: "Sam" },
        { name: "Priya", note: "the group's puzzle person" },
        { name: "Leo" },
      ],
    },
    genome: defaultGenome({ party: 0.6, detective: 0.4 }),
    derived: deriveParams({ party: 0.6, detective: 0.4 }, 120),
  };

  console.log("Generating a live story (theme: startup acquisition gone wrong)...\n");
  const t0 = Date.now();
  const pkg = await anthropicProvider.generate(ctx, (stage, label) =>
    console.log(`  [${stage}] ${label}`)
  );
  const continuity = continuityGate(pkg);
  console.log(`  [continuityGate] ${continuity.verdict}`);
  const quality = await anthropicProvider.judge(ctx, pkg);
  console.log(`  [qualityGate] ${quality.verdict} (${quality.composite}/100)`);
  const totalMin = ((Date.now() - t0) / 60000).toFixed(1);

  // — cost report —
  const rows = usageLog.map((u) => ({
    ...u,
    usd:
      (u.inputTokens * PRICE_IN_PER_MTOK +
        u.outputTokens * PRICE_OUT_PER_MTOK +
        u.cacheReadTokens * PRICE_CACHE_READ_PER_MTOK +
        u.cacheCreateTokens * PRICE_CACHE_WRITE_PER_MTOK) /
      1_000_000,
  }));
  const total = rows.reduce(
    (a, r) => ({ in: a.in + r.inputTokens, out: a.out + r.outputTokens, usd: a.usd + r.usd }),
    { in: 0, out: 0, usd: 0 }
  );

  const lines: string[] = [];
  const log = (s: string) => lines.push(s);
  log(`# Live pipeline report — "${pkg.title}"`);
  log(`*${pkg.logline}*`);
  log("");
  log(`**Wall clock:** ${totalMin} min · **Continuity gate:** ${continuity.verdict} · **Quality Judge:** ${quality.composite}/100 (${quality.verdict})`);
  log("");
  log("## Cost per call");
  log("| Agent call | Input tok | Output tok (incl. thinking) | Time | Cost |");
  log("|---|---:|---:|---:|---:|");
  for (const r of rows) {
    log(`| ${r.role} | ${r.inputTokens.toLocaleString()} | ${r.outputTokens.toLocaleString()} | ${(r.ms / 1000).toFixed(0)}s | $${r.usd.toFixed(3)} |`);
  }
  log(`| **Total** | **${total.in.toLocaleString()}** | **${total.out.toLocaleString()}** | | **$${total.usd.toFixed(2)}** |`);
  log("");
  log("## Quality Judge scores");
  log(Object.entries(quality.scores).map(([k, v]) => `${k} ${v}`).join(" · "));
  log(`> Most memorable moment: ${quality.mostMemorableMoment}`);
  log("");
  log("## Continuity checks");
  for (const c of continuity.checks) log(`- ${c.ok ? "✅" : "❌"} ${c.name} — ${c.detail}`);
  log("");
  log("## The story (contains spoilers)");
  log(`**Setting:** ${pkg.setting}`);
  log(`**Why tonight:** ${pkg.whyTonight}`);
  log(`**Victim:** ${pkg.victim.name}, ${pkg.victim.role}`);
  log("");
  log("### Cast");
  for (const c of pkg.characters) {
    log(`- **${c.name}** (${c.assignedPlayer ?? "NPC"}) — ${c.role}. ${c.publicPersona} _Voice: ${c.voice.sampleLines[0] ?? ""}_`);
  }
  log("");
  log("### Evidence & beats");
  log(pkg.evidence.map((e) => `\`${e.title}\` (beat ${e.releaseBeat}${e.falsifies ? ", exoneration" : ""})`).join(" · "));
  log(pkg.beats.map((b) => `Act ${b.act}: ${b.title}`).join(" → "));
  log("");
  log("### Solution");
  log(`**Culprit:** ${pkg.characters.find((c) => c.id === pkg.solution.culpritId)?.name ?? pkg.solution.culpritId}`);
  log(`**Motive:** ${pkg.solution.motive}`);
  log(`**Means:** ${pkg.solution.means}`);
  log(`**Reveal narration:** ${pkg.solution.revealNarration}`);

  const report = lines.join("\n");
  console.log("\n" + report);
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, report + "\n");
  }
  if (continuity.verdict !== "pass") {
    console.error("\nContinuity gate FAILED — see checks above.");
    process.exit(2);
  }
}

main().catch((err) => {
  console.error("Live smoke test failed:", err);
  process.exit(1);
});
