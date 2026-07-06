import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const inputSchema = z.object({
  draft: z.string().min(1).max(20000),
  prompt: z.string().max(2000).optional(),
  action: z.enum([
    "feedback",
    "tighten",
    "voice",
    "verbs",
    "hook",
    "brainstorm",
  ]),
});

const SYSTEM = `You are an essay coach for high school students applying to college. You never rewrite their essay for them. You help them think, ask sharper questions, and give surgical, honest, encouraging feedback.

Your voice: warm, direct, like a mentor who's read a thousand college essays. Zero corporate speak. Zero "As an AI".

When giving feedback:
- Point to specific lines or moments, not vague generalities.
- Say what's working before what's not.
- End with ONE concrete next step, not a laundry list.
- Never write a "revised version" for them. Suggest, don't ghostwrite.

Keep responses under 250 words unless they asked for depth.`;

const ACTION_PROMPTS: Record<string, string> = {
  feedback: "Give overall feedback: what's landing, what's weak, one concrete next move.",
  tighten: "Point out where the writing is bloated. Quote 2-3 specific lines they could cut or condense. Don't rewrite them.",
  voice: "Where does their voice come through strongest? Where does it disappear or sound generic? Be specific.",
  verbs: "Flag weak or passive verbs. List 5-8 lines where a stronger verb would change the energy. Don't provide the replacements — make them do it.",
  hook: "Diagnose their opening. Does it earn the reader's attention in the first 2 sentences? Why or why not?",
  brainstorm: "They're stuck. Ask 4 pointed questions that would help them find the real story hiding in this draft.",
};

export const coachEssay = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured yet.");

    const gateway = createOpenAICompatible({
      name: "lovable",
      baseURL: "https://ai.gateway.lovable.dev/v1",
      headers: { "Lovable-API-Key": apiKey },
    });

    const promptLine = data.prompt ? `\n\nESSAY PROMPT:\n${data.prompt}` : "";
    const userMsg = `${ACTION_PROMPTS[data.action]}${promptLine}\n\nDRAFT:\n${data.draft}`;

    try {
      const { text } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        system: SYSTEM,
        messages: [{ role: "user", content: userMsg }],
      });
      return { text };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      if (msg.includes("429")) throw new Error("Coach is busy — try again in a moment.");
      if (msg.includes("402")) throw new Error("AI credits exhausted.");
      throw new Error("Coach hit an error: " + msg);
    }
  });
