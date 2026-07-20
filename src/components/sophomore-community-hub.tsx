import { Link } from "@tanstack/react-router";
import { Sparkles, MessageSquare, Users, Compass, Sun, HelpCircle, Layers } from "lucide-react";

// A curated community landing panel for 10th graders (Sophomores).
// Focus: deepen — PSAT habits, leadership, AVID Inquiry + Collaboration,
// and planning a summer that actually counts.

const DEEPEN_MOVES = [
  { icon: Compass, title: "Pick a lane (or two)", body: "Go deeper in 1–2 activities instead of collecting five. Depth beats breadth." },
  { icon: Users, title: "Step up in a room", body: "Volunteer for one thing this month — event lead, tutoring, project role. Leadership starts small." },
  { icon: Sun, title: "Plan the summer early", body: "Program, job, or self-driven project. Sitting home reads flat on apps and feels worse." },
  { icon: Layers, title: "Add rigor with intention", body: "One challenging class you're actually curious about > four APs you'll hate." },
];

// AVID for sophomores: Inquiry + Collaboration go deep.
const INQUIRY_LEVELS = [
  { level: "Level 1", name: "Gather", tip: "Who / what / when / where. Facts on the page. This is the floor, not the ceiling." },
  { level: "Level 2", name: "Process", tip: "Compare, contrast, explain, summarize. What does the info actually mean?" },
  { level: "Level 3", name: "Apply", tip: "Predict, judge, defend, create. What would you do with this — and why?" },
];

const SOCRATIC_RULES = [
  "Talk to the group, not the teacher.",
  "Cite the text or the data — 'I think' needs a 'because'.",
  "Build on someone else's point before adding your own.",
  "Pull a quiet voice in. Ask them what they think.",
];

const CONVO_PROMPTS = [
  { slug: "sophomore-life", label: "Best way you found leadership without being 'the president'?" },
  { slug: "sophomore-life", label: "How are you prepping for the PSAT without burning out?" },
  { slug: "sophomore-life", label: "Drop your summer plan — trade ideas" },
];

export function SophomoreCommunityHub() {
  return (
    <section className="mb-8 space-y-6">
      <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-br from-sky-500/10 via-transparent to-transparent p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-sky-500/15 p-2">
            <Sparkles className="h-5 w-5 text-sky-400" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-sky-400">Sophomore hub</p>
            <h2 className="mt-1 font-display text-2xl font-bold">Go deeper. Ask sharper. Plan bigger.</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              10th grade is where habits become identity. Fewer things, done better — and the questions you ask start
              carrying weight.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-display text-lg font-semibold">Deepen this year</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {DEEPEN_MOVES.map((t) => (
            <div key={t.title} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <t.icon className="h-4 w-4 text-sky-400" />
                <p className="font-display font-semibold">{t.title}</p>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">{t.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-gold" />
          <h3 className="font-display text-lg font-semibold">AVID · Inquiry · Costa's levels of questioning</h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Good students answer questions. Great students ask better ones. Push your questions up a level.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {INQUIRY_LEVELS.map((l) => (
            <div key={l.level} className="rounded-lg border border-dashed border-border p-3">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-gold/15 px-2 py-0.5 font-display text-xs font-bold text-gold">
                  {l.level}
                </span>
                <p className="font-display text-sm font-semibold">{l.name}</p>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{l.tip}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gold" />
          <h3 className="font-display text-lg font-semibold">AVID · Collaboration · Socratic seminar rules</h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Use these in class, in study groups, on group projects. The room gets smarter when everyone plays by them.
        </p>
        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SOCRATIC_RULES.map((r) => (
            <li key={r} className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
              {r}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-gold" />
          <h3 className="font-display text-lg font-semibold">Sophomore conversation starters</h3>
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
