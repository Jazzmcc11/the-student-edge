import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { AvatarBadge } from "@/components/avatar-badge";
import { NudgesPanel } from "@/components/nudges-panel";
import { StudentAlerts } from "@/components/student-alerts";
import { seedStudentSample } from "@/lib/seed-data";
import { greeting, greetingEmoji, getStreak, MODULE_META } from "@/lib/personalization";
import { pickArchetype, type Archetype } from "@/lib/personality";
import {
  GraduationCap, Users, LogOut, ArrowRight,
  Calendar, Trophy, ClipboardList, Search, Inbox, Flame, Settings, Sparkles, History,
  Heart, MessageSquare, BookOpen, Feather, HandHeart, PiggyBank, Zap, Wand2,
} from "lucide-react";
import { RemindersBell } from "@/components/reminders-bell";
import { GradeLevelPanel } from "@/components/grade-level-panel";
import { WritingPromptCard } from "@/components/writing-prompt-card";
import { getGradePlan } from "@/lib/grade-plan";
import { useGradeLevel } from "@/hooks/use-grade-level";

import { toast } from "sonner";


export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — The Plug" }] }),
  component: Dashboard,
});

interface Profile {
  id: string;
  full_name: string | null;
  display_name: string | null;
  email: string | null;
  user_type: "student" | "parent";
  last_visited_module: string | null;
  grade_level: number | string | null;
  gpa: number | null;
  onboarding_checklist: Record<string, boolean> | null;
}


function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useIsAdmin();
  const [profile, setProfile] = useState<Profile | null>(null);



  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: prof, error } = await supabase
        .from("profiles")
        .select("id, full_name, display_name, email, user_type, last_visited_module, grade_level, gpa, onboarding_checklist")
        .eq("id", user.id)
        .maybeSingle();
      if (error) console.error("profile fetch error", error);
      if (prof) {
        setProfile(prof as Profile);
      } else {
        // Fallback to auth metadata so the dashboard never hangs on "Loading…"
        const meta = (user.user_metadata || {}) as Record<string, string>;
        setProfile({
          id: user.id,
          full_name: meta.full_name || null,
          display_name: null,
          email: user.email ?? null,
          user_type: (meta.user_type as "student" | "parent") || "student",
          last_visited_module: null,
          grade_level: null,
          gpa: null,
          onboarding_checklist: {},
        });
      }
    })();
  }, []);


  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

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
            <RemindersBell />
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
        {!profile ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : profile.user_type === "parent" ? (
          <ParentDashboard profile={profile} />
        ) : (
          <StudentDashboard profile={profile} />
        )}
      </main>
    </div>
  );
}

/* ============================================================
   STUDENT DASHBOARD
   ============================================================ */
