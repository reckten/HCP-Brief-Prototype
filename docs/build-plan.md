# Build Plan — HCP Brief Workflow Demo

## Execution Order

This plan is intentionally sequential. Each phase must be stable before the next begins.

---

## Phase 0 — Scaffold (Sonnet 4.6)

**Goal:** Create planning documents and empty folder structure.

Tasks:
- [x] Create `CLAUDE.md`
- [x] Create `docs/project-spec.md`
- [x] Create `docs/build-plan.md` (this file)
- [ ] Create empty dirs: `briefs/`, `prompts/`, `src/agents/`, `src/lib/`, `runs/sample-run/`, `docs/`

---

## Phase 1 — Architecture Pass (Opus 4.7)

**Goal:** Finalize all TypeScript interfaces, file contracts, and prompt designs before writing implementation.

Tasks:
- [ ] Define `src/lib/schema.ts` — all shared types (StageTrace, Requirements, EvalResult, etc.)
- [ ] Define `src/lib/tracer.ts` — trace recorder interface and implementation stub
- [ ] Define `src/lib/fs.ts` — file I/O helpers
- [ ] Define `src/lib/claude.ts` — Anthropic SDK client wrapper with caching
- [ ] Write all 6 prompt files under `prompts/`
- [ ] Define `src/pipeline.ts` — orchestration contract (stage list, run directory, trace aggregation)
- [ ] Define `src/index.ts` — CLI entry point (argv parsing, run-id generation, pipeline invocation)

**Deliverable:** All interfaces and prompt files committed. No implementation yet.

---

## Phase 2 — First Build (Opus 4.7)

**Goal:** Implement all agents and pipeline so `npm run demo` runs end-to-end.

Build order (bottom-up):
1. `src/lib/schema.ts` — types and zod schemas
2. `src/lib/claude.ts` — SDK wrapper, prompt caching, retry logic
3. `src/lib/tracer.ts` — trace writer
4. `src/lib/fs.ts` — read/write helpers
5. `src/agents/intake.ts` — Brief Intake Agent
6. `src/agents/planner.ts` — Strategy/Planning Agent
7. `src/agents/delivery.ts` — Delivery Artifact Agent
8. `src/agents/qa.ts` — QA Agent
9. `src/agents/compliance.ts` — Compliance/Risk Agent
10. `src/agents/evaluator.ts` — AgentOps Evaluator
11. `src/pipeline.ts` — wire all stages
12. `src/index.ts` — CLI entry + run-id + output directory

**Deliverable:** `npm run demo` runs without errors. All 6 artifacts written to `runs/<run-id>/`.

---

## Phase 3 — Sample Brief + Pre-generated Run

**Goal:** Produce `briefs/sample-brief.md` and pre-generate `runs/sample-run/` so the demo runs without a live API call.

Tasks:
- [ ] Write `briefs/sample-brief.md` — fictional HCP education initiative brief
- [ ] Run the pipeline once against the sample brief
- [ ] Copy output to `runs/sample-run/` and verify all artifacts are present and readable
- [ ] Add `--dry-run` flag or `USE_SAMPLE_RUN=true` env var that copies `runs/sample-run/` instead of calling the API

---

## Phase 4 — Docs and README

**Goal:** Complete all required documentation.

Tasks:
- [ ] Write `docs/failure-modes.md`
- [ ] Write `docs/demo-script.md`
- [ ] Write `README.md` (with "Why this is relevant to Relevate Health" section)

---

## Phase 5 — Tests

**Goal:** Demonstrate QA discipline.

Tasks:
- [ ] Write unit tests for `schema.ts` (zod validation happy/sad paths)
- [ ] Write unit tests for `tracer.ts`
- [ ] Write unit tests for `fs.ts`
- [ ] Write one integration smoke test (mock Claude responses, run full pipeline)
- [ ] Run `npm test` — all pass

---

## Phase 6 — Final Review

**Goal:** Validate against interview readiness criteria.

Checklist:
- [ ] Agent orchestration visible (6 stages, trace.json shows timing)
- [ ] QA depth visible (test-plan.md has 8+ categories)
- [ ] Observability visible (trace.json + eval.json per run)
- [ ] Written communication clear (summary.md readable in 2 min)
- [ ] Healthcare awareness visible (risk-review.md + disclaimers)
- [ ] Scope discipline maintained (no database, no auth, no frontend)
- [ ] `npm run demo` works in a clean checkout

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Claude output doesn't match expected JSON schema | Medium | High | Strict prompt with JSON-only instruction + zod parse + retry |
| API key missing in demo env | Medium | High | Pre-generated `runs/sample-run/` bypasses live API |
| Brief too vague for intake agent | Low | Medium | Prompt instructs agent to surface ambiguity explicitly |
| Compliance agent flags too many false positives | Low | Low | Prompt tuned for educational simulation framing |
| Run takes too long for live demo | Low | Medium | Pre-generated run used for demo; live run optional |

---

## Timeline Estimate

| Phase | Estimated Time |
|---|---|
| Phase 0 — Scaffold | 10 min |
| Phase 1 — Architecture | 20 min |
| Phase 2 — First Build | 60 min |
| Phase 3 — Sample Run | 15 min |
| Phase 4 — Docs | 20 min |
| Phase 5 — Tests | 20 min |
| Phase 6 — Review | 15 min |
| **Total** | **~2.5 hours** |
