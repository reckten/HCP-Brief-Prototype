import { describe, it, expect } from "vitest";
import { generateRunId } from "../src/lib/fs.js";

describe("generateRunId", () => {
  it("returns string starting with 'run-'", () => {
    const id = generateRunId();
    expect(id.startsWith("run-")).toBe(true);
  });

  it("returns unique values across two calls", async () => {
    const a = generateRunId();
    await new Promise((r) => setTimeout(r, 1100));
    const b = generateRunId();
    expect(a).not.toBe(b);
  });
});
