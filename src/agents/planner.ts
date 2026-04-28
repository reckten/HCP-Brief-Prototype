import { readFile } from "../lib/fs.js";
import { callClaude } from "../lib/claude.js";
import { Requirements } from "../lib/schema.js";
import path from "path";

export async function runPlannerAgent(requirements: Requirements): Promise<string> {
  const promptPath = path.join(process.cwd(), "prompts", "planner.md");
  const systemPrompt = await readFile(promptPath);

  const userContent = `Requirements:\n\n${JSON.stringify(requirements, null, 2)}`;
  return callClaude(systemPrompt, userContent, { maxTokens: 2048 });
}
