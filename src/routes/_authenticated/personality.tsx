import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles, BookOpen, GraduationCap, Users } from "lucide-react";
import { toast } from "sonner";
import { QUESTIONS, scoreAxes, pickArchetype, type Answers, type Archetype } from "@/lib/personality";

export const Route = createFileRoute("/_authenticated/personality")({
  head: () => ({ meta: [{ title: "Personality Test — The Plug" }] }),
  component: PersonalityPage,
});

const LIKERT = [
  { v: 1, label: "Strongly disagree" },
  { v: 2, label: "Disagree" },
  { v: 3, label: "Neutral" },
  { v: 4, label: "Agree" },
  { v: 5, label: "Strongly agree" },
];

function PersonalityPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [existing, setExisting] = useState<Archetype | null>(null);
  const [retake, setRetake] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Archetype | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase
        .from("personality_results")
        .select("archetype, axes")
        .eq("user_id", user.id)
        .order("taken_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        const a = pickArchetype(data.axes as any);
        setExisting(a);
      }
    })();
  }, []);

  async function submitQuiz() {
    if (!userId) return;
    if (Object.keys(answers).length < QUESTIONS.length) {
      toast.error("Answer every question to see your archetype.");
      return;
    }
    setSubmitting(true);
    const axes = scoreAxes(answers);
    const archetype = pickArchetype(axes);
    const { error } = await supabase.from("personality_results").insert({
      user_id: userId,
      archetype: archetype.key,
      axes,
      answers,
    });
    setSubmitting(false);
    if (error) return toast.error("Couldn't save — try again");
    setResult(archetype);
    setExisting(archetype);
  }

  const showResult = result || (existing && !retake);
  const visibleArchetype = result || existing;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-gold">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Dashboard
          </Link>
          <span className="font-display text-lg font-bold">Personality Test</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        {showResult && visibleArchetype ? (
          <ResultView
            archetype={visibleArchetype}
            onRetake={() => {
              setRetake(true);
              setResult(null);
              setAnswers({});
              setStep(0);
            }}
          />
        ) : (
          <QuizView
            step={step}
            setStep={setStep}
            answers={answers}
            setAnswers={setAnswers}
            onSubmit={submitQuiz}
            submitting={submitting}
          />
        )}
      </main>
    </div>
  );
}

function QuizView({
  step, setStep, answers, setAnswers, onSubmit, submitting,
}: {
  step: number;
  setStep: (n: number) => void;
  answers: Answers;
  setAnswers: (a: Answers) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const q = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;
  const isAnswered = !!answers[q.id];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wider text-gold">Question {step + 1} of {QUESTIONS.length}</p>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-border">
          <div className="h-full bg-gold transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.18 }}
          className="rounded-2xl border border-border bg-card p-8"
        >
          <h2 className="font-display text-2xl font-semibold leading-snug">{q.prompt}</h2>

          <div className="mt-6 grid gap-2">
            {LIKERT.map((opt) => {
              const selected = answers[q.id] === opt.v;
              return (
                <button
                  key={opt.v}
                  onClick={() => setAnswers({ ...answers, [q.id]: opt.v })}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition ${
                    selected
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-border bg-background text-muted-foreground hover:border-foreground/40"
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className={`font-mono ${selected ? "text-gold" : "text-muted-foreground/60"}`}>{opt.v}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
        </Button>
        {isLast ? (
          <Button
            onClick={onSubmit}
            disabled={!isAnswered || submitting}
            className="bg-gold text-primary-foreground hover:bg-gold/90"
          >
            {submitting ? "Calculating…" : "Reveal my archetype"} <Sparkles className="ml-1.5 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!isAnswered}
            className="bg-gold text-primary-foreground hover:bg-gold/90"
          >
            Next <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function ResultView({ archetype, onRetake }: { archetype: Archetype; onRetake: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="rounded-2xl border border-gold/40 bg-gradient-to-br from-gold/10 to-transparent p-8 text-center shadow-gold">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Your archetype</p>
        <div className="mt-3 text-5xl">{archetype.emoji}</div>
        <h1 className="mt-3 font-display text-4xl font-bold">{archetype.name}</h1>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">{archetype.blurb}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SuggestionCard
          icon={BookOpen}
          heading="Academic move"
          body={archetype.academic}
        />
        <SuggestionCard
          icon={GraduationCap}
          heading="Major + scholarship tags"
          body={
            <>
              <p>{archetype.career.majors.join(" · ")}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {archetype.career.scholarshipTags.map((t) => (
                  <span key={t} className="rounded-full border border-gold/40 bg-gold/5 px-2 py-0.5 text-xs text-gold">
                    {t}
                  </span>
                ))}
              </div>
            </>
          }
          cta={{ to: "/scholarships", label: "Browse scholarships" }}
        />
        <SuggestionCard
          icon={Users}
          heading="Community fit"
          body={
            <>
              <p>{archetype.community.buddyStyle}</p>
              <p className="mt-2 text-xs text-muted-foreground">Topics: {archetype.community.topics.join(", ")}</p>
            </>
          }
          cta={{ to: "/community/buddies", label: "Find a buddy" }}
        />
      </div>

      <div className="flex justify-center">
        <Button variant="outline" onClick={onRetake} className="border-gold/40 text-gold hover:bg-gold hover:text-primary-foreground">
          <RotateCcw className="mr-1.5 h-4 w-4" /> Retake the quiz
        </Button>
      </div>
    </motion.div>
  );
}

function SuggestionCard({
  icon: Icon, heading, body, cta,
}: {
  icon: React.ElementType;
  heading: string;
  body: React.ReactNode;
  cta?: { to: string; label: string };
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/10">
        <Icon className="h-4 w-4 text-gold" />
      </div>
      <h3 className="mt-3 font-display text-base font-semibold">{heading}</h3>
      <div className="mt-1.5 text-sm text-muted-foreground">{body}</div>
      {cta && (
        <Link to={cta.to} className="mt-3 inline-flex items-center text-xs text-gold">
          {cta.label} <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      )}
    </div>
  );
}
