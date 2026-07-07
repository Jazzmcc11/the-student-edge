import { createFileRoute } from "@tanstack/react-router";
import { StudentOnly } from "@/components/student-only";
import { useState, useRef, useEffect, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { askTutor } from "@/lib/tutor.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Send, User, Bot, Loader2, Target, MessageCircle, CheckCircle2, XCircle, RotateCcw, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  PRACTICE_BANK,
  TEST_SECTIONS,
  TEST_META,
  questionsFor,
  type PracticeQuestion,
  type TestKind,
} from "@/lib/practice-bank";

export const Route = createFileRoute("/_authenticated/tutor")({
  head: () => ({
    meta: [
      { title: "AI Tutor — The Plug" },
      { name: "description", content: "Ask anything — homework help, essay feedback, study plans, plus TSI/SAT/PSAT practice." },
    ],
  }),
  component: () => <StudentOnly><TutorPage /></StudentOnly>,
});

type Tab = "chat" | "practice";

function TutorPage() {
  const [tab, setTab] = useState<Tab>("chat");

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col px-4 py-6">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-gold shadow-gold">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold leading-tight">AI Tutor</h1>
            <p className="text-xs text-muted-foreground">Ask anything · practice for the real tests</p>
          </div>
        </div>
      </header>

      <div className="mb-4 inline-flex gap-1 self-start rounded-full border border-border bg-card/60 p-1">
        <TabBtn active={tab === "chat"} onClick={() => setTab("chat")} icon={MessageCircle}>Chat</TabBtn>
        <TabBtn active={tab === "practice"} onClick={() => setTab("practice")} icon={Target}>Practice</TabBtn>
      </div>

      {tab === "chat" ? <ChatPanel /> : <PracticePanel />}
    </div>
  );
}

function TabBtn({ active, onClick, icon: Icon, children }: {
  active: boolean; onClick: () => void; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm transition ${
        active ? "bg-gold text-primary-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-3.5 w-3.5" /> {children}
    </button>
  );
}

/* ─────────────────────────── Chat ─────────────────────────── */

type Msg = { role: "user" | "assistant"; content: string };
const SUBJECTS = ["General", "Math", "English / Essays", "Science", "History", "SAT / ACT", "College Apps"];
const STARTERS = [
  "Help me understand the quadratic formula with an example.",
  "Give me feedback on my Common App essay opening: ...",
  "Make me a 1-week SAT math study plan.",
  "Explain photosynthesis like I'm prepping for a quiz tomorrow.",
];

function ChatPanel() {
  const ask = useServerFn(askTutor);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [subject, setSubject] = useState("General");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { text: reply } = await ask({
        data: { messages: next, subject: subject === "General" ? undefined : subject },
      });
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-3 flex justify-end">
        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-border bg-card/40 p-4">
        {messages.length === 0 && !loading && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gold/10">
              <Bot className="h-6 w-6 text-gold" />
            </div>
            <h2 className="font-display text-lg font-bold">What are we working on?</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Ask a question, paste a problem, or pick a starter below.
            </p>
            <div className="mt-5 grid w-full max-w-md gap-2">
              {STARTERS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="rounded-lg border border-border bg-background/60 px-3 py-2 text-left text-sm transition hover:border-gold/50 hover:bg-gold/5">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
              m.role === "user" ? "bg-gold/20 text-gold" : "bg-secondary text-foreground"
            }`}>
              {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              m.role === "user" ? "bg-gold text-primary-foreground" : "bg-background border border-border"
            }`}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary"><Bot className="h-4 w-4" /></div>
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
            </div>
          </div>
        )}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="mt-3 flex items-end gap-2">
        <Textarea value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          rows={2} placeholder="Ask anything…" className="resize-none" disabled={loading} />
        <Button type="submit" disabled={loading || !input.trim()}
          className="h-[60px] bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95">
          <Send className="h-4 w-4" />
        </Button>
      </form>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        AI can make mistakes — double-check important info.
      </p>
    </>
  );
}

/* ─────────────────────────── Practice ─────────────────────────── */

