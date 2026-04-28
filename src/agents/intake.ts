import { readFile } from "../lib/fs.js";
import { callClaude } from "../lib/claude.js";
import { RequirementsSchema, Requirements } from "../lib/schema.js";
import path from "path";

export async function runIntakeAgent(briefContent: string): Promise<Requirements> {
  const promptPath = path.join(process.cwd(), "prompts", "intake.md");
  const systemPrompt = await readFile(promptPath);

  const raw = await callClaude(systemPrompt, `Brief content:\n\n${briefContent}`, {
    maxTokens: 2048,
  });

  const jsonMatch = raw.match(/```json\s*([\s\S]*?)\s*```/) || raw.match(/(\{[\s\S]*\})/);
  const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : raw.trim();

  return RequirementsSchema.parse(JSON.parse(jsonStr));
}