function StudentDashboard({ profile }: { profile: Profile }) {
  const { grade: currentGrade } = useGradeLevel();
  const [streak, setStreak] = useState(0);
  const [archetype, setArchetype] = useState<Archetype | null>(null);
  const [stats, setStats] = useState({ wonAmount: 0, pending: 0, colleges: 0, nextDeadline: null as string | null, nextDeadlineName: "" });
  const [focus, setFocus] = useState<{ label: string; sub: string; href: string; icon: any } | null>(null);


  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [{ data: apps }, { data: colleges }, { data: upcoming }, { data: pr }, { data: essays }, { data: recReqs }, { data: myColleges }] = await Promise.all([
        supabase.from("scholarship_applications").select("received, amount"),
        supabase.from("college_applications").select("id", { count: "exact" }),
        supabase.from("scholarships").select("name, deadline").gte("deadline", today).order("deadline").limit(1),
        supabase.from("personality_results").select("axes").eq("user_id", profile.id).order("taken_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("essays").select("id, title, status, draft_content, word_limit, updated_at").order("updated_at", { ascending: false }).limit(1),
        supabase.from("recommendation_requests").select("id, status, deadline").in("status", ["not_asked", "asked"]).order("deadline", { ascending: true, nullsFirst: false }).limit(1),
        supabase.from("college_applications").select("college_name, deadline_date").not("deadline_date", "is", null).gte("deadline_date", today).order("deadline_date").limit(1),
      ]);
      if (pr) setArchetype(pickArchetype(pr.axes as any));
      const wonAmount = (apps || []).filter((a: any) => a.received).reduce((s: number, a: any) => s + (Number(a.amount) || 0), 0);
      const pending = (apps || []).filter((a: any) => !a.received).length;
      const next = upcoming?.[0];
      const nextCollege = (myColleges as any)?.[0];
      setStats({
        wonAmount, pending,
        colleges: colleges?.length || 0,
        nextDeadline: next?.deadline || null,
        nextDeadlineName: next?.name || "",
      });
      setStreak(await getStreak(profile.id));

      // pick the ONE most urgent thing
      const candidates: Array<{ when: number; label: string; sub: string; href: string; icon: any }> = [];
      if (nextCollege) {
        const d = new Date(nextCollege.deadline_date);
        const days = Math.ceil((d.getTime() - Date.now()) / 86400000);
        candidates.push({ when: d.getTime(), label: `${nextCollege.college_name} deadline`, sub: `In ${days} day${days === 1 ? "" : "s"} — is your app ready?`, href: "/tracker/colleges", icon: GraduationCap });
      }
      if (recReqs?.[0]?.deadline) {
        const d = new Date(recReqs[0].deadline);
        const days = Math.ceil((d.getTime() - Date.now()) / 86400000);
        candidates.push({ when: d.getTime(), label: `Rec letter needed`, sub: `Due in ${days} day${days === 1 ? "" : "s"} — nudge your teacher`, href: "/recommendations", icon: HandHeart });
      }
      if (essays?.[0]) {
        const e: any = essays[0];
        if (e.status !== "final") {
          candidates.push({ when: Date.now() + 1, label: `Finish "${e.title}"`, sub: `${e.status} · pick it back up`, href: "/essays", icon: Feather });
        }
      }
      candidates.sort((a, b) => a.when - b.when);
      setFocus(candidates[0] || null);
    })();
  }, [profile.id]);

  const name = profile.display_name || profile.full_name?.split(" ")[0] || "there";
  const lastModule = profile.last_visited_module ? MODULE_META[profile.last_visited_module] : null;

  return (
    <>
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/profile"><AvatarBadge name={profile.display_name || profile.full_name || profile.email} size="lg" /></Link>
          <div>
            <p className="text-sm text-gold">{greeting()}, {name} {greetingEmoji()}</p>
            <h1 className="mt-1 font-display text-4xl font-bold tracking-tight md:text-5xl">Let's get it.</h1>
            <p className="mt-2 max-w-xl text-muted-foreground">Your unfair advantage is one click away.</p>
          </div>
        </div>
        {streak > 0 && (
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-gold/40 bg-gold/5 px-4 py-2">
            <Flame className="h-4 w-4 text-gold" />
            <span className="text-sm"><span className="font-bold text-gold">{streak}-day</span> streak</span>
          </div>
        )}
      </div>

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

      <StudentAlerts studentId={profile.id} />

      <GradeLevelPanel
        userId={profile.id}
        gradeLevel={profile.grade_level}
        gpa={profile.gpa}
        checklist={profile.onboarding_checklist || {}}
      />

      {profile.user_type !== "parent" && (
        <WritingPromptCard userId={profile.id} grade={currentGrade} />
      )}


      {stats.wonAmount === 0 && stats.pending === 0 && stats.colleges === 0 && (
        <EmptyStudentCTA userId={profile.id} />
      )}

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

      {focus && (
        <Link to={focus.href} className="mb-8 block">
          <div className="group relative overflow-hidden rounded-2xl border border-gold/50 bg-gradient-to-br from-gold/15 via-gold/5 to-transparent p-6 transition hover:shadow-gold">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gold/10 blur-3xl" />
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/20">
                  <Zap className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gold">Focus for today</p>
                  <h3 className="mt-1 font-display text-2xl font-bold">{focus.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{focus.sub}</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gold transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Link>
      )}

      <StudentModules gradeLevel={profile.grade_level} />
    </>
  );
}

