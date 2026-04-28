import { readFile } from "../lib/fs.js";
import { callClaude } from "../lib/claude.js";
import { EvalResultSchema, EvalResult, Requirements } from "../lib/schema.js";
import path from "path";

export async function runEvaluatorAgent(
  requirements: Requirements,
  plan: string,
  deliveryPackage: string,
  testPlan: string,
  riskReview: string
): Promise<EvalResult> {
  const promptPath = path.join(process.cwd(), "prompts", "evaluator.md");
  const systemPrompt = await readFile(promptPath);

  const userContent = [
    `Requirements:\n${JSON.stringify(requirements, null, 2)}`,
    `Plan:\n${plan}`,
    `Delivery Package:\n${deliveryPackage}`,
    `Test Plan:\n${testPlan}`,
    `Risk Review:\n${riskReview}`,
  ].join("\n\n---\n\n");

  const raw = await callClaude(systemPrompt, userContent, { maxTokens: 1024 });

  const jsonMatch = raw.match(/```json\s*([\s\S]*?)\s*```/) || raw.match(/(\{[\s\S]*\})/);
  const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : raw.trim();

  return EvalResultSchema.parse(JSON.parse(jsonStr));
}
