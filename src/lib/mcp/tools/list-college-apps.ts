import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_college_apps",
  title: "List my college applications",
  description: "List the signed-in user's college applications with Common App checklist status.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("college_applications")
      .select(
        "id, college_name, deadline_type, deadline_date, submitted, accepted, common_app_submitted, supplements_submitted, recs_submitted, transcript_sent, scores_sent, notes",
      )
      .order("deadline_date", { ascending: true, nullsFirst: false });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { rows: data ?? [] },
    };
  },
});
