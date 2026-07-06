import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  GraduationCap,
  Users,
  ArrowLeft,
  BookOpen,
  Sparkles,
  Trophy,
  Calendar,
  MessageCircle,
  Bell,
  ShieldCheck,
  LineChart,
  FileText,
  ClipboardList,
  Search,
  PenTool,
  PartyPopper,
  Megaphone,
  Clock,
  Target,
  Wallet,
  Mail,
  BadgeCheck,
  Lightbulb,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function safeNext(next: string | undefined): string {
  if (!next || typeof next !== "string") return "/dashboard";
  if (!next.startsWith("/") || next.startsWith("//")) return "/dashboard";
  return next;
}

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — The Plug" },
      { name: "description", content: "Sign in or create your student or parent account on The Plug." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" ? s.next : undefined,
  }),
  component: AuthPage,
});

type Role = "student" | "parent";

const PREVIEW = {
  student: {
    label: "Student dashboard",
    tagline: "Crush high school. On your terms.",
    accent: "from-amber-300 to-yellow-500",
    highlights: [
      {
        icon: BookOpen,
        title: "Academic Support",
        body: "AI tutor, resource library, and study guides.",
        shortcuts: [
          { icon: Lightbulb, label: "Ask Claude" },
          { icon: FileText, label: "Study guides" },
          { icon: Clock, label: "SAT prep" },
        ],
      },
      {
        icon: Trophy,
        title: "College & Career",
        body: "Apps, scholarships, and FAFSA deadlines tracked.",
        shortcuts: [
          { icon: ClipboardList, label: "App tracker" },
          { icon: Search, label: "Scholarships" },
          { icon: Calendar, label: "FAFSA calendar" },
        ],
      },
      {
        icon: Sparkles,
        title: "Creative Resources",
        body: "Grad templates, senior year guide, and event ideas.",
        shortcuts: [
          { icon: PenTool, label: "Grad designs" },
          { icon: PartyPopper, label: "HOCO planner" },
          { icon: Megaphone, label: "Senior guide" },
        ],
      },
      {
        icon: MessageCircle,
        title: "Community",
        body: "Join spaces by topic — AP, sports, college life.",
        shortcuts: [
          { icon: Target, label: "AP study group" },
          { icon: Trophy, label: "Athletes" },
          { icon: Megaphone, label: "College talk" },
        ],
      },
    ],
    stats: [
      { k: "12", v: "Tasks this week" },
      { k: "$4.2k", v: "Scholarships saved" },
      { k: "3", v: "Apps in progress" },
    ],
  },
  parent: {
    label: "Parent dashboard",
    tagline: "Be in the loop. Without hovering.",
    accent: "from-yellow-500 to-amber-700",
    highlights: [
      {
        icon: Bell,
        title: "Deadline & Alerts",
        body: "FAFSA, applications, and scholarship deadlines.",
        shortcuts: [
          { icon: Calendar, label: "Family calendar" },
          { icon: Mail, label: "Alert prefs" },
          { icon: BadgeCheck, label: "Verified dates" },
        ],
      },
      {
        icon: LineChart,
        title: "Progress View",
        body: "See where your student stands at a glance.",
        shortcuts: [
          { icon: ClipboardList, label: "App status" },
          { icon: Target, label: "Milestones" },
          { icon: Trophy, label: "Awards tracker" },
        ],
      },
      {
        icon: ShieldCheck,
        title: "Verified Resources",
        body: "Curated guides and tools, no rabbit holes.",
        shortcuts: [
          { icon: FileText, label: "Parent guides" },
          { icon: Wallet, label: "FAFSA walkthrough" },
          { icon: Search, label: "Trusted tools" },
        ],
      },
      {
        icon: Users,
        title: "Parent Community",
        body: "Connect with other parents navigating high school.",
        shortcuts: [
          { icon: MessageCircle, label: "Parent chat" },
          { icon: Megaphone, label: "Q&A forum" },
          { icon: Calendar, label: "Event meetups" },
        ],
      },
    ],
    stats: [
      { k: "5", v: "Upcoming deadlines" },
      { k: "92%", v: "On-track score" },
      { k: "2", v: "Action items" },
    ],
  },
} as const;

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const target = safeNext(next);
  const [role, setRole] = useState<Role>("student");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        if (target.startsWith("/") && !target.startsWith("//") && target !== "/dashboard") {
          window.location.href = target;
        } else {
          navigate({ to: "/dashboard" });
        }
      }
    });
  }, [navigate, target]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${target}`,
            data: { full_name: fullName, user_type: role },
          },
        });
        if (error) throw error;
        toast.success("Account created. Welcome to The Plug.");
        window.location.href = target;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in.");
        window.location.href = target;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const preview = PREVIEW[role];

  return (
    <div className="min-h-screen bg-gradient-night px-4 py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-start">
        {/* LEFT: Auth card */}
        <div>
          <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>

          <div className="rounded-2xl border border-border bg-card p-8 shadow-gold">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-gold shadow-gold">
                <span className="font-display text-lg font-bold text-primary-foreground">P</span>
              </div>
              <div>
                <h1 className="font-display text-xl font-bold leading-tight">The Plug</h1>
                <p className="text-xs text-muted-foreground">Your unfair advantage</p>
              </div>
            </div>

            {/* Role toggle */}
            <div className="mb-6">
              <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                I am a
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-medium transition-all ${
                    role === "student"
                      ? "border-gold bg-gold/10 text-gold shadow-gold"
                      : "border-border bg-secondary text-muted-foreground hover:border-gold/40"
                  }`}
                >
                  <GraduationCap className="h-4 w-4" /> I'm a Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole("parent")}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-medium transition-all ${
                    role === "parent"
                      ? "border-gold bg-gold/10 text-gold shadow-gold"
                      : "border-border bg-secondary text-muted-foreground hover:border-gold/40"
                  }`}
                >
                  <Users className="h-4 w-4" /> I'm a Parent
                </button>
              </div>
            </div>

            <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "signup")}>
              <TabsList className="grid w-full grid-cols-2 bg-secondary">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <TabsContent value="signup" className="m-0 space-y-4">
                  <div>
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alex Johnson"
                      required={mode === "signup"}
                    />
                  </div>
                </TabsContent>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@school.edu"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
                >
                  {loading ? "Please wait…" : mode === "signup" ? `Create ${role} account` : "Sign in"}
                </Button>
              </form>
            </Tabs>
          </div>
        </div>

        {/* RIGHT: Live preview */}
        <div className="hidden lg:block">
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="relative overflow-hidden rounded-2xl border border-gold/30 bg-card p-6 shadow-gold"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${preview.accent}`} />

              {/* Mock window chrome */}
              <div className="mb-4 flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
                <span className="ml-3 text-xs text-muted-foreground">
                  theplug.app / {role}
                </span>
              </div>

              <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-gold">
                {role === "student" ? <GraduationCap className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
                {preview.label}
              </div>
              <h2 className="font-display text-2xl font-bold">{preview.tagline}</h2>

              {/* Stats row */}
              <div className="mt-5 grid grid-cols-3 gap-3">
                {preview.stats.map((s) => (
                  <div
                    key={s.v}
                    className="rounded-lg border border-border bg-background/40 p-3 text-center"
                  >
                    <div className="font-display text-xl font-bold text-gold">{s.k}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{s.v}</div>
                  </div>
                ))}
              </div>

              {/* Highlight tiles */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                {preview.highlights.map(({ icon: Icon, title, body, shortcuts }, i) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + i * 0.06 }}
                    className="group rounded-xl border border-border bg-background/40 p-3 transition-colors hover:border-gold/50"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gold/10 text-gold">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="text-sm font-semibold">{title}</div>
                    </div>
                    <p className="mt-1.5 text-[11px] text-muted-foreground leading-relaxed">{body}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {shortcuts.map(({ icon: SIcon, label }) => (
                        <span
                          key={label}
                          className="inline-flex items-center gap-1 rounded-md bg-gold/10 px-1.5 py-0.5 text-[10px] font-medium text-gold"
                        >
                          <SIcon className="h-2.5 w-2.5" />
                          {label}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              <p className="mt-5 text-center text-xs text-muted-foreground">
                Toggle <span className="text-gold">Student</span> /{" "}
                <span className="text-gold">Parent</span> to preview your dashboard.
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