function PracticePanel() {
  const ask = useServerFn(askTutor);
  const [test, setTest] = useState<TestKind>("SAT");
  const [section, setSection] = useState<string>(TEST_SECTIONS.SAT[0]);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [coach, setCoach] = useState<string | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const questions = useMemo(() => questionsFor(test, section), [test, section]);
  const q = questions[index];
  const meta = TEST_META[test];

  function switchTest(t: TestKind) {
    setTest(t); setSection(TEST_SECTIONS[t][0]);
    setIndex(0); setChosen(null); setRevealed(false); setCoach(null);
  }
  function switchSection(s: string) {
    setSection(s); setIndex(0); setChosen(null); setRevealed(false); setCoach(null);
  }
  function next() {
    setIndex((i) => (i + 1) % Math.max(questions.length, 1));
    setChosen(null); setRevealed(false); setCoach(null);
  }

  async function submit(key: string) {
    if (revealed || !q) return;
    setChosen(key); setRevealed(true);
    const correct = key === q.answer;
    setStats((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    if (userId) {
      supabase.from("practice_attempts").insert({
        user_id: userId, test: q.test, section: q.section,
        question_id: q.id, chosen: key, correct,
      }).then(({ error }) => { if (error) console.error(error); });
    }
  }

  async function askCoach() {
    if (!q) return;
    setCoachLoading(true); setCoach(null);
    try {
      const prompt = `I'm practicing ${q.test} ${q.section}. Question:\n\n${q.passage ? q.passage + "\n\n" : ""}${q.prompt}\n\nChoices:\n${q.choices.map(c => `${c.key}. ${c.text}`).join("\n")}\n\nCorrect answer: ${q.answer}. I picked ${chosen ?? "nothing yet"}.\n\nExplain like a coach — help me see the trick or trap, not just the answer.`;
      const { text } = await ask({ data: { messages: [{ role: "user", content: prompt }], subject: `${q.test} Prep` } });
      setCoach(text);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Coach hit an error");
    } finally { setCoachLoading(false); }
  }

  if (!q) {
    return <div className="rounded-xl border border-border bg-card/40 p-6 text-sm text-muted-foreground">No questions loaded.</div>;
  }

  return (
    <div className="flex-1 space-y-4 overflow-y-auto">
      {/* Test/section picker */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-full border border-border bg-card/60 p-1">
          {(Object.keys(TEST_SECTIONS) as TestKind[]).map((t) => (
            <button key={t} onClick={() => switchTest(t)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                test === t ? "bg-gold text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}>{t}</button>
          ))}
        </div>
        <Select value={section} onValueChange={switchSection}>
          <SelectTrigger className="h-8 w-[180px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {TEST_SECTIONS[test].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="ml-auto text-xs text-muted-foreground">
          {stats.total > 0 && <>Session: <span className="text-foreground">{stats.correct}/{stats.total}</span></>}
        </div>
      </div>

      {/* Blurb + official link */}
      <div className="rounded-lg border border-border/50 bg-card/30 px-3 py-2 text-xs text-muted-foreground">
        <div className="flex items-center justify-between gap-2">
          <span>{meta.blurb}</span>
          <a href={meta.officialUrl} target="_blank" rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-1 text-gold hover:underline">
            {meta.officialLabel} <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Question card */}
      <div className="rounded-xl border border-border bg-card/40 p-5">
        <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
          <span>{q.test} · {q.section} · {q.difficulty}</span>
          <span>Question {index + 1} of {questions.length}</span>
        </div>
        {q.passage && (
          <div className="mb-4 rounded-lg border border-border/50 bg-background/50 p-3 text-sm italic leading-relaxed">
            {q.passage}
          </div>
        )}
        <p className="mb-4 text-sm font-medium leading-relaxed">{q.prompt}</p>
        <div className="space-y-2">
          {q.choices.map((c) => {
            const isChosen = chosen === c.key;
            const isCorrect = c.key === q.answer;
            const state = !revealed ? "idle" : isCorrect ? "correct" : isChosen ? "wrong" : "idle";
            return (
              <button key={c.key} onClick={() => submit(c.key)} disabled={revealed}
                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                  state === "correct" ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-100" :
                  state === "wrong"   ? "border-rose-500/60 bg-rose-500/10 text-rose-100" :
                  isChosen            ? "border-gold/50 bg-gold/10" :
                                        "border-border hover:border-gold/40 hover:bg-gold/5"
                } ${revealed ? "cursor-default" : ""}`}>
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                  state === "correct" ? "border-emerald-400 text-emerald-300" :
                  state === "wrong" ? "border-rose-400 text-rose-300" : "border-border"
                }`}>{c.key}</span>
                <span className="flex-1">{c.text}</span>
                {state === "correct" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                {state === "wrong" && <XCircle className="h-4 w-4 text-rose-400" />}
              </button>
            );
          })}
        </div>

        {revealed && (
          <>
            <div className="mt-4 rounded-lg border border-gold/20 bg-gold/[0.04] p-3 text-sm">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-gold">Explanation</p>
              <p className="leading-relaxed text-foreground">{q.explanation}</p>
            </div>
            {coach && (
              <div className="mt-3 rounded-lg border border-border bg-background/50 p-3 text-sm">
                <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <Bot className="h-3 w-3" /> Coach
                </p>
                <p className="whitespace-pre-wrap leading-relaxed">{coach}</p>
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" onClick={next} className="bg-gold text-primary-foreground hover:opacity-90">
                Next question
              </Button>
              <Button size="sm" variant="outline" onClick={askCoach} disabled={coachLoading}>
                {coachLoading ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1 h-3.5 w-3.5" />}
                {coach ? "Ask coach again" : "Coach me on this"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setChosen(null); setRevealed(false); setCoach(null); }}>
                <RotateCcw className="mr-1 h-3.5 w-3.5" /> Retry
              </Button>
            </div>
          </>
        )}
      </div>

      <p className="text-center text-[11px] text-muted-foreground">
        Practice questions modeled on public official formats — take a real full-length via the link above.
      </p>
    </div>
  );
}

// unused-import stub to keep tree-shaker happy on the PRACTICE_BANK constant
void PRACTICE_BANK;
