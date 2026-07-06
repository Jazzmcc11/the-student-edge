import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { coachEssay } from "@/lib/essays.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft, Plus, Pencil, Trash2, Sparkles, Loader2, BookOpen, Feather, Target, Focus, X,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/essays")({
  head: () => ({
    meta: [
      { title: "Essays — The Plug" },
      { name: "description", content: "Draft your personal statement and supplements with an AI coach in your corner." },
    ],
  }),
  component: () => { const { StudentOnly } = require("@/components/student-only"); return <StudentOnly><EssaysPage /></StudentOnly>; },
});

type Essay = {
  id: string;
  title: string;
  prompt: string | null;
  prompt_type: string;
  draft_content: string;
  word_limit: number | null;
  status: string;
  updated_at: string;
};

const STATUSES = [
  { value: "brainstorming", label: "Brainstorming", tone: "bg-purple-500/15 text-purple-300" },
  { value: "drafting", label: "Drafting", tone: "bg-blue-500/15 text-blue-300" },
  { value: "revising", label: "Revising", tone: "bg-amber-500/15 text-amber-300" },
  { value: "final", label: "Final", tone: "bg-emerald-500/15 text-emerald-300" },
];

const COMMON_APP_PROMPTS = [
  "Some students have a background, identity, interest, or talent that is so meaningful they believe their application would be incomplete without it. If this sounds like you, then please share your story.",
  "The lessons we take from obstacles we encounter can be fundamental to later success. Recount a time when you faced a challenge, setback, or failure. How did it affect you, and what did you learn from the experience?",
  "Reflect on a time when you questioned or challenged a belief or idea. What prompted your thinking? What was the outcome?",
  "Reflect on something that someone has done for you that has made you happy or thankful in a surprising way. How has this gratitude affected or motivated you?",
  "Discuss an accomplishment, event, or realization that sparked a period of personal growth and a new understanding of yourself or others.",
  "Describe a topic, idea, or concept you find so engaging that it makes you lose all track of time. Why does it captivate you? What or who do you turn to when you want to learn more?",
  "Share an essay on any topic of your choice. It can be one you've already written, one that responds to a different prompt, or one of your own design.",
];

function EssaysPage() {
  const navigate = useNavigate();
  const [essays, setEssays] = useState<Essay[] | null>(null);
  const [active, setActive] = useState<Essay | null>(null);
  const [showNew, setShowNew] = useState(false);

  async function load() {
    const { data, error } = await supabase
      .from("essays")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) toast.error(error.message);
    setEssays((data as Essay[]) || []);
  }

  useEffect(() => { load(); }, []);

  async function createEssay(payload: Partial<Essay>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("essays")
      .insert({
        user_id: user.id,
        title: payload.title || "Untitled draft",
        prompt: payload.prompt || null,
        prompt_type: payload.prompt_type || "personal_statement",
        word_limit: payload.word_limit || null,
      })
      .select()
      .single();
    if (error) return toast.error(error.message);
    setShowNew(false);
    await load();
    setActive(data as Essay);
    toast.success("Fresh draft started");
  }

  async function removeEssay(id: string) {
    const { error } = await supabase.from("essays").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setActive(null);
    await load();
  }

  return (
    <div className="min-h-screen bg-gradient-night">
      <header className="border-b border-border/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="flex items-center gap-2 text-sm text-gold">
            <Feather className="h-4 w-4" /> Essay Workshop
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Your essays</h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              This is where your story gets shaped. Real drafts, real coaching, zero pressure.
            </p>
          </div>
          <Button onClick={() => setShowNew(true)} className="bg-gold text-primary-foreground hover:bg-gold/90 self-start md:self-auto">
            <Plus className="mr-2 h-4 w-4" /> New draft
          </Button>
        </div>

        {essays === null ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : essays.length === 0 ? (
          <EmptyEssays onNew={() => setShowNew(true)} />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {essays.map((e) => (
              <EssayCard key={e.id} essay={e} onOpen={() => setActive(e)} />
            ))}
          </div>
        )}
      </main>

      <NewEssayDialog open={showNew} onOpenChange={setShowNew} onCreate={createEssay} />

      {active && (
        <EssayEditor
          essay={active}
          onClose={() => { setActive(null); load(); }}
          onDelete={() => removeEssay(active.id)}
        />
      )}
    </div>
  );
}

function EmptyEssays({ onNew }: { onNew: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-gold/30 bg-card p-12 text-center">
      <BookOpen className="mx-auto h-10 w-10 text-gold" />
      <h2 className="mt-4 font-display text-2xl font-bold">Blank page energy</h2>
      <p className="mx-auto mt-2 max-w-md text-muted-foreground">
        Start with your personal statement or a supplement. The coach won't write for you — it'll help you find your voice.
      </p>
      <Button onClick={onNew} className="mt-6 bg-gold text-primary-foreground hover:bg-gold/90">
        <Plus className="mr-2 h-4 w-4" /> Start your first draft
      </Button>
    </div>
  );
}

