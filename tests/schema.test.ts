import { describe, it, expect } from "vitest";
import {
  RequirementsSchema,
  StageTraceSchema,
  EvalResultSchema,
} from "../src/lib/schema.js";

describe("RequirementsSchema", () => {
  const valid = {
    objective: "Test objective",
    audience: {
      specialty: ["Neurology"],
      geography: ["Northeast US"],
      care_setting: ["outpatient"],
      illustrative_codes: ["[ILLUSTRATIVE] X"],
    },
    channels: ["EHR point-of-care"],
    content_type: "modules",
    assumptions: [],
    blockers: [],
    dependencies: [],
    open_questions: [],
    risks: [],
    recommended_path: "EHR primary",
  };

  it("parses valid input", () => {
    expect(() => RequirementsSchema.parse(valid)).not.toThrow();
  });

  it("rejects input missing a required field", () => {
    const invalid = { ...valid } as Record<string, unknown>;
    delete invalid.objective;
    expect(() => RequirementsSchema.parse(invalid)).toThrow();
  });
});

describe("StageTraceSchema", () => {
  it("parses valid input", () => {
    const trace = {
      run_id: "run-1",
      stage: "intake",
      status: "success" as const,
      started_at: "2026-04-26T10:00:00.000Z",
      ended_at: "2026-04-26T10:00:01.000Z",
      duration_ms: 1000,
      retry_count: 0,
      output_summary: "ok",
    };
    expect(() => StageTraceSchema.parse(trace)).not.toThrow();
  });
});

describe("EvalResultSchema", () => {
  const base = {
    requirement_coverage: 0.8,
    targeting_clarity: 0.8,
    qa_completeness: 0.8,
    risk_detection: 0.8,
    documentation_quality: 0.8,
    overall_score: 0.8,
    overall_notes: "ok",
    flags: [],
  };

  it("rejects score > 1", () => {
    expect(() =>
      EvalResultSchema.parse({ ...base, requirement_coverage: 1.2 })
    ).toThrow();
  });

  it("rejects score < 0", () => {
    expect(() =>
      EvalResultSchema.parse({ ...base, targeting_clarity: -0.1 })
    ).toThrow();
  });
});
