import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  Users,
  LogOut,
  ArrowRight,
  Calendar,
  Trophy,
  MessageSquare,
  Bot,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — The Plug" }],
  }),
  component: Dashboard,
});

interface Profile {
  full_name: string | null;
  email: string | null;
  user_type: "student" | "parent";
}

function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, email, user_type")
        .eq("id", user.id)
        .maybeSingle();
      if (data) setProfile(data as Profile);
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
      {/* Top bar */}
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
        {/* Greeting */}
        <div className="mb-10">
          <p className="text-sm text-gold">Welcome back</p>
          <h1 className="mt-1 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Hey {firstName}.
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Pick up where you left off. Your unfair advantage is one click away.
          </p>
        </div>

        {/* Quick stats / actions */}
        <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard icon={Calendar} label="Next deadline" value="FAFSA · Oct 1" />
          <StatCard icon={Trophy} label="Scholarships" value="12 matches" />
          <StatCard icon={MessageSquare} label="Community" value="3 new" />
          <StatCard icon={Bot} label="AI tutor" value="Ready" />
        </div>

        {/* Modules */}
        <h2 className="mb-4 font-display text-2xl font-bold">Your modules</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ModuleCard
            icon={BookOpen}
            title="Academic Support"
            description="Resource library and 24/7 AI tutoring powered by Claude."
            tags={["Library", "AI tutor"]}
          />
          <ModuleCard
            icon={GraduationCap}
            title="College & Career Readiness"
            description="Track applications, find scholarships, never miss FAFSA."
            tags={["Tracker", "Scholarships", "FAFSA"]}
          />
          <ModuleCard
            icon={Sparkles}
            title="Creative Resources"
            description="Grad announcement templates, senior year guide, HOCO ideas."
            tags={["Templates", "Senior", "Events"]}
          />
          <ModuleCard
            icon={Users}
            title="Community"
            description="Discussion spaces organized by topic. Find your people."
            tags={["Forums", "Topics"]}
          />
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <Icon className="h-5 w-5 text-gold" />
      <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-display text-base font-semibold">{value}</p>
    </div>
  );
}

function ModuleCard({
  icon: Icon,
  title,
  description,
  tags,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  tags: string[];
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-gold/40 hover:shadow-gold">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/5 blur-2xl transition-opacity group-hover:opacity-100" />
      <div className="relative">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold/10">
          <Icon className="h-5 w-5 text-gold" />
        </div>
        <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span key={t} className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
        <div className="mt-5">
          <Button variant="ghost" size="sm" className="px-0 text-gold hover:bg-transparent hover:text-gold">
            Open <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
