import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const inputSchema = z.object({
  messages: z.array(messageSchema).min(1).max(30),
  subject: z.string().max(80).optional(),
});

const SYSTEM_PROMPT = `You are The Plug's AI tutor for high school students. You are warm, encouraging, and direct — like a really smart older sibling who went to an HBCU and knows how to break things down.

Rules:
- Explain concepts clearly with examples relevant to high schoolers.
- For math/science, show steps. Never just give the answer to homework — guide them.
- For essays, give specific feedback, don't rewrite for them.
- For college/career questions, be practical and specific.
- Keep responses focused — 2-4 short paragraphs unless they ask for depth.
- Use plain language. No condescension. Hype them up when they get it.`;

export const askTutor = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured yet.");

    const gateway = createOpenAICompatible({
      name: "lovable",
      baseURL: "https://ai.gateway.lovable.dev/v1",
      headers: { "Lovable-API-Key": apiKey },
    });

    const subjectLine = data.subject ? `\n\nCurrent subject focus: ${data.subject}.` : "";

    try {
      const { text } = await generateText({
        model: gateway("anthropic/claude-sonnet-4-5"),
        system: SYSTEM_PROMPT + subjectLine,
        messages: data.messages,
      });
      return { text };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      if (msg.includes("429")) throw new Error("Tutor is busy — try again in a moment.");
      if (msg.includes("402")) throw new Error("AI credits exhausted. Ask an admin to top up.");
      throw new Error("Tutor hit an error: " + msg);
    }
  });
