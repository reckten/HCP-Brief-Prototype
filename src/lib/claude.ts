import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const MODEL = "anthropic/claude-3-haiku";

function isRateLimit(err: unknown): boolean {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return msg.includes("429") || msg.includes("rate limit") || msg.includes("too many");
  }
  return false;
}

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

export async function callClaude(
  systemPrompt: string,
  userMessage: string,
  options: { maxTokens?: number } = {}
): Promise<string> {
  const maxTokens = options.maxTokens ?? 2048;
  // Backoff schedule: 20s, 45s, 90s for rate limits; 2s, 4s for other errors
  const rateLimitDelays = [20_000, 45_000, 90_000];
  const otherDelays = [2_000, 4_000];
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: MODEL,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      });

      const text = response.choices[0]?.message?.content;
      if (text) return text;
      throw new Error("No text content in response");
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < 3) {
        if (isRateLimit(err)) {
          const wait = rateLimitDelays[attempt] ?? 90_000;
          console.log(`  [rate limit] waiting ${wait / 1000}s before retry ${attempt + 1}/3...`);
          await sleep(wait);
        } else {
          await sleep(otherDelays[attempt] ?? 4_000);
        }
      }
    }
  }
  throw lastError ?? new Error("callClaude failed");
}
