import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Scan key_dates for this user and upsert reminders matching their lead-day prefs. */
export const refreshMyReminders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("state, reminder_lead_days")
      .eq("id", userId)
      .maybeSingle();

    const leads: number[] = profile?.reminder_lead_days ?? [14, 7, 1];

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const horizon = new Date(today);
    horizon.setDate(horizon.getDate() + Math.max(...leads, 14));

    const { data: dates, error } = await supabase
      .from("key_dates")
      .select("id, title, description, date, state, url")
      .gte("date", today.toISOString().slice(0, 10))
      .lte("date", horizon.toISOString().slice(0, 10));
    if (error) throw new Error(error.message);

    const rows: any[] = [];
    for (const kd of dates ?? []) {
      if (kd.state && kd.state !== profile?.state) continue;
      const due = new Date(kd.date + "T00:00:00Z");
      const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);
      if (!leads.includes(diffDays)) continue;
      rows.push({
        user_id: userId,
        key_date_id: kd.id,
        title: kd.title,
        body: kd.description,
        due_date: kd.date,
        days_out: diffDays,
        url: kd.url,
      });
    }

    let created = 0;
    if (rows.length) {
      const { data, error: upErr } = await supabase
        .from("reminders")
        .upsert(rows, { onConflict: "user_id,key_date_id,days_out", ignoreDuplicates: true })
        .select("id");
      if (upErr) throw new Error(upErr.message);
      created = data?.length ?? 0;
    }
    return { ok: true, created };
  });
