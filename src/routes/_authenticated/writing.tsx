import { createFileRoute, Link } from "@tanstack/react-router";
import { StudentOnly } from "@/components/student-only";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useGradeLevel } from "@/hooks/use-grade-level";
import { WRITING_PROMPTS, promptsForGrade, wordCount, type WritingPrompt } from "@/lib/writing-prompts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Feather, Flame, BookOpen, Save, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/writing")({
  head: () => ({
    meta: [
      { title: "Writing Practice — The Plug" },
      { name: "description", content: "Grade-tuned writing prompts, drafts, and streak tracking." },
    ],
  }),
  component: () => <StudentOnly><WritingPage /></StudentOnly>,
});

interface Entry {
  id: string;
  prompt_id: string;
  prompt_text: string;
  response: string;
  word_count: number;
  updated_at: string;
}

const CATEGORIES: (WritingPrompt["category"] | "all")[] = ["all", "reflection", "narrative", "argument", "college", "creative"];

function WritingPage() {
  const { grade } = useGradeLevel();
  const [userId, setUserId] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [category, setCategory] = useState<WritingPrompt["category"] | "all">("all");
  const [selected, setSelected] = useState<WritingPrompt | null>(null);
  const [draft, setDraft] = useState("");
  const [draftId, setDraftId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase
        .from("writing_entries")
        .select("id, prompt_id, prompt_text, response, word_count, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(50);
      setEntries((data as Entry[]) ?? []);
    })();
  }, []);

  const pool = promptsForGrade(grade ?? null);
  const filtered = category === "all" ? pool : pool.filter((p) => p.category === category);
  const streak = calcStreak(entries);
  const totalWords = entries.reduce((s, e) => s + (e.word_count ?? 0), 0);

  function openPrompt(p: WritingPrompt) {
    setSelected(p);
    const existing = entries.find((e) => e.prompt_id === p.id);
    setDraft(existing?.response ?? "");
    setDraftId(existing?.id ?? null);
  }

  async function saveDraft() {
    if (!selected || !userId) return;
    setSaving(true);
    try {
      const payload = {
        user_id: userId,
        prompt_id: selected.id,
        prompt_text: selected.prompt,
        response: draft,
        word_count: wordCount(draft),
      };
      let id = draftId;
      if (id) {
        const { error } = await supabase.from("writing_entries").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("writing_entries").insert(payload).select("id").single();
        if (error) throw error;
        id = data.id;
        setDraftId(id);
      }
      toast.success("Draft saved");
      // refresh
      const { data } = await supabase
        .from("writing_entries").select("id, prompt_id, prompt_text, response, word_count, updated_at")
        .eq("user_id", userId).order("updated_at", { ascending: false }).limit(50);
      setEntries((data as Entry[]) ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-night">
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <span className="font-display text-lg font-semibold tracking-tight">Writing Practice</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-3">
          <StatTile icon={Flame} label="Streak" value={`${streak} day${streak === 1 ? "" : "s"}`} />
          <StatTile icon={BookOpen} label="Drafts saved" value={entries.length.toString()} />
          <StatTile icon={Feather} label="Words written" value={totalWords.toLocaleString()} />
        </div>

        {/* Recent drafts */}
        {entries.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-3 font-display text-lg font-semibold">Recent drafts</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {entries.slice(0, 4).map((e) => {
                const p = WRITING_PROMPTS.find((x) => x.id === e.prompt_id);
                return (
                  <button
                    key={e.id}
                    onClick={() => p && openPrompt(p)}
                    className="rounded-xl border border-border/50 bg-card/40 p-4 text-left transition hover:border-gold/40"
                  >
                    <p className="mb-2 line-clamp-2 text-sm font-medium">{e.prompt_text}</p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{e.response || "Empty draft"}</p>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {e.word_count} words · {new Date(e.updated_at).toLocaleDateString()}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Prompt library */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Prompt library</h2>
            <span className="text-xs text-muted-foreground">
              {grade ? `Grade ${grade}` : "All grades"} · {filtered.length} prompts
            </span>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full border px-3 py-1 text-xs capitalize transition ${
                  category === c
                    ? "border-gold/50 bg-gold/15 text-gold"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {filtered.map((p) => {
              const done = entries.some((e) => e.prompt_id === p.id && e.word_count >= p.minWords);
              return (
                <button
                  key={p.id}
                  onClick={() => openPrompt(p)}
                  className="rounded-xl border border-border/50 bg-card/40 p-4 text-left transition hover:border-gold/40"
                >
                  <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
                    <span>{p.category} · {p.minWords}–{p.maxWords} words</span>
                    {done && <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="h-3 w-3" /> done</span>}
                  </div>
                  <p className="text-sm leading-relaxed">{p.prompt}</p>
                </button>
              );
            })}
          </div>
        </section>
      </main>

      {/* Focus editor modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur">
          <header className="flex items-center justify-between border-b border-border/40 px-6 py-4">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {selected.category} · {selected.minWords}–{selected.maxWords} words
              </p>
              <h3 className="mt-1 max-w-3xl font-display text-base font-semibold">{selected.prompt}</h3>
            </div>
            <button onClick={() => setSelected(null)} className="rounded-full p-2 hover:bg-secondary">
              <X className="h-4 w-4" />
            </button>
          </header>
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col p-6">
            {selected.hint && (
              <p className="mb-3 rounded-lg border border-gold/20 bg-gold/[0.04] px-3 py-2 text-xs italic text-muted-foreground">
                💡 {selected.hint}
              </p>
            )}
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Start writing…"
              className="flex-1 resize-none text-base leading-relaxed"
            />
            <div className="mt-4 flex items-center justify-between">
              <span className={`text-sm ${wordCount(draft) >= selected.minWords ? "text-emerald-400" : "text-muted-foreground"}`}>
                {wordCount(draft)} / {selected.minWords} words
              </span>
              <Button onClick={saveDraft} disabled={saving} className="bg-gold text-primary-foreground hover:opacity-90">
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving…" : "Save draft"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatTile({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/40 p-4">
      <Icon className="mb-2 h-4 w-4 text-gold" />
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function calcStreak(entries: Entry[]): number {
  if (entries.length === 0) return 0;
  const days = new Set(entries.map((e) => new Date(e.updated_at).toDateString()));
  let streak = 0;
  const d = new Date();
  while (days.has(d.toDateString())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
