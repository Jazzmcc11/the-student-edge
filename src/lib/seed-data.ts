import { supabase } from "@/integrations/supabase/client";

/**
 * Populate a brand-new student account with sample data so the dashboard
 * doesn't look broken/empty on first login. Idempotent-ish: only inserts
 * if the student has zero scholarship apps.
 */
export async function seedStudentSample(userId: string) {
  const { count } = await supabase
    .from("scholarship_applications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if ((count || 0) > 0) return { skipped: true };

  const today = new Date();
  const in30 = new Date(today.getTime() + 30 * 86400000).toISOString().slice(0, 10);
  const in14 = new Date(today.getTime() + 14 * 86400000).toISOString().slice(0, 10);

  await Promise.all([
    supabase.from("scholarship_applications").insert([
      { user_id: userId, name: "Gates Scholarship", date_applied: today.toISOString().slice(0, 10), received: false, amount: null },
      { user_id: userId, name: "Coca-Cola Scholars", date_applied: null, received: false, amount: null },
      { user_id: userId, name: "Local community award", date_applied: today.toISOString().slice(0, 10), received: true, amount: 500 },
    ]),
    supabase.from("college_applications").insert([
      { user_id: userId, college_name: "Howard University", deadline_date: in30, submitted: false },
      { user_id: userId, college_name: "Spelman College", deadline_date: in14, submitted: false },
    ]),
    supabase.from("wins").insert({
      user_id: userId,
      scholarship_name: "Local community award",
      amount: 500,
      note: "First scholarship win — small but it counts!",
    }),
    supabase.from("essays").insert({
      user_id: userId,
      title: "Common App personal statement (draft)",
      prompt_type: "personal_statement",
      word_limit: 650,
      status: "brainstorming",
      draft_content: "",
    }),
  ]);

  return { skipped: false };
}
