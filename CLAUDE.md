# HCP Brief Workflow Demo — CLAUDE.md

## Project Purpose

A fictional internal workflow prototype for interview demonstration. Simulates an agentic pipeline that converts a structured HCP engagement brief into a reviewable internal delivery package.

This is **not** a Relevate Health internal tool. It is a respectful, adjacent demo aligned to their publicly visible focus on HCP engagement, omnichannel activation, and AI-enabled precision workflows.

## Repository Layout

```
/
  CLAUDE.md               ← this file
  README.md
  briefs/
    sample-brief.md       ← one sample HCP engagement brief
  prompts/
    intake.md             ← brief parsing prompt
    planner.md            ← strategy/planning prompt
    delivery.md           ← artifact generation prompt
    qa.md                 ← QA test plan prompt
    compliance.md         ← risk/compliance review prompt
    evaluator.md          ← eval scoring prompt
  src/
    index.ts              ← CLI entry point
    pipeline.ts           ← orchestrates all stages in order
    agents/
      intake.ts           ← Brief Intake Agent
      planner.ts          ← Strategy/Planning Agent
      delivery.ts         ← Delivery Artifact Agent
      qa.ts               ← QA Agent
      compliance.ts       ← Compliance/Risk Agent
      evaluator.ts        ← AgentOps eval agent
    lib/
      claude.ts           ← Anthropic SDK client wrapper
      tracer.ts           ← run trace recorder
      fs.ts               ← file I/O helpers
      schema.ts           ← shared TypeScript types/schemas
  runs/
    sample-run/           ← pre-generated sample artifacts
  docs/
    project-spec.md
    build-plan.md
    failure-modes.md
    demo-script.md
```

## How to Run

```bash
npm install
npm run demo
# or
npx tsx src/index.ts briefs/sample-brief.md
```

Outputs land in `runs/<run-id>/`.

## Agent Stages (in order)

1. **Intake** — parse brief markdown → `requirements.json`
2. **Planner** — structured execution plan → `plan.md`
3. **Delivery** — internal delivery package → `delivery-package.md`
4. **QA** — test plan with edge cases → `test-plan.md`
5. **Compliance** — risk/compliance memo → `risk-review.md`
6. **Evaluator** — score run quality → `eval.json` + `summary.md`

## Key Constraints

- No database, no auth, no external integrations (mocked only)
- All data is fictional / sanitized — no real PHI or brand data
- One sample brief, one sample run
- Boring, inspectable implementation preferred
- TypeScript + Anthropic SDK (claude-sonnet-4-6 for agents)

## Model Guidance

- Agents call `claude-sonnet-4-6` by default
- Use prompt caching where applicable (system prompt prefix)
- Keep per-call context small — pass only what each stage needs

## Environment Variables

```
ANTHROPIC_API_KEY=sk-ant-...
```

## Testing

```bash
npm test
```

Covers: schema validation, tracer, fs helpers, and one integration smoke test.
