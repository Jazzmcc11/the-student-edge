import { Link } from "@tanstack/react-router";
import { Sparkles, NotebookPen, Users, Clock, Target, MessageSquare, GraduationCap } from "lucide-react";

// A curated community landing panel for 9th graders.
// Focus: adjusting to high school + AVID skills (WICOR: Writing, Inquiry,
// Collaboration, Organization, Reading).

const ADJUSTMENT_TIPS = [
  { icon: Clock, title: "Own your time", body: "Block homework in 25-min sprints. Protect one night a week for rest." },
  { icon: Users, title: "Find your people", body: "Sit with someone new at lunch this week. Join one club by month's end." },
  { icon: Target, title: "Talk to teachers", body: "Every teacher gets one question from you per week. Office hours count." },
  { icon: GraduationCap, title: "Grades compound", body: "9th grade GPA follows you. B+ habits now beat cramming later." },
];

const AVID_SKILLS = [
  {
    letter: "W",
    name: "Writing",
    tip: "Keep a learning log — 3 sentences after each class about what confused you.",
  },
  {
    letter: "I",
    name: "Inquiry",
    tip: "Turn notes into questions. If you can't ask a 'why,' you don't know it yet.",
  },
  {
    letter: "C",
    name: "Collaboration",
    tip: "Study in pairs weekly. Teaching a concept out loud locks it in.",
  },
  {
    letter: "O",
    name: "Organization",
    tip: "One binder or one folder-per-class in Drive. Cornell notes on everything.",
  },
  {
    letter: "R",
    name: "Reading",
    tip: "Preview → read → mark → summarize. Never highlight without a margin note.",
  },
];

const CONVO_PROMPTS = [
  { slug: "freshman-life", label: "What's the hardest adjustment from middle school?" },
  { slug: "freshman-life", label: "Share a Cornell notes hack that actually works" },
  { slug: "freshman-life", label: "How do you balance sports/clubs and homework?" },
];

export function FreshmanCommunityHub() {
  return (
    <section className="mb-8 space-y-6">
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-emerald-500/15 p-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-emerald-400">Freshman hub</p>
            <h2 className="mt-1 font-display text-2xl font-bold">Adjust, build habits, connect</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              High school is a new game. This is your corner — tips for surviving 9th grade and the AVID skills that
              make everything else easier.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-display text-lg font-semibold">Getting used to high school</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ADJUSTMENT_TIPS.map((t) => (
            <div key={t.title} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <t.icon className="h-4 w-4 text-emerald-400" />
                <p className="font-display font-semibold">{t.title}</p>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">{t.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="font-display text-lg font-semibold">AVID skills · WICOR</h3>
          <p className="text-xs text-muted-foreground">The 5 habits that carry you all four years</p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {AVID_SKILLS.map((s) => (
            <div key={s.letter} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold/15 font-display text-lg font-bold text-gold">
                  {s.letter}
                </span>
                <p className="font-display font-semibold">{s.name}</p>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{s.tip}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <NotebookPen className="h-4 w-4 text-gold" />
          <h3 className="font-display text-lg font-semibold">Try this: Cornell notes template</h3>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_2fr]">
          <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Questions / Cues</p>
            <p className="mt-1">Write questions here as you review notes on the right.</p>
          </div>
          <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Notes</p>
            <p className="mt-1">Main ideas, examples, diagrams — one topic per page.</p>
          </div>
          <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground sm:col-span-2">
            <p className="font-semibold text-foreground">Summary (2–3 sentences)</p>
            <p className="mt-1">Write within 24 hours. If you can't summarize it, re-read it.</p>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-gold" />
          <h3 className="font-display text-lg font-semibold">Freshman conversation starters</h3>
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
