import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_scholarship_app",
  title: "Add a scholarship application",
  description: "Add a scholarship application to the signed-in user's tracker.",
  inputSchema: {
    name: z.string().min(1).describe("Scholarship name."),
    date_applied: z.string().optional().describe("ISO date (YYYY-MM-DD) the user applied."),
    amount: z.number().optional().describe("Award amount in USD, if won."),
    received: z.boolean().optional().describe("Whether the award has been received."),
    notes: z.string().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("scholarship_applications")
      .insert({
        user_id: ctx.getUserId()!,
        name: input.name,
        date_applied: input.date_applied ?? null,
        amount: input.amount ?? null,
        received: input.received ?? false,
        notes: input.notes ?? null,
      })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Added ${data.name}` }],
      structuredContent: { row: data },
    };
  },
});
