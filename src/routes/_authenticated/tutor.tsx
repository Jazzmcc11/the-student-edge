import { createFileRoute } from "@tanstack/react-router";
import { StudentOnly } from "@/components/student-only";
import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { askTutor } from "@/lib/tutor.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Send, User, Bot, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/tutor")({
  head: () => ({
    meta: [
      { title: "AI Tutor — The Plug" },
      { name: "description", content: "Ask Claude anything — homework help, essay feedback, study plans." },
    ],
  }),
  component: () => <StudentOnly><TutorPage /></StudentOnly>,
});

type Msg = { role: "user" | "assistant"; content: string };

const SUBJECTS = ["General", "Math", "English / Essays", "Science", "History", "SAT / ACT", "College Apps"];

const STARTERS = [
  "Help me understand the quadratic formula with an example.",
  "Give me feedback on my Common App essay opening: ...",
  "Make me a 1-week SAT math study plan.",
  "Explain photosynthesis like I'm prepping for a quiz tomorrow.",
];

function TutorPage() {
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
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
      setMessages(messages); // revert
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col px-4 py-6">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-gold shadow-gold">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold leading-tight">AI Tutor</h1>
            <p className="text-xs text-muted-foreground">Powered by Claude · ask anything</p>
          </div>
        </div>
        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-border bg-card/40 p-4"
      >
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
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-lg border border-border bg-background/60 px-3 py-2 text-left text-sm transition hover:border-gold/50 hover:bg-gold/5"
                >
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
              m.role === "user"
                ? "bg-gold text-primary-foreground"
                : "bg-background border border-border"
            }`}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="mt-3 flex items-end gap-2"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
          }}
          rows={2}
          placeholder="Ask anything — homework, essays, study plans…"
          className="resize-none"
          disabled={loading}
        />
        <Button
          type="submit"
          disabled={loading || !input.trim()}
          className="h-[60px] bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        AI can make mistakes — double-check important info.
      </p>
    </div>
  );
}