const ALL_MODULES = [
  { key: "essays", to: "/essays", icon: Feather, title: "Essay Workshop",
    description: "Draft your personal statement and supplements with an AI coach that never writes for you.",
    tags: ["Common App", "Coach", "Focus mode"] },
  { key: "tutor", to: "/tutor", icon: Sparkles, title: "AI Tutor",
    description: "Ask anything — homework, essay feedback, study plans. 24/7.",
    tags: ["Homework", "Essays"] },
  { key: "tracker-colleges", to: "/tracker/colleges", icon: GraduationCap, title: "College Tracker",
    description: "Common App checklist, deadlines, supplements — all in one place.",
    tags: ["Common App", "Deadlines"] },
  { key: "recommendations", to: "/recommendations", icon: HandHeart, title: "Rec Letters",
    description: "Track who you asked, who confirmed, and who deserves a thank-you note.",
    tags: ["Teachers", "Status", "Reminders"] },
  { key: "finaid", to: "/finaid", icon: PiggyBank, title: "Financial Aid",
    description: "FAFSA + CSS checklist and side-by-side offer comparison. See what's actually a scholarship.",
    tags: ["FAFSA", "CSS", "Compare offers"] },
  { key: "scholarships", to: "/scholarships", icon: Search, title: "Scholarship Database",
    description: "Browse real scholarships, filter by category, save the ones you want.",
    tags: ["Browse", "Save"] },
  { key: "colleges", to: "/colleges", icon: GraduationCap, title: "Explore Colleges",
    description: "Search real US colleges — admit rate, cost, HBCU filter.",
    tags: ["Scorecard", "HBCU"] },
  { key: "calendar", to: "/calendar", icon: Calendar, title: "Deadline Calendar",
    description: "FAFSA, college, test, and state aid deadlines — filtered to your state.",
    tags: ["FAFSA", "SAT/ACT"] },
  { key: "creative", to: "/creative", icon: Sparkles, title: "Creative Resources",
    description: "Grad templates, senior year guide, HOCO + event inspo — curated boards.",
    tags: ["Pinterest", "Grad"] },
  { key: "community", to: "/community/wins", icon: Users, title: "Community",
    description: "Wins wall, study buddies, advice library, and discussion boards.",
    tags: ["Wins", "Buddies", "Advice"] },
  { key: "personality", to: "/personality", icon: Sparkles, title: "Personality Test",
    description: "12 questions, an archetype, and a study plan built around how you actually work.",
    tags: ["Archetype", "Study plan"] },
  { key: "family", to: "/family", icon: Heart, title: "Family access",
    description: "Invite a parent with a code. Read-only — you stay in control.",
    tags: ["Invite", "Read-only"] },
] as const;

