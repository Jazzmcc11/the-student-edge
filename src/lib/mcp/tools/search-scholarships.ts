import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_scholarships",
  title: "Search scholarships",
  description: "Search The Plug's scholarship database by keyword. Returns up to 20 matches.",
  inputSchema: {
    query: z.string().optional().describe("Keyword to match name or field. Omit for latest."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ query }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    let q = supabaseForUser(ctx)
      .from("scholarships")
      .select("id, name, amount, deadline, apply_url")
      .limit(20);
    if (query && query.trim()) q = q.ilike("name", `%${query.trim()}%`);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { rows: data ?? [] },
    };
  },
});
