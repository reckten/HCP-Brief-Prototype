import { readFile } from "../lib/fs.js";
import { callClaude } from "../lib/claude.js";
import { Requirements } from "../lib/schema.js";
import path from "path";

export async function runQaAgent(
  requirements: Requirements,
  deliveryPackage: string
): Promise<string> {
  const promptPath = path.join(process.cwd(), "prompts", "qa.md");
  const systemPrompt = await readFile(promptPath);

  const userContent = `Requirements:\n\n${JSON.stringify(
    requirements,
    null,
    2
  )}\n\nDelivery Package:\n\n${deliveryPackage}`;
  return callClaude(systemPrompt, userContent, { maxTokens: 3000 });
}
