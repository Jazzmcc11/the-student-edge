import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, Trophy, Users, GraduationCap, Sparkles, ArrowRight } from "lucide-react";

type UserType = "student" | "parent";

const STEPS: Record<UserType, { title: string; body: string; cta: { to: string; label: string }; icon: any }[]> = {
  student: [
    { title: "Browse the scholarship database", body: "Real scholarships you can filter and save. Start with one that fits.", cta: { to: "/scholarships", label: "Open database" }, icon: Search },
    { title: "Track what you apply to", body: "Log colleges and scholarships. We tally what you've won automatically.", cta: { to: "/tracker/scholarships", label: "Open tracker" }, icon: Trophy },
    { title: "Plug into the community", body: "Wins wall, study buddies, advice, and discussions — you're not doing this alone.", cta: { to: "/community/wins", label: "Open community" }, icon: Users },
  ],
  parent: [
    { title: "Link to your student", body: "Get a 6-character code from your student. Read-only — they stay in control.", cta: { to: "/family", label: "Open family" }, icon: GraduationCap },
    { title: "Browse what's out there", body: "See the scholarship database so you can talk through options together.", cta: { to: "/scholarships", label: "Open database" }, icon: Search },
    { title: "Read parent advice", body: "Articles written for parents navigating senior year with their student.", cta: { to: "/community/advice", label: "Open advice" }, icon: Users },
  ],
};

export function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const [userType, setUserType] = useState<UserType>("student");
  const [step, setStep] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: prof } = await supabase
        .from("profiles")
        .select("user_type, onboarded_at")
        .eq("id", user.id)
        .maybeSingle();
      if (!prof) return;
      setUserId(user.id);
      setUserType((prof.user_type as UserType) || "student");
      if (!prof.onboarded_at) setOpen(true);
    })();
  }, []);

  async function finish() {
    setOpen(false);
    if (userId) {
      await supabase.from("profiles").update({ onboarded_at: new Date().toISOString() }).eq("id", userId);
    }
  }

  const steps = STEPS[userType];
  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) finish(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="mb-2 inline-flex items-center gap-2 text-xs text-gold">
            <Sparkles className="h-3.5 w-3.5" /> Welcome to The Plug
          </div>
          <DialogTitle className="font-display text-2xl">
            {userType === "student" ? "Let's get you plugged in." : "Here's how parents use The Plug."}
          </DialogTitle>
          <DialogDescription>
            Three quick stops. You can come back to any of these from your dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-gold/30 bg-gold/5 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold/15">
            <Icon className="h-5 w-5 text-gold" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold">{current.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{current.body}</p>
          <Link to={current.cta.to} onClick={finish}>
            <Button variant="outline" size="sm" className="mt-4 border-gold/40 text-gold hover:bg-gold hover:text-primary-foreground">
              {current.cta.label} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-1.5">
          {steps.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-gold" : "w-1.5 bg-border"}`} />
          ))}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button variant="ghost" onClick={finish}>Skip</Button>
          {isLast ? (
            <Button onClick={finish} className="bg-gold text-primary-foreground hover:bg-gold/90">Let's go</Button>
          ) : (
            <Button onClick={() => setStep(step + 1)} className="bg-gold text-primary-foreground hover:bg-gold/90">
              Next <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
