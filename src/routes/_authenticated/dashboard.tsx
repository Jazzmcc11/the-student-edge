import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { AvatarBadge } from "@/components/avatar-badge";
import { greeting, greetingEmoji, getStreak, MODULE_META } from "@/lib/personalization";
import { pickArchetype, type Archetype } from "@/lib/personality";
import {
  GraduationCap, Users, LogOut, ArrowRight,
  Calendar, Trophy, ClipboardList, Search, Inbox, Flame, Settings, Sparkles, History,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — The Plug" }] }),
  component: Dashboard,
});

interface Profile {
  full_name: string | null;
  display_name: string | null;
  email: string | null;
  user_type: "student" | "parent";
  last_visited_module: string | null;
}

function Dashboard() {
  const navigate = useNavigate();
  const { isAdmin } = useIsAdmin();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [streak, setStreak] = useState(0);
  const [archetype, setArchetype] = useState<Archetype | null>(null);
  const [stats, setStats] = useState({ wonAmount: 0, pending: 0, colleges: 0, nextDeadline: null as string | null, nextDeadlineName: "" });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: prof }, { data: apps }, { data: colleges }, { data: upcoming }, { data: pr }] = await Promise.all([
        supabase.from("profiles").select("full_name, display_name, email, user_type, last_visited_module").eq("id", user.id).maybeSingle(),
        supabase.from("scholarship_applications").select("received, amount"),
        supabase.from("college_applications").select("id", { count: "exact" }),
        supabase.from("scholarships").select("name, deadline").gte("deadline", new Date().toISOString().slice(0, 10)).order("deadline").limit(1),
        supabase.from("personality_results").select("axes").eq("user_id", user.id).order("taken_at", { ascending: false }).limit(1).maybeSingle(),
      ]);

      if (prof) setProfile(prof as Profile);
      if (pr) setArchetype(pickArchetype(pr.axes as any));

      const wonAmount = (apps || []).filter((a: any) => a.received).reduce((s: number, a: any) => s + (Number(a.amount) || 0), 0);
      const pending = (apps || []).filter((a: any) => !a.received).length;
      const next = upcoming?.[0];

      setStats({
        wonAmount, pending,
        colleges: colleges?.length || 0,
        nextDeadline: next?.deadline || null,
        nextDeadlineName: next?.name || "",
      });

      const s = await getStreak(user.id);
      setStreak(s);
    })();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  }

  const name = profile?.display_name || profile?.full_name?.split(" ")[0] || "there";
  const lastModule = profile?.last_visited_module ? MODULE_META[profile.last_visited_module] : null;

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
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link to="/admin/feedback">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-gold">
                  <Inbox className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">Feedback</span>
                </Button>
              </Link>
            )}
            <Link to="/profile">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-gold">
                <Settings className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">Profile</span>
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-gold">
              <LogOut className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Personalized greeting */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Link to="/profile"><AvatarBadge name={profile?.display_name || profile?.full_name || profile?.email} size="lg" /></Link>
            <div>
              <p className="text-sm text-gold">{greeting()}, {name} {greetingEmoji()}</p>
              <h1 className="mt-1 font-display text-4xl font-bold tracking-tight md:text-5xl">Let's get it.</h1>
              <p className="mt-2 max-w-xl text-muted-foreground">
                Your unfair advantage is one click away.
              </p>
            </div>
          </div>
          {streak > 0 && (
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-gold/40 bg-gold/5 px-4 py-2">
              <Flame className="h-4 w-4 text-gold" />
              <span className="text-sm"><span className="font-bold text-gold">{streak}-day</span> streak</span>
            </div>
          )}
        </div>

        {/* Pick up where you left off */}
        {lastModule && (
          <Link to={lastModule.to} className="mb-6 block">
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition hover:border-gold/40">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/10">
                  <History className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Pick up where you left off</p>
                  <p className="font-medium">{lastModule.label}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gold" />
            </div>
          </Link>
        )}

        {/* Personality CTA */}
        <Link to="/personality" className="mb-10 block">
          <div className="flex items-center justify-between rounded-xl border border-gold/40 bg-gradient-to-r from-gold/10 to-transparent p-4 transition hover:shadow-gold">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/20">
                <Sparkles className="h-4 w-4 text-gold" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gold">
                  {archetype ? "Your archetype" : "New — Plug personality test"}
                </p>
                <p className="font-display text-lg font-semibold">
                  {archetype ? `${archetype.emoji} ${archetype.name}` : "Take 12 questions, get a study plan."}
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-gold" />
          </div>
        </Link>

        <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard icon={Trophy} label="Won so far" value={`$${stats.wonAmount.toLocaleString()}`} highlight />
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
          <ModuleCard to="/scholarships" icon={Search} title="Scholarship Database"
            description="Browse real scholarships, filter by category, save the ones you want."
            tags={["Browse", "Save"]} />
          <ModuleCard to="/tracker/scholarships" icon={Trophy} title="My Application Tracker"
            description="Track colleges and scholarships you've applied to. Log what you've won."
            tags={["Colleges", "Scholarships"]} />
          <ModuleCard to="/community/wins" icon={Users} title="Community"
            description="Wins wall, study buddies, advice library, and discussion boards."
            tags={["Wins", "Buddies", "Advice", "Discussions"]} />
          <ModuleCard to="/family" icon={Users}
            title={profile?.user_type === "parent" ? "Your students" : "Family access"}
            description={profile?.user_type === "parent"
              ? "Link to your student's account and follow their progress."
              : "Invite a parent with a code. Read-only — you stay in control."}
            tags={profile?.user_type === "parent" ? ["Link", "Read-only"] : ["Invite", "Read-only"]} />
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, highlight }: { icon: React.ElementType; label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "border-gold/40 bg-gold/5" : "border-border bg-card"}`}>
      <Icon className="h-5 w-5 text-gold" />
      <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-0.5 font-display text-base font-semibold ${highlight ? "text-gold" : ""}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function ModuleCard({ to, icon: Icon, title, description, tags }: { to: string; icon: React.ElementType; title: string; description: string; tags: string[] }) {
  return (
    <Link to={to}>
      <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-gold/40 hover:shadow-gold">
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
          <div className="mt-5">
            <span className="inline-flex items-center text-sm text-gold">
              Open <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
