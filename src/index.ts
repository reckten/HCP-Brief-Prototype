import "dotenv/config";
import path from "path";
import { readFile, generateRunId } from "./lib/fs.js";
import { runPipeline } from "./pipeline.js";

async function main() {
  const briefPath = process.argv[2];
  if (!briefPath) {
    console.error("Usage: npx tsx src/index.ts <path-to-brief.md>");
    process.exit(1);
  }

  const resolvedPath = path.resolve(briefPath);
  console.log(`Reading brief: ${resolvedPath}`);

  const briefContent = await readFile(resolvedPath);
  const runId = generateRunId();

  await runPipeline(briefContent, runId);
}

main().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
