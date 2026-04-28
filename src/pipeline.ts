import path from "path";
import { Tracer } from "./lib/tracer.js";
import { writeFile, writeJson, ensureDir } from "./lib/fs.js";
import { runIntakeAgent } from "./agents/intake.js";
import { runPlannerAgent } from "./agents/planner.js";
import { runDeliveryAgent } from "./agents/delivery.js";
import { runQaAgent } from "./agents/qa.js";
import { runComplianceAgent } from "./agents/compliance.js";
import { runEvaluatorAgent } from "./agents/evaluator.js";
import { Requirements, EvalResult, StageTrace } from "./lib/schema.js";
import { generateReport } from "./lib/reporter.js";


export interface PipelineResult {
  runId: string;
  runDir: string;
  requirements: Requirements;
  plan: string;
  deliveryPackage: string;
  testPlan: string;
  riskReview: string;
  eval: EvalResult;
}

export async function runPipeline(briefContent: string, runId: string): Promise<PipelineResult> {
  const runDir = path.join(process.cwd(), "runs", runId);
  await ensureDir(runDir);
  const tracer = new Tracer(runDir);

  console.log(`\n[HCP Brief Workflow] Run: ${runId}`);
  console.log(`Output: ${runDir}\n`);

  // Stage 1: Intake
  console.log("Stage 1/6 - Brief Intake...");
  const s1 = tracer.startStage(runId, "intake");
  const requirements = await runIntakeAgent(briefContent);
  s1.finish("success", `Extracted objective: "${requirements.objective.slice(0, 80)}..."`);
  await writeJson(path.join(runDir, "requirements.json"), requirements);

  // Stage 2: Planner
  console.log("Stage 2/6 - Strategy Planning...");
  const s2 = tracer.startStage(runId, "planner");
  const plan = await runPlannerAgent(requirements);
  s2.finish("success", `Plan generated (${plan.length} chars)`);
  await writeFile(path.join(runDir, "plan.md"), plan);

  // Stage 3: Delivery
  console.log("Stage 3/6 - Delivery Artifact...");
  const s3 = tracer.startStage(runId, "delivery");
  const deliveryPackage = await runDeliveryAgent(requirements, plan);
  s3.finish("success", `Delivery package generated (${deliveryPackage.length} chars)`);
  await writeFile(path.join(runDir, "delivery-package.md"), deliveryPackage);

  // Stage 4: QA
  console.log("Stage 4/6 - QA Test Plan...");
  const s4 = tracer.startStage(runId, "qa");
  const testPlan = await runQaAgent(requirements, deliveryPackage);
  s4.finish("success", `Test plan generated (${testPlan.length} chars)`);
  await writeFile(path.join(runDir, "test-plan.md"), testPlan);

  // Stage 5: Compliance
  console.log("Stage 5/6 - Compliance Review...");
  const s5 = tracer.startStage(runId, "compliance");
  const riskReview = await runComplianceAgent(requirements, deliveryPackage);
  s5.finish("success", `Risk review generated (${riskReview.length} chars)`);
  await writeFile(path.join(runDir, "risk-review.md"), riskReview);

  // Stage 6: Evaluator
  console.log("Stage 6/6 - AgentOps Evaluation...");
  const s6 = tracer.startStage(runId, "evaluator");
  const evalResult = await runEvaluatorAgent(
    requirements,
    plan,
    deliveryPackage,
    testPlan,
    riskReview
  );
  s6.finish("success", `Overall score: ${evalResult.overall_score.toFixed(2)}`);
  await writeJson(path.join(runDir, "eval.json"), evalResult);

  // Summary
  const summary = buildSummary(runId, requirements, evalResult, tracer.getTraces());
  await writeFile(path.join(runDir, "summary.md"), summary);

  // Flush trace
  await tracer.flush();

  // HTML report
  await generateReport({
    runId,
    requirements,
    plan,
    deliveryPackage,
    testPlan,
    riskReview,
    evalResult,
    traces: tracer.getTraces(),
  }, runDir);

  console.log(`\nDone. Overall score: ${evalResult.overall_score.toFixed(2)}`);
  console.log(`Report:    ${path.join(runDir, "report.html")}`);
  console.log(`Artifacts: ${runDir}\n`);

  return {
    runId,
    runDir,
    requirements,
    plan,
    deliveryPackage,
    testPlan,
    riskReview,
    eval: evalResult,
  };
}

function buildSummary(
  runId: string,
  req: Requirements,
  ev: EvalResult,
  traces: StageTrace[]
): string {
  const totalMs = traces.reduce((sum, t) => sum + t.duration_ms, 0);
  const lines = [
    `# Run Summary - ${runId}`,
    "",
    `**Date:** ${new Date().toISOString().slice(0, 10)}`,
    `**Total runtime:** ${(totalMs / 1000).toFixed(1)}s across ${traces.length} stages`,
    `**Overall quality score:** ${(ev.overall_score * 100).toFixed(0)}/100`,
    "",
    "## What This Run Did",
    "",
    `This workflow processed an HCP engagement brief with the following objective:`,
    "",
    `> ${req.objective}`,
    "",
    `The brief targeted **${req.audience.specialty.join(", ")}** specialists`,
    `across **${req.audience.geography.join(", ")}** via **${req.channels.join(", ")}** channels.`,
    `Recommended delivery path: **${req.recommended_path}**.`,
    "",
    "## Stage Results",
    "",
    ...traces.map(
      (t) => `- **${t.stage}**: ${t.status} (${t.duration_ms}ms) - ${t.output_summary}`
    ),
    "",
    "## Evaluation Scores",
    "",
    `| Dimension | Score |`,
    `|---|---|`,
    `| Requirement coverage | ${(ev.requirement_coverage * 100).toFixed(0)}% |`,
    `| Targeting clarity | ${(ev.targeting_clarity * 100).toFixed(0)}% |`,
    `| QA completeness | ${(ev.qa_completeness * 100).toFixed(0)}% |`,
    `| Risk detection | ${(ev.risk_detection * 100).toFixed(0)}% |`,
    `| Documentation quality | ${(ev.documentation_quality * 100).toFixed(0)}% |`,
    `| **Overall** | **${(ev.overall_score * 100).toFixed(0)}%** |`,
    "",
    "## Evaluator Notes",
    "",
    ev.overall_notes,
    "",
    ...(ev.flags.length > 0
      ? ["## Flags Requiring Human Review", "", ...ev.flags.map((f) => `- ${f}`), ""]
      : []),
    "---",
    "",
    "_This summary was generated by the HCP Brief Workflow Demo - a fictional prototype for interview demonstration purposes. All data is illustrative and sanitized. Not for operational use._",
  ];
  return lines.join("\n");
}
