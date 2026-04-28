import { describe, it, expect } from "vitest";
import { Tracer } from "../src/lib/tracer.js";

describe("Tracer", () => {
  it("startStage returns a finish function", () => {
    const t = new Tracer("/tmp/does-not-need-to-exist");
    const stage = t.startStage("run-1", "intake");
    expect(typeof stage.finish).toBe("function");
    expect(typeof stage.started_at).toBe("string");
  });

  it("finish returns a valid StageTrace", () => {
    const t = new Tracer("/tmp/x");
    const stage = t.startStage("run-1", "intake");
    const trace = stage.finish("success", "ok");
    expect(trace.run_id).toBe("run-1");
    expect(trace.stage).toBe("intake");
    expect(trace.status).toBe("success");
    expect(trace.duration_ms).toBeGreaterThanOrEqual(0);
    expect(trace.retry_count).toBe(0);
  });

  it("getTraces returns accumulated traces", () => {
    const t = new Tracer("/tmp/x");
    t.startStage("run-1", "intake").finish("success", "a");
    t.startStage("run-1", "planner").finish("success", "b");
    expect(t.getTraces()).toHaveLength(2);
    expect(t.getTraces()[0].stage).toBe("intake");
    expect(t.getTraces()[1].stage).toBe("planner");
  });
});
