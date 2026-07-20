import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, ArrowRight, X } from "lucide-react";

/**
 * Dismissible card on the student dashboard.
 * Shown when: user is a student AND is_athlete is false AND athlete_prompt_dismissed is false.
 * Clicking "Yes" flips is_athlete=true and routes to /athlete.
 * Clicking "Not me" flips athlete_prompt_dismissed=true.
 */
export function AthletePromptCard({ userId }: { userId: string }) {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("is_athlete, athlete_prompt_dismissed")
        .eq("id", userId)
        .maybeSingle();
      if (data && !data.is_athlete && !data.athlete_prompt_dismissed) setVisible(true);
    })();
  }, [userId]);

  async function enable() {
    setBusy(true);
    await supabase.from("profiles").update({ is_athlete: true }).eq("id", userId);
    window.location.href = "/athlete";
  }

  async function dismiss() {
    setBusy(true);
    await supabase.from("profiles").update({ athlete_prompt_dismissed: true }).eq("id", userId);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="mb-8 rounded-2xl border border-gold/40 bg-gradient-to-br from-gold/10 via-transparent to-transparent p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/15">
            <Trophy className="h-5 w-5 text-gold" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-gold">Student-athlete?</p>
            <h3 className="mt-1 font-display text-lg font-semibold">Playing college ball is a whole different game.</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              NCAA registration, core courses, sliding-scale GPA, coach contacts — turn on the athlete track and we'll walk you through it.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={dismiss}
            disabled={busy}
            className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 inline h-3 w-3" /> Not me
          </button>
          <button
            onClick={enable}
            disabled={busy}
            className="inline-flex items-center rounded-full bg-gold px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-gold/90"
          >
            Yes — set it up <ArrowRight className="ml-1.5 h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
