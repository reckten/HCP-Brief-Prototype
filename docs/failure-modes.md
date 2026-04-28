# Failure Modes

This document catalogs known failure modes for the HCP Brief Workflow demo, how they manifest today, what the current mitigation is, and what a production system would do differently.

---

## 1. LLM Output Failures

### 1.1 JSON parse failure (intake / evaluator)
- **Description:** Model returns text that is not valid JSON, or wraps JSON in extra prose.
- **Manifests as:** `JSON.parse` throws; pipeline aborts at intake or evaluator.
- **Current mitigation:** Agent extracts JSON via regex (`/```json...```/` or `/{...}/`) before parsing; `callClaude` retries up to 2 times.
- **Production:** Switch to a structured output / tool-use API contract; validate against schema and reroute failed parses to a repair LLM call with the schema as input.

### 1.2 Schema mismatch
- **Description:** JSON parses but fails Zod validation (missing field, wrong type, extra trailing comma swallowed).
- **Manifests as:** `RequirementsSchema.parse` throws `ZodError`.
- **Current mitigation:** Crash with a readable Zod error.
- **Production:** Auto-repair pass with the schema and the offending output; persist both the failed and repaired output for AgentOps review.

### 1.3 Hallucinated fields
- **Description:** Model invents audience codes, channels, or risks that the brief does not mention.
- **Manifests as:** Output passes schema but contains content not grounded in the input.
- **Current mitigation:** Prompts explicitly forbid invention and require empty arrays for missing fields. The evaluator stage scores this dimension.
- **Production:** Add a grounded-attribution check (every field must cite a brief snippet) and a separate guardrail LLM that flags ungrounded content before downstream stages run.

### 1.4 Truncated output
- **Description:** Model hits `max_tokens` mid-response.
- **Manifests as:** Truncated JSON (parse error) or truncated markdown (downstream stages get incomplete inputs).
- **Current mitigation:** Generous `max_tokens` per stage (1024-3000); JSON regex picks up balanced braces.
- **Production:** Detect truncation via `stop_reason === "max_tokens"`, automatically continue, and stitch the response.

---

## 2. Brief Quality Failures

### 2.1 Incomplete brief
- **Description:** Brief omits an entire section (audience, channel, objective).
- **Manifests as:** Empty fields in `requirements.json`.
- **Current mitigation:** Intake prompt requires empty arrays/strings and forces a `blockers` entry.
- **Production:** Pre-flight validator before any LLM call; reject the brief with a structured error and a checklist of missing required sections.

### 2.2 Contradictory objectives
- **Description:** Brief states education-led and prescribing-driven goals simultaneously.
- **Manifests as:** Risk surfaced inconsistently across stages.
- **Current mitigation:** Prompts at intake and compliance call out contradictions explicitly.
- **Production:** Dedicated contradiction-detection pass with a small classifier; route to brand team review before pipeline starts.

### 2.3 No audience specified
- **Description:** Audience block missing or `[]`.
- **Manifests as:** Delivery package has empty audience table.
- **Current mitigation:** Compliance and planner stages flag the gap.
- **Production:** Hard-fail at intake; do not run downstream stages until audience exists.

### 2.4 No channel specified
- **Description:** Channel section absent.
- **Manifests as:** Planner picks a default channel without strong grounding.
- **Current mitigation:** Planner prompt forces an Ambiguities section.
- **Production:** Refuse to generate a delivery package without channels; route back to brief author.

---

## 3. Targeting Failures

### 3.1 Overbroad audience
- **Description:** Audience definition matches an implausibly large HCP population (e.g. "all PCPs nationwide").
- **Manifests as:** Compliance flag, but pipeline still produces a deliverable package.
- **Current mitigation:** Compliance prompt requires evaluation of minimum-necessary scope. Evaluator weights targeting clarity at 0.20.
- **Production:** Quantitative reach estimate from a real HCP database; hard threshold above which a human reviewer must approve.

