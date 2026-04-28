# Demo Script - HCP Brief Workflow (5-10 min)

This script is the spoken narration for an interview walkthrough. Times are approximate. Keep it conversational; lean on the artifacts, not the slides.

---

## 1. Opening (30 seconds)

> "This is a fictional internal workflow prototype I built to explore what an HCP brief intake to delivery pipeline might look like if you wired it together with AI agents. Everything in it is made up - no real brand, no real drug, no PHI - but the structure mirrors how a real brand team brief moves through planning, delivery, QA, compliance, and evaluation."

**Talking point:** Frame this as adjacent to Relevate Health's HCP engagement work, not internal knowledge.

---

## 2. Brief Walkthrough (1 minute)

**Open:** `briefs/sample-brief.md`

> "The input is a markdown brief from a fictional brand team called BioReach Therapeutics. They want to run an education-led initiative around a fictional condition called Chronic Peripheral Signal Disruption, targeting neurologists and PCPs across five Northeast states. Two channels: EHR point-of-care sidebar cards, and on-demand CME modules."

**Highlight quickly:**
- Target Audience block with `[ILLUSTRATIVE]` codes.
- Open Questions section - the brief explicitly admits gaps.
- Risks and Compliance Notes.

**Pause** (~2 seconds) and say:
> "Notice the brief is realistic - not perfect. It has gaps. The workflow's job is to surface those gaps, not paper over them."

---

## 3. Architecture Walkthrough (2 minutes)

**Open:** `src/pipeline.ts`

> "The pipeline is six sequential agents. Each one is a single LLM call with a focused prompt."

Walk through the stages out loud:
1. **Intake** - markdown to structured JSON.
2. **Planner** - JSON to phased execution plan.
3. **Delivery** - JSON + plan to operational package.
4. **QA** - JSON + delivery to test plan with 8 required categories.
5. **Compliance** - JSON + delivery to flagged risk memo.
6. **Evaluator** - everything upstream to a calibrated quality JSON.

**Open:** `prompts/` directory

> "Every prompt lives in markdown next to the code. This was deliberate. If a brand team wants to tighten the compliance prompt, they edit a markdown file - they don't touch TypeScript. That separation matters in regulated workflows."

**Open:** `src/lib/`

> "The lib layer handles the boring stuff: Anthropic SDK wrapper with prompt caching, Zod schemas for every typed output, a tracer that emits per-stage timing for AgentOps, and filesystem helpers."

**Skip:** internal types unless asked.

---

## 4. Artifact Walkthrough (3 minutes)

**Open:** `runs/sample-run/`

Walk through each file in order:

### `requirements.json`
> "The intake stage extracted structured fields. Notice the `open_questions` array - frequency cap, opt-out, measurement plan - these are gaps the brief surfaced. The agent did not invent answers."

### `plan.md`
> "The planner picked EHR-triggered as primary, CME as secondary. Three phases. And critically, the Surfaced Ambiguities section at the bottom calls out that the audience scope is too broad. The workflow is not afraid to push back."

### `delivery-package.md`
> "Operational handoff. Audience table, trigger criteria, frequency cap, suppression rules, out-of-scope section. This is the artifact a brand team lead would actually approve."

### `test-plan.md`
> "Eighteen tests across all eight required categories - including adversarial cases like prompt injection in free-text fields. Each test has a pass/fail criterion that's machine-checkable where possible, and the plan flags which tests still need human compliance judgment."

### `risk-review.md`
> "Four flags - audience overbreadth, fair-balance feasibility, CME independence, code mapping. Each has a severity, a category, and a concrete recommendation. And the disclaimer at the bottom is required by the prompt."

---

## 5. Eval and Trace (1 minute)

**Open:** `eval.json`

> "The evaluator scored this run at 0.82 overall. Targeting clarity is the lowest at 0.76 - that's honest. The audience is deliberately broad in this brief, and the workflow flagged it. If the evaluator returned 0.95 across the board, I'd be more worried, not less."

**Open:** `trace.json`

> "Per-stage timing, status, retry count, and a one-line output summary. This is the AgentOps view: every stage is observable and individually retryable. In a production system this would feed a dashboard."

---

## 6. Live Run Option (1 minute)

> "If I run `npm run demo` right now with an API key set, it processes the brief end-to-end in roughly 10-12 seconds and writes a fresh `runs/run-<timestamp>/` directory with the same shape of artifacts. The pre-generated `runs/sample-run/` is here so this whole walkthrough works without an API key."

**Optional:** show terminal output if time and key are available.

---

## 7. Closing (30 seconds)

> "What I wanted to show is the shape of the problem: how an AI workflow can take an unstructured brief and produce structured, reviewable, auditable outputs - including the unflattering parts. The compliance flags, the surfaced ambiguities, the calibrated eval scores. That's the part I think matters most for HCP engagement at Relevate's scale - precision and trustworthy outputs, not just generation."

---

## What to Highlight vs. Skip

**Highlight:**
- Surfaced ambiguities (planner) and flags (compliance) - the workflow's willingness to push back.
- Calibrated eval scores (not 0.95+).
- Prompts as markdown - editable by non-engineers.
- Per-stage trace - AgentOps thinking.

**Skip unless asked:**
- TypeScript build configuration.
- Zod schema internals.
- Specific token counts or pricing.
- Implementation details of the retry loop.
