import { Link } from "@tanstack/react-router";
import { Flame, Trophy, Target, MessageSquare, Calendar, BookOpen, Sparkles, Coffee } from "lucide-react";

// A curated community landing panel for 11th graders (Juniors).
// Focus: making the hardest year fun — test prep, essays, college list,
// while keeping motivation and sanity intact.

const JUNIOR_QUESTS = [
  {
    icon: Target,
    title: "The SAT/ACT boss fight",
    xp: "1000 XP",
    body: "Pick your test, take one full-length practice, then attack weak sections 20 min/day.",
    href: "/tutor",
  },
  {
    icon: BookOpen,
    title: "Draft the Common App essay",
    xp: "750 XP",
    body: "Brainstorm 5 moments that shaped you. Pick one. Write the ugly first draft.",
    href: "/essays",
  },
  {
    icon: Trophy,
    title: "Build your college list",
    xp: "500 XP",
    body: "6 targets, 4 reaches, 3 likelies. Save them to your tracker so you can compare.",
    href: "/tracker/colleges",
  },
  {
    icon: Sparkles,
    title: "Lock in 2 rec letters",
    xp: "400 XP",
    body: "Ask junior-year teachers who saw you grow. Ask in person, follow up by email.",
    href: "/recommendations",
  },
];

const SANITY_RULES = [
  { emoji: "🧠", title: "One hard thing per day", body: "One SAT section OR one essay paragraph. Not both. Not five. One." },
  { emoji: "😴", title: "Sleep is a study tool", body: "Under 7 hours = your memory doesn't file the day. Non-negotiable." },
  { emoji: "📵", title: "Airplane mode = superpower", body: "Phone in another room during study blocks. 45 min > 3 distracted hours." },
  { emoji: "🎉", title: "Celebrate small wins", body: "Finished a practice test? Post it in Wins. This year is long — fuel matters." },
];

const MONTHLY_VIBE = [
  { month: "Fall", vibe: "Lock in test date + first essay draft", color: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  { month: "Winter", vibe: "SAT/ACT round 1 + finalize list", color: "bg-sky-500/15 text-sky-400 border-sky-500/30" },
  { month: "Spring", vibe: "Retake if needed + start supplements", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  { month: "Summer", vibe: "Visit colleges + finish Common App", color: "bg-gold/15 text-gold border-gold/40" },
];

const CONVO_PROMPTS = [
  { slug: "junior-year", label: "What SAT prep is actually working for you?" },
  { slug: "junior-year", label: "Rec letter ask: what did you say?" },
  { slug: "junior-year", label: "How are you keeping sane this year?" },
];

export function JuniorCommunityHub() {
  return (
    <section className="mb-8 space-y-6">
      <div className="rounded-2xl border border-gold/40 bg-gradient-to-br from-gold/15 via-gold/5 to-transparent p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-gold/20 p-2">
            <Flame className="h-5 w-5 text-gold" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-gold">Junior hub · THE year</p>
            <h2 className="mt-1 font-display text-2xl font-bold">Level up. Have fun doing it.</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Junior year is the hardest — and the most exciting. You're not grinding alone. Beat the quests, share
              the wins, and remember: colleges want humans, not zombies.
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="font-display text-lg font-semibold">This year's quests</h3>
          <p className="text-xs text-muted-foreground">Complete them in any order · bragging rights included</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {JUNIOR_QUESTS.map((q) => (
            <Link
              key={q.title}
              to={q.href}
              className="group rounded-xl border border-border bg-card p-4 transition hover:border-gold/40"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <q.icon className="h-4 w-4 text-gold" />
                  <p className="font-display font-semibold">{q.title}</p>
                </div>
                <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
                  {q.xp}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{q.body}</p>
              <p className="mt-2 text-xs text-gold opacity-0 transition group-hover:opacity-100">Start quest →</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gold" />
          <h3 className="font-display text-lg font-semibold">The junior year timeline</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {MONTHLY_VIBE.map((m) => (
            <div key={m.month} className={`rounded-xl border p-3 ${m.color}`}>
              <p className="font-display text-sm font-bold uppercase tracking-wider">{m.month}</p>
              <p className="mt-1 text-xs opacity-90">{m.vibe}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Coffee className="h-4 w-4 text-gold" />
          <h3 className="font-display text-lg font-semibold">Sanity rules for junior year</h3>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SANITY_RULES.map((r) => (
            <div key={r.title} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">{r.emoji}</span>
                <p className="font-display font-semibold">{r.title}</p>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">{r.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-gold" />
          <h3 className="font-display text-lg font-semibold">Junior conversation starters</h3>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {CONVO_PROMPTS.map((p) => (
            <Link
              key={p.label}
              to="/community/discussions/$slug"
              params={{ slug: p.slug }}
              className="rounded-xl border border-border bg-card p-4 text-sm transition hover:border-gold/40"
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
