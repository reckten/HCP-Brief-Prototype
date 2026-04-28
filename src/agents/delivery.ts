import { readFile } from "../lib/fs.js";
import { callClaude } from "../lib/claude.js";
import { Requirements } from "../lib/schema.js";
import path from "path";

export async function runDeliveryAgent(
  requirements: Requirements,
  plan: string
): Promise<string> {
  const promptPath = path.join(process.cwd(), "prompts", "delivery.md");
  const systemPrompt = await readFile(promptPath);

  const userContent = `Requirements:\n\n${JSON.stringify(
    requirements,
    null,
    2
  )}\n\nExecution Plan:\n\n${plan}`;
  return callClaude(systemPrompt, userContent, { maxTokens: 2048 });
}
