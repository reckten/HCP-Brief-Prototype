# Project Specification — HCP Brief Workflow Demo

## Overview

**Project:** HCP Brief Workflow Demo  
**Type:** Fictional internal workflow prototype (interview demonstration)  
**Target role:** Associate Agentic Engineer, Relevate Health  
**Author:** Candidate — help@4delta.com  
**Date:** 2026-04-26  

---

## Problem Statement

Brand teams working in HCP engagement frequently produce unstructured briefs that must be manually decomposed into targeting criteria, channel plans, delivery notes, QA checklists, and compliance reviews before they can be operationalized. This process is slow, error-prone, and inconsistently documented.

This demo simulates a small agentic workflow that automates that decomposition in a traceable, reviewable way — producing structured artifacts instead of unreviewed free-form notes.

---

## Scope

### In Scope (MVP)

- TypeScript CLI entry point (`src/index.ts`)
- One markdown brief as input (`briefs/sample-brief.md`)
- Six sequential agent stages (intake → planner → delivery → QA → compliance → evaluator)
- Structured JSON and markdown artifacts written to `runs/<run-id>/`
- Run trace and eval scoring
- Pre-generated `runs/sample-run/` for demo without live API calls
- Docs: failure-modes, demo-script, project-spec, build-plan

### Out of Scope

- Real PHI, real brand data, or real Relevate Health internal systems
- Database persistence
- Authentication or authorization
- Frontend or dashboard
- Streaming responses
- Parallel agent execution
- More than one sample brief or run

---

## Agent Stage Specifications

### Stage 1 — Brief Intake Agent

**Input:** Raw markdown brief text  
**Output:** `requirements.json`  
**Responsibility:** Extract and structure all brief contents into named fields.

Required fields:
- `objective` (string)
- `audience` (object: specialty, geography, care_setting, illustrative_codes)
- `channels` (string[])
- `content_type` (string)
- `assumptions` (string[])
- `blockers` (string[])
- `dependencies` (string[])
- `open_questions` (string[])
- `risks` (string[])
- `recommended_path` (string — high-level, e.g. "EHR-triggered messaging")

**Quality bar:** Must not invent fields not present in the brief. Must flag ambiguity explicitly.

---

### Stage 2 — Strategy / Planning Agent

**Input:** `requirements.json`  
**Output:** `plan.md`  
**Responsibility:** Convert structured requirements into an actionable execution plan.

Plan must include:
- Recommended engagement path (EHR-triggered, on-demand content, etc.)
- Rationale for path selection
- Key assumptions and escalation points
- Dependency sequencing
- Identified ambiguities that require human review

**Quality bar:** Must not paper over gaps. Ambiguity should be surfaced, not hidden.

---

### Stage 3 — Delivery Artifact Agent

**Input:** `requirements.json` + `plan.md`  
**Output:** `delivery-package.md`  
**Responsibility:** Generate a minimal internal delivery scaffold.

Package must include:
- Audience attributes
- Channel recommendation
- Trigger criteria
- Content type and format
- Delivery notes
- Implementation assumptions

**Quality bar:** Must be readable by a non-technical stakeholder. Must not over-engineer.

---

### Stage 4 — QA Agent

**Input:** `requirements.json` + `delivery-package.md`  
**Output:** `test-plan.md`  
**Responsibility:** Produce a first-class QA artifact covering normal and adversarial cases.

Test plan must include:
- Happy path cases (valid brief, expected output)
- Incomplete brief cases (missing fields)
- Conflicting targeting cases
- Overbroad audience cases
- Wrong channel recommendation cases
- Missing compliance note cases
- Edge cases (e.g., zero matching HCPs, multi-indication overlap)
- Adversarial cases (e.g., brief with contradictory objectives)

**Quality bar:** Tests must not be weakened to make the workflow look better. Failures are expected and documented honestly.

---

### Stage 5 — Compliance / Risk Agent

**Input:** `requirements.json` + `delivery-package.md`  
**Output:** `risk-review.md`  
**Responsibility:** Review outputs for healthcare-aware concerns.

Review must flag:
- Minimum-necessary concerns (audience too broad)
- Risky data assumptions (PII/PHI risk if real data were used)
- Ambiguous targeting criteria
- Vague language that could lead to overreach
- Missing off-label, fair balance, or promotional guardrails
- Unrealistic or unsubstantiated claims

**Disclaimer:** This is educational simulation only. Not legal or regulatory advice.

---

### Stage 6 — AgentOps Evaluator

**Input:** All stage outputs  
**Output:** `eval.json` + `summary.md`  
**Responsibility:** Score the run and produce a plain-English summary.

`eval.json` fields:
- `requirement_coverage` (0–1 float)
- `targeting_clarity` (0–1 float)
- `qa_completeness` (0–1 float)
- `risk_detection` (0–1 float)
- `documentation_quality` (0–1 float)
- `overall_score` (0–1 float, weighted average)
- `overall_notes` (string)
- `flags` (string[] — any items requiring human review)

`summary.md` must be readable by a hiring manager in under 2 minutes.

---

## Artifact Schema

### `trace.json`

Array of stage trace entries:

```typescript
interface StageTrace {
  run_id: string;
  stage: string;
  status: "success" | "failure" | "skipped";
  started_at: string;   // ISO 8601
  ended_at: string;
  duration_ms: number;
  retry_count: number;
  output_summary: string;
}
```

---

## Data Constraints

- All HCP data is fictional and illustrative only
- No real ICD-10, NDC, or CPT codes linked to real clinical decisions
- No real brand names or drug names
- Labels like `[ILLUSTRATIVE]` or `[FICTIONAL]` used throughout
- No PHI or PII in any artifact

---

## Technical Stack

| Concern | Choice |
|---|---|
| Language | TypeScript 5.x |
| Runtime | Node.js 20+ / tsx |
| LLM SDK | @anthropic-ai/sdk |
| Model | claude-sonnet-4-6 |
| File I/O | Node fs/promises |
| Schema validation | zod |
| Testing | vitest |
| Formatting | No special framework — plain markdown and JSON |

---

## Interview Readiness Criteria

| Criterion | Target |
|---|---|
| Scoped agent orchestration | 6 distinct stages, sequential pipeline |
| QA depth | 8+ test categories, adversarial cases included |
| Observability | trace.json + eval.json per run |
| Written communication | summary.md readable by non-engineer |
| Healthcare awareness | Compliance stage + data disclaimers throughout |
| Scope discipline | One brief, one run, no database, no frontend |
