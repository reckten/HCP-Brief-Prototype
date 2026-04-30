# How This Came Together

I built this over a weekend to have something concrete to talk about. Here are the decisions that shaped it, what broke along the way, and what I took away from it.

---

**Prompts live in markdown, not code**
I wanted a non-engineer to be able to edit the compliance prompt without opening a TypeScript file. Keeping the "what to ask" separate from the "how to run it" felt like the right call for anything that touches regulated content.

**QA and Compliance run in parallel**
Both stages only need the requirements and the delivery package. They don't depend on each other's output, so running them together cut total runtime by about 40%. Small thing, but it compounds at scale.

**The demo replays real outputs instead of calling the API live**
The hosted version runs on Vercel's free tier, which has a 10-second function timeout. Rather than fight that constraint, I pre-ran both briefs, stored the real outputs, and replay them with realistic delays. You're seeing actual agent output, just not generated in real time.

**The evaluator flags, but a human is the actual gate**
Right now the evaluator scores each run using its own judgment. In production, a score below a threshold would surface the brief for human review before anything moves to MLR. There's no calibration against real reviewed briefs yet, but that gets built over time as the team actually uses it.

**Two briefs instead of one**
A pipeline that scores everything 80+ tells you nothing. The Veltoza brief is intentionally underspecified. Vague metric, overbroad targeting, CME co-developed with the brand team. You can see what the compliance agent catches when given something real to push back on.

---

**What didn't work**

Free API tiers don't hold up under a sequential multi-call pipeline. I hit rate limit errors after the first couple of agent stages and had to build retry logic with backoff before switching to a paid tier. Predictable throughput isn't optional when each stage depends on the one before it.

JSON parsing from LLM output is more fragile than it looks. The agents return text with JSON embedded, and twice during development the model added extra commentary that broke the parser. The fix in production is using structured outputs so the contract is guaranteed, not assumed.

I also caught a dependency assumption early. I initially thought the Delivery stage could run in parallel with QA and Compliance. It can't. QA needs the delivery package before it can run. Mapping that out before writing the code saved a harder fix later.

---

**What I took away**

The compliance and evaluation stages are only as good as the briefs that feed them. The Veltoza brief exists because a perfect input doesn't tell you anything about how the system handles ambiguity. Real briefs will have gaps. The pipeline needs to surface those gaps, not paper over them.