function wordCount(s: string) {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function EssayCard({ essay, onOpen }: { essay: Essay; onOpen: () => void }) {
  const words = wordCount(essay.draft_content);
  const status = STATUSES.find((s) => s.value === essay.status) || STATUSES[0];
  const pct = essay.word_limit ? Math.min(100, Math.round((words / essay.word_limit) * 100)) : null;
  return (
    <button
      onClick={onOpen}
      className="group text-left rounded-2xl border border-border bg-card p-5 transition hover:border-gold/40 hover:shadow-gold"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-lg font-semibold line-clamp-2">{essay.title}</h3>
        <Pencil className="h-4 w-4 text-muted-foreground group-hover:text-gold" />
      </div>
      {essay.prompt && <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{essay.prompt}</p>}
      <div className="mt-4 flex items-center gap-2 text-xs">
        <span className={`rounded-full px-2 py-0.5 ${status.tone}`}>{status.label}</span>
        <span className="text-muted-foreground">
          {words} word{words === 1 ? "" : "s"}{essay.word_limit ? ` / ${essay.word_limit}` : ""}
        </span>
      </div>
      {pct !== null && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-gold transition-all" style={{ width: `${pct}%` }} />
        </div>
      )}
    </button>
  );
}

function NewEssayDialog({
  open, onOpenChange, onCreate,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  onCreate: (p: Partial<Essay>) => void;
}) {
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [promptType, setPromptType] = useState("personal_statement");
  const [wordLimit, setWordLimit] = useState<string>("650");

  useEffect(() => {
    if (open) { setTitle(""); setPrompt(""); setPromptType("personal_statement"); setWordLimit("650"); }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New draft</DialogTitle>
          <DialogDescription>Give it a working title and pick a prompt. You can change everything later.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Personal statement — first pass" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">Type</label>
              <Select value={promptType} onValueChange={setPromptType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal_statement">Personal statement</SelectItem>
                  <SelectItem value="supplement">Supplement</SelectItem>
                  <SelectItem value="scholarship">Scholarship essay</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Word limit</label>
              <Input value={wordLimit} onChange={(e) => setWordLimit(e.target.value)} placeholder="650" inputMode="numeric" />
            </div>
          </div>

          {promptType === "personal_statement" && (
            <div>
              <label className="text-sm text-muted-foreground">Common App 2026 prompts</label>
              <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-border">
                {COMMON_APP_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(p)}
                    className={`block w-full border-b border-border/50 p-3 text-left text-xs transition hover:bg-gold/5 last:border-b-0 ${
                      prompt === p ? "bg-gold/10 text-gold" : "text-muted-foreground"
                    }`}
                  >
                    <span className="font-medium text-foreground/80">Prompt {i + 1}. </span>{p}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-sm text-muted-foreground">Prompt</label>
            <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} placeholder="Paste or write the prompt you're responding to…" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            className="bg-gold text-primary-foreground hover:bg-gold/90"
            onClick={() => onCreate({
              title: title || "Untitled draft",
              prompt: prompt || null,
              prompt_type: promptType,
              word_limit: wordLimit ? Number(wordLimit) : null,
            })}
          >
            Start writing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------- EDITOR --------------------- */

function EssayEditor({
  essay: initial,
  onClose,
  onDelete,
}: {
  essay: Essay;
  onClose: () => void;
  onDelete: () => void;
}) {
  const [essay, setEssay] = useState<Essay>(initial);
  const [saving, setSaving] = useState(false);
  const [focus, setFocus] = useState(false);
  const [coachOutput, setCoachOutput] = useState<string | null>(null);
  const [coaching, setCoaching] = useState<string | null>(null);
  const coach = useServerFn(coachEssay);
  const words = useMemo(() => wordCount(essay.draft_content), [essay.draft_content]);
  const status = STATUSES.find((s) => s.value === essay.status) || STATUSES[0];

  // debounced autosave
  useEffect(() => {
    if (essay.id === initial.id && essay === initial) return;
    const t = setTimeout(async () => {
      setSaving(true);
      const { error } = await supabase
        .from("essays")
        .update({
          title: essay.title,
          prompt: essay.prompt,
          draft_content: essay.draft_content,
          status: essay.status,
          word_limit: essay.word_limit,
        })
        .eq("id", essay.id);
      setSaving(false);
      if (error) toast.error(error.message);
    }, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [essay.title, essay.prompt, essay.draft_content, essay.status, essay.word_limit]);

  async function runCoach(action: "feedback" | "tighten" | "voice" | "verbs" | "hook" | "brainstorm") {
    if (!essay.draft_content.trim() && action !== "brainstorm") {
      toast.error("Write a little first — even a few sentences.");
      return;
    }
    setCoaching(action);
    setCoachOutput(null);
    try {
      const res = await coach({ data: { draft: essay.draft_content || "(no draft yet — help me brainstorm)", prompt: essay.prompt || undefined, action } });
      setCoachOutput(res.text);
    } catch (err: any) {
      toast.error(err?.message || "Coach error");
    } finally {
      setCoaching(null);
    }
  }

  const overLimit = essay.word_limit && words > essay.word_limit;
  const pct = essay.word_limit ? Math.min(100, Math.round((words / essay.word_limit) * 100)) : null;

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto bg-background ${focus ? "" : "sm:p-6"}`}>
      <div className={`mx-auto ${focus ? "max-w-3xl px-6 py-10" : "max-w-6xl"}`}>
        {/* toolbar */}
        <div className="sticky top-0 z-10 -mx-6 flex items-center justify-between border-b border-border/40 bg-background/95 px-6 py-3 backdrop-blur">
          <div className="flex items-center gap-3 min-w-0">
            <Button size="sm" variant="ghost" onClick={onClose}><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button>
            <Input
              value={essay.title}
              onChange={(e) => setEssay({ ...essay, title: e.target.value })}
              className="w-64 border-0 bg-transparent font-display text-lg focus-visible:ring-0"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {saving ? "Saving…" : "Saved"}
            </span>
            <Select value={essay.status} onValueChange={(v) => setEssay({ ...essay, status: v })}>
              <SelectTrigger className="w-36 h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" variant="ghost" onClick={() => setFocus((f) => !f)} title="Focus mode">
              <Focus className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete} className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className={`grid gap-6 py-6 ${focus ? "grid-cols-1" : "lg:grid-cols-[1fr_320px]"}`}>
          {/* Left: prompt + editor */}
          <div className="space-y-4">
            {essay.prompt && (
              <div className="rounded-xl border border-gold/20 bg-gold/5 p-4">
                <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-gold">
                  <Target className="h-3 w-3" /> The prompt
                </div>
                <p className="text-sm">{essay.prompt}</p>
              </div>
            )}
            <Textarea
              value={essay.draft_content}
              onChange={(e) => setEssay({ ...essay, draft_content: e.target.value })}
              placeholder="Start anywhere. The first draft only has to exist."
              className={`min-h-[500px] resize-none border-border/60 bg-card p-6 text-base leading-relaxed ${focus ? "min-h-[70vh]" : ""}`}
            />
            <div className="flex items-center justify-between text-sm">
              <span className={overLimit ? "text-destructive" : "text-muted-foreground"}>
                {words} word{words === 1 ? "" : "s"}
                {essay.word_limit ? ` / ${essay.word_limit}` : ""}
                {overLimit ? " · over limit" : ""}
              </span>
              {pct !== null && (
                <div className="ml-4 h-1.5 flex-1 max-w-xs overflow-hidden rounded-full bg-secondary">
                  <div className={`h-full transition-all ${overLimit ? "bg-destructive" : "bg-gold"}`} style={{ width: `${pct}%` }} />
                </div>
              )}
              <Badge variant="outline" className={status.tone}>{status.label}</Badge>
            </div>
          </div>

          {/* Right: coach */}
          {!focus && (
            <aside className="space-y-3">
              <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-gold" />
                  <h3 className="font-display font-semibold">Essay Coach</h3>
                </div>
                <p className="mb-4 text-xs text-muted-foreground">
                  Won't write it for you. Will help you make it stronger.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <CoachBtn label="Feedback" action="feedback" loading={coaching} onClick={runCoach} />
                  <CoachBtn label="Tighten it" action="tighten" loading={coaching} onClick={runCoach} />
                  <CoachBtn label="My voice" action="voice" loading={coaching} onClick={runCoach} />
                  <CoachBtn label="Stronger verbs" action="verbs" loading={coaching} onClick={runCoach} />
                  <CoachBtn label="The hook" action="hook" loading={coaching} onClick={runCoach} />
                  <CoachBtn label="I'm stuck" action="brainstorm" loading={coaching} onClick={runCoach} />
                </div>
              </div>

              {coachOutput && (
                <div className="rounded-2xl border border-border bg-card p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-gold">Coach said</span>
                    <button onClick={() => setCoachOutput(null)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{coachOutput}</div>
                </div>
              )}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

function CoachBtn({
  label, action, loading, onClick,
}: {
  label: string;
  action: "feedback" | "tighten" | "voice" | "verbs" | "hook" | "brainstorm";
  loading: string | null;
  onClick: (a: any) => void;
}) {
  const isLoading = loading === action;
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => onClick(action)}
      disabled={!!loading}
      className="justify-start border-gold/20 hover:bg-gold/10 hover:text-gold text-xs"
    >
      {isLoading ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : <Sparkles className="mr-1.5 h-3 w-3" />}
      {label}
    </Button>
  );
}
