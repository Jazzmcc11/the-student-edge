import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_college_app",
  title: "Add a college application",
  description: "Add a college to the signed-in user's application tracker.",
  inputSchema: {
    college_name: z.string().min(1),
    deadline_type: z
      .enum(["ED", "EDII", "EA", "RA", "RD", "Rolling"])
      .optional()
      .describe("Application round."),
    deadline_date: z.string().optional().describe("ISO date (YYYY-MM-DD)."),
    notes: z.string().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("college_applications")
      .insert({
        user_id: ctx.getUserId()!,
        college_name: input.college_name,
        deadline_type: input.deadline_type ?? null,
        deadline_date: input.deadline_date ?? null,
        notes: input.notes ?? null,
      })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Added ${data.college_name}` }],
      structuredContent: { row: data },
    };
  },
});
