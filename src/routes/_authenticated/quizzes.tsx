import { createFileRoute, Link } from "@tanstack/react-router";
import { StudentOnly } from "@/components/student-only";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Brain, BookOpen, Compass, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/quizzes")({
  head: () => ({ meta: [{ title: "Quizzes — The Plug" }] }),
  component: () => <StudentOnly><QuizzesPage /></StudentOnly>,
});

type QKey = "visual" | "auditory" | "reading" | "kinesthetic";
const STUDY_QUESTIONS: { q: string; opts: { label: string; k: QKey }[] }[] = [
  { q: "When learning something new, I prefer to…", opts: [
    { label: "Watch a diagram or video", k: "visual" },
    { label: "Hear someone explain it", k: "auditory" },
    { label: "Read about it", k: "reading" },
    { label: "Try it hands-on", k: "kinesthetic" },
  ]},
  { q: "I remember info best when I…", opts: [
    { label: "See color-coded notes", k: "visual" },
    { label: "Say it out loud or discuss it", k: "auditory" },
    { label: "Rewrite it in my own words", k: "reading" },
    { label: "Act it out or build something", k: "kinesthetic" },
  ]},
  { q: "In a lecture, I focus most when…", opts: [
    { label: "There are slides / visuals", k: "visual" },
    { label: "The teacher tells stories", k: "auditory" },
    { label: "I take detailed notes", k: "reading" },
    { label: "I can move or fidget a little", k: "kinesthetic" },
  ]},
  { q: "Studying for a test, I usually…", opts: [
    { label: "Make mind maps or charts", k: "visual" },
    { label: "Explain concepts to a friend", k: "auditory" },
    { label: "Rewrite my notes into an outline", k: "reading" },
    { label: "Use flashcards + walk around", k: "kinesthetic" },
  ]},
  { q: "Directions make sense to me when…", opts: [
    { label: "I see a map or diagram", k: "visual" },
    { label: "Someone tells them to me", k: "auditory" },
    { label: "I read them step-by-step", k: "reading" },
    { label: "I just try and figure it out", k: "kinesthetic" },
  ]},
];

const STYLE_INFO: Record<QKey, { title: string; blurb: string; tips: string[] }> = {
  visual: {
    title: "Visual learner",
    blurb: "You lock things in through images, colors, and layout.",
    tips: [
      "Color-code your Focused Notes",
      "Turn key concepts into diagrams or mind maps",
      "Watch Khan Academy / YouTube before reading the textbook",
    ],
  },
  auditory: {
    title: "Auditory learner",
    blurb: "You process best by hearing and talking things through.",
    tips: [
      "Record yourself reading notes and replay while walking",
      "Study with a partner and explain out loud",
      "Use podcasts / audiobooks to review content",
    ],
  },
  reading: {
    title: "Reading/Writing learner",
    blurb: "You lean on text — reading it, writing it, rewriting it.",
    tips: [
      "Rewrite your notes into your own outline",
      "Use the AVID summary column in Focused Notes",
      "Practice short-answer writing every week",
    ],
  },
  kinesthetic: {
    title: "Hands-on learner",
    blurb: "You learn by doing — moving, building, practicing.",
    tips: [
      "Use flashcards you can shuffle and sort",
      "Take short movement breaks every 25 min",
      "Do practice problems before rereading notes",
    ],
  },
};

const STORAGE_KEY = "plug.study_style_result";

function QuizzesPage() {
  const [existing, setExisting] = useState<QKey | null>(null);
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QKey[]>([]);

  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s === "visual" || s === "auditory" || s === "reading" || s === "kinesthetic") setExisting(s);
    } catch {}
  }, []);

  function pick(k: QKey) {
    const next = [...answers, k];
    setAnswers(next);
    if (next.length === STUDY_QUESTIONS.length) {
      const tally: Record<QKey, number> = { visual: 0, auditory: 0, reading: 0, kinesthetic: 0 };
      next.forEach((a) => tally[a]++);
      const winner = (Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0]) as QKey;
      try { localStorage.setItem(STORAGE_KEY, winner); } catch {}
      setExisting(winner);
      setStarted(false);
      setAnswers([]);
      setStep(0);
    } else {
      setStep(step + 1);
    }
  }

  function retake() {
    setStarted(true);
    setStep(0);
    setAnswers([]);
  }

  return (
    <div className="min-h-screen bg-gradient-night">
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8 flex items-start gap-3">
          <div className="rounded-lg bg-gold/10 p-2 text-gold"><Sparkles className="h-6 w-6" /></div>
          <div>
            <p className="text-sm text-gold">Know yourself</p>
            <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">Quick quizzes</h1>
            <p className="mt-1 text-muted-foreground">Short check-ins that help you plan smarter — for school, for college, for life.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link to="/personality" className="group">
            <Card className="h-full p-5 transition hover:border-gold/40 hover:shadow-gold">
              <Brain className="h-6 w-6 text-gold" />
              <h2 className="mt-3 font-display text-lg font-bold group-hover:text-gold">Personality archetype</h2>
              <p className="mt-1 text-sm text-muted-foreground">15-question quiz. Find your student archetype + majors that fit.</p>
              <span className="mt-3 inline-block text-xs text-gold">Take quiz →</span>
            </Card>
          </Link>

          <Card className="h-full p-5">
            <BookOpen className="h-6 w-6 text-gold" />
            <h2 className="mt-3 font-display text-lg font-bold">Study style</h2>
            <p className="mt-1 text-sm text-muted-foreground">5 questions. Learn how you learn — visual, auditory, reading, or hands-on.</p>
            {existing && !started ? (
              <div className="mt-3 rounded-md border border-gold/30 bg-gold/5 p-3">
                <p className="text-xs uppercase tracking-wide text-gold">Your style</p>
                <p className="font-semibold">{STYLE_INFO[existing].title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{STYLE_INFO[existing].blurb}</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  {STYLE_INFO[existing].tips.map((t) => <li key={t}>{t}</li>)}
                </ul>
                <Button size="sm" variant="outline" className="mt-3" onClick={retake}>
                  <RotateCcw className="mr-1 h-3 w-3" /> Retake
                </Button>
              </div>
            ) : (
              <Button size="sm" className="mt-3 bg-gold text-primary-foreground hover:bg-gold/90" onClick={() => setStarted(true)}>
                Start quiz
              </Button>
            )}
          </Card>

          <Card className="h-full p-5 opacity-70">
            <Compass className="h-6 w-6 text-gold" />
            <h2 className="mt-3 font-display text-lg font-bold">Career fit</h2>
            <p className="mt-1 text-sm text-muted-foreground">Coming soon — a quick quiz to surface college majors + career paths that match you.</p>
          </Card>
        </div>

        {started && (
          <Card className="mt-8 p-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Question {step + 1} of {STUDY_QUESTIONS.length}
            </p>
            <h3 className="mt-2 font-display text-xl font-bold">{STUDY_QUESTIONS[step].q}</h3>
            <div className="mt-4 grid gap-2">
              {STUDY_QUESTIONS[step].opts.map((o) => (
                <button
                  key={o.label}
                  onClick={() => pick(o.k)}
                  className="rounded-md border border-border bg-background px-4 py-3 text-left text-sm transition hover:border-gold/50 hover:bg-gold/5"
                >
                  {o.label}
                </button>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
