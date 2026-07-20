import { Link } from "@tanstack/react-router";
import { Sparkles, MessageSquare, Trophy, ShieldCheck, CalendarClock, PenLine, PartyPopper } from "lucide-react";

// A curated community landing panel for 12th graders (Seniors).
// Focus: apply, decide, celebrate — deadline sanity, AVID Organization + Writing
// for essays, and senioritis-proof routines.

const SENIOR_SANITY = [
  { icon: CalendarClock, title: "The 3-week radar", body: "Every Sunday: check deadlines coming up in the next 21 days. Nothing sneaks up." },
  { icon: ShieldCheck, title: "Senioritis-proof it", body: "Mid-year grades go to colleges. A slide can trigger a rescinded offer. Protect the GPA." },
  { icon: PartyPopper, title: "Celebrate on purpose", body: "Every submitted app = one small win. Post it in Wins. This year is too big to not mark it." },
  { icon: PenLine, title: "Reuse, don't rewrite", body: "Most supplements overlap. Keep a 'greatest hits' doc of paragraphs you can adapt." },
];

// AVID for seniors: Organization + Writing are the two skills that carry apps.
const ORG_SYSTEM = [
  { step: "1. One tracker", body: "Every college in one place with deadline, requirements, status. Nowhere else." },
  { step: "2. One inbox rule", body: "Filter every college email to a folder. Check it 2x/week — not 40x/day." },
  { step: "3. One weekly hour", body: "Same time each week. Move every app forward one square. Ship, don't perfect." },
  { step: "4. One backup", body: "Every essay lives in Google Drive too. Portals crash the week deadlines hit." },
];

const WRITING_RULES = [
  { title: "Cut the intro", body: "First paragraph of a first draft is almost always warm-up. Delete it — start at line 2." },
  { title: "Show one moment", body: "One specific scene beats three summaries. Zoom in until we smell the room." },
  { title: "Answer the actual prompt", body: "Read the prompt three times. Highlight verbs. If it says 'why us,' say why THEM." },
  { title: "Read it out loud", body: "If you stumble, they will too. Rewrite the sentences that trip your tongue." },
];

const CONVO_PROMPTS = [
  { slug: "senior-life", label: "How are you keeping grades up while apps are eating your life?" },
  { slug: "senior-life", label: "Common App supplement that's giving you trouble — let's crowdsource" },
  { slug: "senior-life", label: "Drop your submitted-list — we'll hype you" },
];

export function SeniorCommunityHub() {
  return (
    <section className="mb-8 space-y-6">
      <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-transparent to-transparent p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-rose-500/15 p-2">
            <Sparkles className="h-5 w-5 text-rose-400" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-rose-400">Senior hub</p>
            <h2 className="mt-1 font-display text-2xl font-bold">Apply. Decide. Celebrate.</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This year is a project — with a deadline. Systems keep you sane, essays win the seats, and we mark every
              win out loud.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-display text-lg font-semibold">Senior year sanity rules</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SENIOR_SANITY.map((t) => (
            <div key={t.title} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <t.icon className="h-4 w-4 text-rose-400" />
                <p className="font-display font-semibold">{t.title}</p>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">{t.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-gold" />
          <h3 className="font-display text-lg font-semibold">AVID · Organization · The 4-part senior system</h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Applications don't get lost because you're not smart enough. They get lost because there's no system.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ORG_SYSTEM.map((s) => (
            <div key={s.step} className="rounded-lg border border-dashed border-border p-3">
              <p className="font-display text-sm font-semibold">{s.step}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/tracker/colleges" className="rounded-full bg-gold/15 px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/25">
            Open your tracker →
          </Link>
          <Link to="/calendar" className="rounded-full border border-border px-3 py-1.5 text-xs hover:border-gold/40">
            See deadlines →
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <PenLine className="h-4 w-4 text-gold" />
          <h3 className="font-display text-lg font-semibold">AVID · Writing · Essay rules that ship</h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Perfect essays don't get submitted. Good ones do. Apply these to every draft.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {WRITING_RULES.map((r) => (
            <div key={r.title} className="rounded-lg border border-dashed border-border p-3">
              <p className="font-display text-sm font-semibold">{r.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{r.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Link to="/essays" className="rounded-full bg-gold/15 px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/25">
            Open essays workspace →
          </Link>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-gold" />
          <h3 className="font-display text-lg font-semibold">Senior conversation starters</h3>
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