function StudentModules({ gradeLevel }: { gradeLevel: number | string | null }) {
  const plan = getGradePlan(gradeLevel);
  const hidden = new Set(plan?.hiddenModules || []);
  const priority = plan?.priorityModules || [];

  const visible = ALL_MODULES.filter(m => !hidden.has(m.key));
  const sorted = [...visible].sort((a, b) => {
    const ai = priority.indexOf(a.key);
    const bi = priority.indexOf(b.key);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return (
    <>
      <h2 className="mb-4 font-display text-2xl font-bold">
        {plan ? `Recommended for ${plan.label.toLowerCase()} year` : "Your modules"}
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {sorted.map(m => (
          <ModuleCard key={m.key} to={m.to} icon={m.icon} title={m.title}
            description={m.description} tags={[...m.tags]} />
        ))}
      </div>
    </>
  );
}


/* ============================================================
   PARENT DASHBOARD
   ============================================================ */
type LinkedStudent = {
  student_id: string;
  full_name: string | null;
  display_name: string | null;
  email: string | null;
  school: string | null;
  grade_level: string | null;
  // snapshot
  wonAmount: number;
  pending: number;
  colleges: number;
  latestWin: { scholarship_name: string; amount: number | null; created_at: string } | null;
  nextDeadline: { name: string; deadline: string | null } | null;
  unreadNudges: number;
};

function ParentDashboard({ profile }: { profile: Profile }) {
  const [students, setStudents] = useState<LinkedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: links } = await supabase
        .from("parent_student_links")
        .select("student_id")
        .eq("parent_id", profile.id);

      const ids = (links || []).map((l: any) => l.student_id);
      if (ids.length === 0) {
        setLoading(false);
        return;
      }

      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, display_name, email, school, grade_level")
        .in("id", ids);

      const results: LinkedStudent[] = await Promise.all(
        (profs || []).map(async (p: any) => {
          const [{ data: apps }, { data: colleges }, { data: wins }, { data: upcoming }, { data: unread }] = await Promise.all([
            supabase.from("scholarship_applications").select("received, amount").eq("user_id", p.id),
            supabase.from("college_applications").select("id", { count: "exact", head: true }).eq("user_id", p.id),
            supabase.from("wins").select("scholarship_name, amount, created_at").eq("user_id", p.id).order("created_at", { ascending: false }).limit(1),
            supabase.from("scholarships").select("name, deadline").gte("deadline", new Date().toISOString().slice(0, 10)).order("deadline").limit(1),
            supabase.from("nudges").select("id", { count: "exact", head: true }).eq("parent_id", profile.id).eq("student_id", p.id).is("read_at", null),
          ]);
          const wonAmount = (apps || []).filter((a: any) => a.received).reduce((s: number, a: any) => s + (Number(a.amount) || 0), 0);
          const pending = (apps || []).filter((a: any) => !a.received).length;
          return {
            student_id: p.id,
            full_name: p.full_name,
            display_name: p.display_name,
            email: p.email,
            school: p.school,
            grade_level: p.grade_level,
            wonAmount,
            pending,
            colleges: (colleges as any)?.length || (colleges as any)?.count || 0,
            latestWin: wins?.[0] || null,
            nextDeadline: upcoming?.[0] || null,
            unreadNudges: (unread as any)?.length ?? 0,
          };
        }),
      );

      setStudents(results);
      setActiveId(results[0]?.student_id || null);
      setLoading(false);
    })();
  }, [profile.id]);

  const name = profile.display_name || profile.full_name?.split(" ")[0] || "there";
  const active = students.find((s) => s.student_id === activeId);

  return (
    <>
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/profile"><AvatarBadge name={profile.display_name || profile.full_name || profile.email} size="lg" /></Link>
          <div>
            <p className="text-sm text-gold">{greeting()}, {name} {greetingEmoji()}</p>
            <h1 className="mt-1 font-display text-4xl font-bold tracking-tight md:text-5xl">The Parent Plug.</h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Stay in the loop without hovering. Your students' progress, your way.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : students.length === 0 ? (
        <EmptyParent />
      ) : (
        <>
          {/* Student switcher */}
          {students.length > 1 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {students.map((s) => {
                const label = s.display_name || s.full_name || s.email || "Student";
                const isActive = s.student_id === activeId;
                return (
                  <button
                    key={s.student_id}
                    onClick={() => setActiveId(s.student_id)}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      isActive
                        ? "border border-gold/40 bg-gold/15 text-gold"
                        : "border border-border bg-card text-muted-foreground hover:text-gold"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {active && <StudentSnapshot student={active} parentId={profile.id} />}

          <h2 className="mb-4 mt-10 font-display text-2xl font-bold">Your parent toolkit</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ModuleCard to="/parent/essays" icon={Feather} title="Read their essays"
              description="See what they're writing, leave kind, focused comments — never rewrite it for them."
              tags={["View", "Comment"]} />
            <ModuleCard to="/parent/scholarships" icon={Search} title="What they're chasing"
              description="Every scholarship your student saved or applied to. Cheer them on as they land wins."
              tags={["Track", "Celebrate"]} />
            <ModuleCard to="/community/wins" icon={Trophy} title="Wall of wins"
              description="Every win your student and the community post. Send them love in one tap."
              tags={["Celebrate", "Nudge"]} />
            <ModuleCard to="/scholarships" icon={Sparkles} title="Browse scholarships"
              description="See what's out there — send the ones you find their way as encouragement."
              tags={["Discover", "Share"]} />
            <ModuleCard to="/parent/finaid" icon={PiggyBank} title="Financial aid together"
              description="Track FAFSA/CSS progress and compare aid offers side-by-side. This is your part."
              tags={["FAFSA", "Aid offers"]} />
            <ModuleCard to="/parent/resources" icon={BookOpen} title="Parent resource library"
              description="Grad party tips, aid guides, senior year survival — save what helps, skip the rest."
              tags={["Read", "Save"]} />
            <ModuleCard to="/parent/tasks" icon={ClipboardList} title="Your to-do list"
              description="The stuff only you can do — FAFSA, party planning, appointments. Out of your head."
              tags={["Personal", "Private"]} />
            <ModuleCard to="/family" icon={Users} title="Manage linked students"
              description="Add another student, or remove a link."
              tags={["Link", "Read-only"]} />
            <ModuleCard to="/community/discussions" icon={MessageSquare} title="Parent Lounge"
              description="Real talk with parents who are figuring it out alongside you."
              tags={["Community"]} />
          </div>
        </>
      )}
    </>
  );
}

function StudentSnapshot({ student, parentId }: { student: LinkedStudent; parentId: string }) {
  const name = student.display_name || student.full_name?.split(" ")[0] || "Your student";
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/5 to-transparent p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-gold">Snapshot</p>
            <h2 className="mt-1 font-display text-3xl font-bold">{name}</h2>
            {(student.school || student.grade_level) && (
              <p className="mt-1 text-sm text-muted-foreground">
                {[student.grade_level, student.school].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
          {student.unreadNudges > 0 && (
            <span className="rounded-full bg-gold/15 px-3 py-1 text-xs text-gold">
              {student.unreadNudges} unread nudge{student.unreadNudges === 1 ? "" : "s"}
            </span>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard icon={Trophy} label="Won" value={`$${student.wonAmount.toLocaleString()}`} highlight />
          <StatCard icon={ClipboardList} label="Pending apps" value={student.pending.toString()} />
          <StatCard icon={GraduationCap} label="Colleges" value={student.colleges.toString()} />
          <StatCard
            icon={Calendar}
            label="Next deadline"
            value={student.nextDeadline ? `${student.nextDeadline.name.slice(0, 18)}${student.nextDeadline.name.length > 18 ? "…" : ""}` : "—"}
            sub={student.nextDeadline?.deadline ? new Date(student.nextDeadline.deadline).toLocaleDateString() : undefined}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-gold" />
            <h3 className="font-display text-lg font-semibold">Latest win</h3>
          </div>
          {student.latestWin ? (
            <>
              <p className="text-base">
                {student.latestWin.scholarship_name}
                {student.latestWin.amount ? <span className="ml-2 text-gold">${Number(student.latestWin.amount).toLocaleString()}</span> : null}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(student.latestWin.created_at).toLocaleDateString()}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No wins posted yet — send a nudge to cheer them on.</p>
          )}
          <Link to="/community/wins" className="mt-4 inline-flex items-center text-sm text-gold">
            See all wins <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </div>

        <NudgesPanel
          viewerRole="parent"
          viewerId={parentId}
          parentId={parentId}
          studentId={student.student_id}
          studentName={name}
        />
      </div>
    </div>
  );
}

function EmptyParent() {
  return (
    <div className="rounded-2xl border border-dashed border-gold/30 bg-card p-10 text-center">
      <Heart className="mx-auto h-8 w-8 text-gold" />
      <h2 className="mt-4 font-display text-2xl font-bold">No students linked yet</h2>
      <p className="mx-auto mt-2 max-w-md text-muted-foreground">
        Ask your student to generate a 6-character code in their Family settings, then redeem it here to see their progress.
      </p>
      <Link to="/family">
        <Button className="mt-6 bg-gold text-primary-foreground hover:bg-gold/90">
          Link a student <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}

/* ============================================================
   SHARED
   ============================================================ */
function EmptyStudentCTA({ userId }: { userId: string }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  if (done) return null;
  async function loadSample() {
    setBusy(true);
    try {
      const res = await seedStudentSample(userId);
      if (res.skipped) toast("You already have data — skipping sample.");
      else toast.success("Sample data loaded — poke around!");
      setDone(true);
      setTimeout(() => window.location.reload(), 400);
    } catch (e: any) {
      toast.error(e.message || "Couldn't load samples");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-dashed border-gold/30 bg-card p-6 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs uppercase tracking-wider text-gold">New account?</p>
        <h3 className="mt-1 font-display text-lg font-semibold">Your dashboard's empty — for now.</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your first scholarship or college, or load a sample set to see how everything works.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={loadSample} disabled={busy} variant="outline" className="border-gold/40 text-gold hover:bg-gold hover:text-primary-foreground">
          <Wand2 className="mr-1.5 h-4 w-4" /> {busy ? "Loading…" : "Load sample data"}
        </Button>
        <Link to="/tracker/scholarships">
          <Button className="bg-gold text-primary-foreground hover:bg-gold/90">
            Add your first <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </Link>
      </div>
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
