import { supabase } from "@/integrations/supabase/client";

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Up late";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Burning the midnight oil";
}

export function greetingEmoji(): string {
  const h = new Date().getHours();
  if (h < 5) return "🌙";
  if (h < 12) return "🌅";
  if (h < 17) return "☀️";
  if (h < 21) return "🌇";
  return "🌙";
}

// Fire-and-forget activity ping + optional last-visited update.
export async function pingActivity(moduleName?: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    await supabase.from("activity_pings").upsert({ user_id: user.id, day: today });
    if (moduleName) {
      await supabase
        .from("profiles")
        .update({ last_visited_module: moduleName, last_visited_at: new Date().toISOString() })
        .eq("id", user.id);
    }
  } catch {
    // silent
  }
}

// Calculate current streak (consecutive days ending today or yesterday).
export async function getStreak(userId: string): Promise<number> {
  const since = new Date();
  since.setDate(since.getDate() - 60);
  const { data } = await supabase
    .from("activity_pings")
    .select("day")
    .eq("user_id", userId)
    .gte("day", since.toISOString().slice(0, 10))
    .order("day", { ascending: false });

  if (!data || data.length === 0) return 0;

  const days = new Set(data.map((r: any) => r.day));
  let streak = 0;
  const cursor = new Date();
  // Allow streak to be valid if today OR yesterday has a ping (don't penalize for not opening yet today).
  const todayStr = cursor.toISOString().slice(0, 10);
  if (!days.has(todayStr)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export const MODULE_META: Record<string, { label: string; to: string }> = {
  scholarships: { label: "Scholarship Database", to: "/scholarships" },
  tracker: { label: "Application Tracker", to: "/tracker/scholarships" },
  community: { label: "Community", to: "/community/wins" },
  family: { label: "Family", to: "/family" },
  personality: { label: "Personality Test", to: "/personality" },
  profile: { label: "Profile", to: "/profile" },
};