### 3.2 Conflicting specialty + geography
- **Description:** Combinations that do not resolve to real HCPs (e.g. pediatric subspecialty in a single rural ZIP).
- **Manifests as:** Workflow proceeds with a fictional reach estimate.
- **Current mitigation:** Delivery package marks reach estimates as `[ILLUSTRATIVE]`.
- **Production:** Resolve the audience against a real targeting database before delivery package generation; fail closed on zero-match.

### 3.3 Zero-match scenario
- **Description:** Targeting returns no HCPs.
- **Manifests as:** Workflow outputs a delivery package for an empty audience.
- **Current mitigation:** QA test 14 and compliance prompts ask for feasibility check.
- **Production:** Stop the pipeline at the targeting resolution step; require brand team to broaden or cancel.

---

## 4. Compliance Failures

### 4.1 Compliance agent misses a flag
- **Description:** A real risk (off-label, fair-balance) is not surfaced.
- **Manifests as:** Risk review missing a category that should be present.
- **Current mitigation:** Prompt requires evaluation of all 6 categories; evaluator scores risk detection.
- **Production:** Multiple compliance passes (one per category) plus a human-in-the-loop review checkpoint before any launch.

### 4.2 False positive flood
- **Description:** Compliance agent flags everything at High severity, washing out signal.
- **Manifests as:** Reviewer fatigue; real risks lost in noise.
- **Current mitigation:** Prompt explicitly says "Severity must reflect actual risk, not be inflated."
- **Production:** Calibrate severity against historical labeled examples; reject runs with implausible flag counts.

### 4.3 Disclaimer omission
- **Description:** Compliance memo missing the required educational-simulation disclaimer.
- **Manifests as:** Demo artifact looks like real legal advice.
- **Current mitigation:** Prompt mandates the disclaimer line verbatim.
- **Production:** Post-process check (string match) that fails the stage if the disclaimer is missing.

---

## 5. Infrastructure Failures

### 5.1 API key missing
- **Description:** `ANTHROPIC_API_KEY` not set.
- **Manifests as:** SDK throws on first call; pipeline aborts.
- **Current mitigation:** Top-level error message; users can view pre-generated `runs/sample-run/` without an API key.
- **Production:** Pre-flight key check; clear setup guidance; fallback to cached sample run for demos.

### 5.2 Rate limit
- **Description:** Anthropic API returns 429.
- **Manifests as:** `callClaude` retry loop exhausts; pipeline aborts at the affected stage.
- **Current mitigation:** 2 retries with 1s delay.
- **Production:** Exponential backoff with jitter; queue with max-concurrency; alert on sustained rate-limit windows.

### 5.3 Timeout
- **Description:** API call hangs longer than expected.
- **Manifests as:** Slow run; user sees stalled stage.
- **Current mitigation:** Default SDK timeout.
- **Production:** Per-stage timeout budget, mid-run cancellation, and resumable checkpointing so a hung stage does not waste the full run.

### 5.4 Disk write failure
- **Description:** `runs/<id>/` cannot be written.
- **Manifests as:** Stage succeeds in-memory but artifact is lost.
- **Current mitigation:** `ensureDir` before every write; errors propagate.
- **Production:** Atomic writes (tmp + rename); retry; fall back to S3 / object storage with read-after-write consistency.

---

## 6. Evaluation Failures

### 6.1 Eval agent score inflation
- **Description:** Evaluator returns 0.95+ across all dimensions regardless of actual quality.
- **Manifests as:** Overall score does not track real workflow quality; AgentOps loses signal.
- **Current mitigation:** Prompt explicitly instructs honest scoring; weighted average; flags array.
- **Production:** Calibrate against a held-out labeled set; track score-vs-human-review delta over time; auto-flag runs where the evaluator score and human review disagree by more than a threshold.

### 6.2 Eval JSON parse failure
- **Description:** Evaluator returns prose or invalid JSON.
- **Manifests as:** Pipeline crashes on the final stage after all upstream work is complete.
- **Current mitigation:** Same JSON-extraction regex as intake; 2 retries.
- **Production:** Persist all upstream artifacts before evaluator runs (already done); evaluator failure does not invalidate the run, just produces an "unscored" status; offline batch re-evaluation.
