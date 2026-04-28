import {
  sampleTraces, sampleRequirements, sampleEval, samplePlan, sampleDelivery, sampleRiskReview,
} from "@/data/sampleRun";
import {
  glucavanceTraces, glucavanceRequirements, glucavanceEval, glucavancePlan, glucavanceDelivery, glucavanceRiskReview,
} from "@/data/sampleRun2";

export const maxDuration = 30;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const STAGE_DELAYS: Record<string, number> = {
  intake: 1400,
  planner: 1400,
  delivery: 1400,
  compliance: 1400,
  qa: 2200,
  evaluator: 900,
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const briefId = url.searchParams.get("brief") ?? "cardivex";

  const traces = briefId === "glucavance" ? glucavanceTraces : sampleTraces;
  const requirements = briefId === "glucavance" ? glucavanceRequirements : sampleRequirements;
  const evalResult = briefId === "glucavance" ? glucavanceEval : sampleEval;
  const plan = briefId === "glucavance" ? glucavancePlan : samplePlan;
  const delivery = briefId === "glucavance" ? glucavanceDelivery : sampleDelivery;
  const riskReview = briefId === "glucavance" ? glucavanceRiskReview : sampleRiskReview;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const runStage = async (id: string) => {
        const trace = traces.find((t) => t.stage === id)!;
        send({ type: "stage", stage: id, status: "running" });
        await sleep(STAGE_DELAYS[id] ?? 1500);
        send({ type: "stage", stage: id, status: "success", duration_ms: trace.duration_ms, output_summary: trace.output_summary });
      };

      await runStage("intake");
      await runStage("planner");
      await runStage("delivery");

      // QA and Compliance run in parallel
      const qaTrace = traces.find((t) => t.stage === "qa")!;
      const compTrace = traces.find((t) => t.stage === "compliance")!;
      send({ type: "stage", stage: "qa", status: "running" });
      send({ type: "stage", stage: "compliance", status: "running" });
      await sleep(STAGE_DELAYS.compliance);
      send({ type: "stage", stage: "compliance", status: "success", duration_ms: compTrace.duration_ms, output_summary: compTrace.output_summary });
      await sleep(STAGE_DELAYS.qa - STAGE_DELAYS.compliance);
      send({ type: "stage", stage: "qa", status: "success", duration_ms: qaTrace.duration_ms, output_summary: qaTrace.output_summary });

      await runStage("evaluator");

      send({ type: "done", requirements, eval: evalResult, plan, delivery, riskReview });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
