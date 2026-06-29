import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

/**
 * Scans key_dates and creates in-app reminders (and email-pending rows)
 * for each user at their configured lead days (default 14, 7, 1).
 * Safe to run daily — UNIQUE(user_id, key_date_id, days_out) prevents dupes.
 */
export const Route = createFileRoute("/api/public/hooks/check-deadlines")({
  server: {
    handlers: {
      POST: async () => {
        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false, autoRefreshToken: false } },
        );

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        // Load all profiles with their state + lead days + opt-in
        const { data: profiles, error: pErr } = await supabase
          .from("profiles")
          .select("id, state, email, full_name, email_reminders, reminder_lead_days, user_type");
        if (pErr) {
          return new Response(JSON.stringify({ error: pErr.message }), { status: 500 });
        }

        // Load all upcoming key_dates within max lead window (60d buffer)
        const horizon = new Date(today);
        horizon.setDate(horizon.getDate() + 60);
        const { data: dates, error: dErr } = await supabase
          .from("key_dates")
          .select("id, title, description, category, date, state, url")
          .gte("date", today.toISOString().slice(0, 10))
          .lte("date", horizon.toISOString().slice(0, 10));
        if (dErr) {
          return new Response(JSON.stringify({ error: dErr.message }), { status: 500 });
        }

        const inserts: any[] = [];
        for (const profile of profiles ?? []) {
          const leads: number[] = profile.reminder_lead_days ?? [14, 7, 1];
          for (const kd of dates ?? []) {
            // Filter: federal (no state) applies to all; state-specific only to that state
            if (kd.state && kd.state !== profile.state) continue;

            const due = new Date(kd.date + "T00:00:00Z");
            const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);
            if (!leads.includes(diffDays)) continue;

            inserts.push({
              user_id: profile.id,
              key_date_id: kd.id,
              title: kd.title,
              body: kd.description,
              due_date: kd.date,
              days_out: diffDays,
              url: kd.url,
            });
          }
        }

        let created = 0;
        if (inserts.length) {
          // onConflict: ignore dupes via unique constraint
          const { data, error } = await supabase
            .from("reminders")
            .upsert(inserts, { onConflict: "user_id,key_date_id,days_out", ignoreDuplicates: true })
            .select("id");
          if (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
          }
          created = data?.length ?? 0;
        }

        // TODO: once email domain is configured, batch-send emails for
        // reminders WHERE emailed_at IS NULL AND user has email_reminders=true,
        // then stamp emailed_at.

        return new Response(
          JSON.stringify({ ok: true, scanned: dates?.length ?? 0, created }),
          { headers: { "content-type": "application/json" } },
        );
      },
    },
  },
});
