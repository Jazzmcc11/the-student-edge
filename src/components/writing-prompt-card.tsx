import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { dailyPrompt, wordCount, type WritingPrompt } from "@/lib/writing-prompts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Feather, Save, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  userId: string;
  grade: number | null;
}

export function WritingPromptCard({ userId, grade }: Props) {
  const [prompt, setPrompt] = useState<WritingPrompt | null>(null);
  const [text, setText] = useState("");
  const [entryId, setEntryId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const p = dailyPrompt(grade ?? null);
    setPrompt(p);
    // Load today's entry for this prompt, if any
    (async () => {
      const { data } = await supabase
        .from("writing_entries")
        .select("id, response")
        .eq("user_id", userId)
        .eq("prompt_id", p.id)
        .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
        .maybeSingle();
      if (data) {
        setEntryId(data.id);
        setText(data.response ?? "");
      }
    })();
  }, [userId, grade]);

  if (!prompt) return null;
  const wc = wordCount(text);
  const hitMin = wc >= prompt.minWords;

  async function save() {
    if (!prompt) return;
    setSaving(true);
    try {
      const payload = {
        user_id: userId,
        prompt_id: prompt.id,
        prompt_text: prompt.prompt,
        response: text,
        word_count: wordCount(text),
      };
      if (entryId) {
        const { error } = await supabase.from("writing_entries").update(payload).eq("id", entryId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("writing_entries").insert(payload).select("id").single();
        if (error) throw error;
        setEntryId(data.id);
      }
      setSaved(true);
      toast.success("Saved to your writing journal");
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mb-6 rounded-2xl border border-border/50 bg-gradient-to-br from-gold/[0.04] to-transparent p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15">
            <Feather className="h-4 w-4 text-gold" />
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold">Today's writing prompt</h3>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {prompt.category} · {prompt.minWords}–{prompt.maxWords} words
            </p>
          </div>
        </div>
        <Link to="/writing" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-gold">
          Library <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <p className="mb-3 text-sm leading-relaxed text-foreground">{prompt.prompt}</p>
      {prompt.hint && !expanded && (
        <button onClick={() => setExpanded(true)} className="mb-3 text-xs text-gold/80 hover:text-gold">
          Need a hint? →
        </button>
      )}
      {prompt.hint && expanded && (
        <p className="mb-3 rounded-lg border border-gold/20 bg-gold/[0.04] px-3 py-2 text-xs italic text-muted-foreground">
          💡 {prompt.hint}
        </p>
      )}

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start writing… no pressure, first drafts are supposed to be rough."
        rows={5}
        className="resize-none text-sm"
      />

      <div className="mt-3 flex items-center justify-between">
        <span className={`text-xs ${hitMin ? "text-emerald-400" : "text-muted-foreground"}`}>
          {wc} / {prompt.minWords} words {hitMin && "✓"}
        </span>
        <Button
          size="sm"
          onClick={save}
          disabled={saving || text.trim().length === 0}
          className="bg-gold text-primary-foreground hover:opacity-90"
        >
          {saved ? <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> : <Save className="mr-1 h-3.5 w-3.5" />}
          {saved ? "Saved" : saving ? "Saving…" : "Save draft"}
        </Button>
      </div>
    </div>
  );
}
