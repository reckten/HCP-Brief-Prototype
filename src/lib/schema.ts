import { z } from "zod";

export const AudienceSchema = z.object({
  specialty: z.array(z.string()),
  geography: z.array(z.string()),
  care_setting: z.array(z.string()),
  illustrative_codes: z.array(z.string()),
});

export const RequirementsSchema = z.object({
  objective: z.string(),
  audience: AudienceSchema,
  channels: z.array(z.string()),
  content_type: z.string(),
  assumptions: z.array(z.string()),
  blockers: z.array(z.string()),
  dependencies: z.array(z.string()),
  open_questions: z.array(z.string()),
  risks: z.array(z.string()),
  recommended_path: z.string(),
});

export const StageTraceSchema = z.object({
  run_id: z.string(),
  stage: z.string(),
  status: z.enum(["success", "failure", "skipped"]),
  started_at: z.string(),
  ended_at: z.string(),
  duration_ms: z.number(),
  retry_count: z.number(),
  output_summary: z.string(),
});

export const EvalResultSchema = z.object({
  requirement_coverage: z.number().min(0).max(1),
  targeting_clarity: z.number().min(0).max(1),
  qa_completeness: z.number().min(0).max(1),
  risk_detection: z.number().min(0).max(1),
  documentation_quality: z.number().min(0).max(1),
  overall_score: z.number().min(0).max(1),
  overall_notes: z.string(),
  flags: z.array(z.string()),
});

export type Audience = z.infer<typeof AudienceSchema>;
export type Requirements = z.infer<typeof RequirementsSchema>;
export type StageTrace = z.infer<typeof StageTraceSchema>;
export type EvalResult = z.infer<typeof EvalResultSchema>;
