import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import {
  BookOpen, GraduationCap, Sparkles, Users, LogOut, ArrowRight,
  Calendar, Trophy, ClipboardList, Search, Inbox,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — The Plug" }] }),
  component: Dashboard,
});

interface Profile { full_name: string | null; email: string | null; user_type: "student" | "parent"; }

function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({ wonAmount: 0, pending: 0, colleges: 0, nextDeadline: null as string | null, nextDeadlineName: "" });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: prof }, { data: apps }, { data: colleges }, { data: upcoming }] = await Promise.all([
        supabase.from("profiles").select("full_name, email, user_type").eq("id", user.id).maybeSingle(),
        supabase.from("scholarship_applications").select("received, amount"),
        supabase.from("college_applications").select("id", { count: "exact" }),
        supabase.from("scholarships").select("name, deadline").gte("deadline", new Date().toISOString().slice(0, 10)).order("deadline").limit(1),
      ]);

      if (prof) setProfile(prof as Profile);

      const wonAmount = (apps || []).filter((a: any) => a.received).reduce((s: number, a: any) => s + (Number(a.amount) || 0), 0);
      const pending = (apps || []).filter((a: any) => !a.received).length;
      const next = upcoming?.[0];

      setStats({
        wonAmount,
        pending,
        colleges: colleges?.length || 0,
        nextDeadline: next?.deadline || null,
        nextDeadlineName: next?.name || "",
      });
    })();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  }

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-gradient-night">
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-gold shadow-gold">
              <span className="font-display text-lg font-bold text-primary-foreground">P</span>
            </div>
            <span className="font-display text-xl font-bold tracking-tight">The Plug</span>
            {profile && (
              <span className="ml-3 hidden rounded-full border border-gold/30 bg-gold/5 px-2.5 py-0.5 text-xs font-medium text-gold sm:inline">
                {profile.user_type === "student" ? "Student" : "Parent"}
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-gold">
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-10">
          <p className="text-sm text-gold">Welcome back</p>
          <h1 className="mt-1 font-display text-4xl font-bold tracking-tight md:text-5xl">Hey {firstName}.</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Pick up where you left off. Your unfair advantage is one click away.
          </p>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            icon={Trophy}
            label="Won so far"
            value={`$${stats.wonAmount.toLocaleString()}`}
            highlight
          />
          <StatCard icon={ClipboardList} label="Pending apps" value={stats.pending.toString()} />
          <StatCard icon={GraduationCap} label="Colleges" value={stats.colleges.toString()} />
          <StatCard
            icon={Calendar}
            label="Next deadline"
            value={stats.nextDeadline ? `${stats.nextDeadlineName.slice(0, 18)}${stats.nextDeadlineName.length > 18 ? "…" : ""}` : "—"}
            sub={stats.nextDeadline ? new Date(stats.nextDeadline).toLocaleDateString() : undefined}
          />
        </div>

        <h2 className="mb-4 font-display text-2xl font-bold">Your modules</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ModuleCard
            to="/scholarships"
            icon={Search}
            title="Scholarship Database"
            description="Browse real scholarships, filter by category, save the ones you want."
            tags={["Browse", "Save"]}
          />
          <ModuleCard
            to="/tracker/scholarships"
            icon={Trophy}
            title="My Application Tracker"
            description="Track colleges and scholarships you've applied to. Log what you've won."
            tags={["Colleges", "Scholarships"]}
          />
          <ModuleCard
            to="/community/wins"
            icon={Users}
            title="Community"
            description="Wins wall, study buddies, advice library, and discussion boards."
            tags={["Wins", "Buddies", "Advice", "Discussions"]}
          />
          <ModuleCard
            to="/family"
            icon={Users}
            title={profile?.user_type === "parent" ? "Your students" : "Family access"}
            description={profile?.user_type === "parent"
              ? "Link to your student's account and follow their progress."
              : "Invite a parent with a code. Read-only — you stay in control."}
            tags={profile?.user_type === "parent" ? ["Link", "Read-only"] : ["Invite", "Read-only"]}
          />
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, highlight }: { icon: React.ElementType; label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "border-gold/40 bg-gold/5" : "border-border bg-card"}`}>
      <Icon className={`h-5 w-5 ${highlight ? "text-gold" : "text-gold"}`} />
      <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-0.5 font-display text-base font-semibold ${highlight ? "text-gold" : ""}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function ModuleCard({
  to, icon: Icon, title, description, tags, disabled,
}: {
  to: string; icon: React.ElementType; title: string; description: string; tags: string[]; disabled?: boolean;
}) {
  const inner = (
    <div className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all ${disabled ? "opacity-60" : "hover:border-gold/40 hover:shadow-gold"}`}>
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/5 blur-2xl" />
      <div className="relative">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold/10">
          <Icon className="h-5 w-5 text-gold" />
        </div>
        <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span key={t} className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">{t}</span>
          ))}
        </div>
        {!disabled && (
          <div className="mt-5">
            <span className="inline-flex items-center text-sm text-gold">
              Open <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
  if (disabled) return inner;
  return <Link to={to}>{inner}</Link>;
}
