import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { SUBMISSION_CATEGORY_OPTIONS, submitParentArticle, fetchMySubmissions, type ParentSubmittedArticle } from "@/lib/parent-submissions";
import { X, CheckCircle2, Clock, XCircle } from "lucide-react";

const schema = z.object({
  author_display_name: z.string().trim().min(2, "Add a name (first name is fine)").max(60),
  author_child_grade: z.string().trim().max(20).optional(),
  title: z.string().trim().min(6, "Give it a real title").max(120),
  blurb: z.string().trim().min(20, "One sentence — what will other parents get out of it?").max(240),
  body: z.string().trim().min(120, "Give us a few paragraphs of substance").max(6000),
  category: z.string(),
});

interface Props {
  userId: string;
  defaultName?: string;
  onClose: () => void;
  onSubmitted?: () => void;
}

export function ParentSubmissionModal({ userId, defaultName, onClose, onSubmitted }: Props) {
  const [tab, setTab] = useState<"write" | "mine">("write");
  const [saving, setSaving] = useState(false);
  const [mine, setMine] = useState<ParentSubmittedArticle[]>([]);
  const [loadingMine, setLoadingMine] = useState(false);
  const [form, setForm] = useState({
    author_display_name: defaultName ?? "",
    author_child_grade: "",
    title: "",
    blurb: "",
    body: "",
    category: SUBMISSION_CATEGORY_OPTIONS[0].id as string,
  });

  useEffect(() => {
    if (tab !== "mine") return;
    setLoadingMine(true);
    fetchMySubmissions(userId).then(setMine).catch((e) => toast.error(e.message)).finally(() => setLoadingMine(false));
  }, [tab, userId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Fix the form");
      return;
    }
    setSaving(true);
    try {
      await submitParentArticle({
        author_id: userId,
        author_display_name: parsed.data.author_display_name,
        author_child_grade: parsed.data.author_child_grade || null,
        title: parsed.data.title,
        blurb: parsed.data.blurb,
        body: parsed.data.body,
        category: parsed.data.category,
      });
      toast.success("Sent to the crew for review. Thank you.");
      onSubmitted?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? "Couldn't submit");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/95 p-4 backdrop-blur">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-gold">FUBU · For us, by us</p>
            <h2 className="mt-1 font-display text-2xl font-bold">Share your parent wisdom</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Real advice from real parents lands harder than a blog. Drop yours here — we'll review and publish it in the lounge under your name.
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>

        <div className="mb-4 flex gap-2 border-b border-border">
          <button onClick={() => setTab("write")}
            className={`border-b-2 px-3 py-2 text-sm ${tab === "write" ? "border-gold text-gold" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            Write one
          </button>
          <button onClick={() => setTab("mine")}
            className={`border-b-2 px-3 py-2 text-sm ${tab === "mine" ? "border-gold text-gold" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            My submissions
          </button>
        </div>

        {tab === "write" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Your name (as it should appear)</Label>
                <Input id="name" value={form.author_display_name}
                  onChange={(e) => setForm({ ...form, author_display_name: e.target.value })}
                  maxLength={60} placeholder="e.g. Tasha, mom of 3" />
              </div>
              <div>
                <Label htmlFor="grade">Your child's grade (optional)</Label>
                <Input id="grade" value={form.author_child_grade}
                  onChange={(e) => setForm({ ...form, author_child_grade: e.target.value })}
                  maxLength={20} placeholder="e.g. Senior" />
              </div>
            </div>
            <div>
              <Label htmlFor="cat">Category</Label>
              <select id="cat" value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                {SUBMISSION_CATEGORY_OPTIONS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                maxLength={120} placeholder="Something a scrolling parent will actually click" />
            </div>
            <div>
              <Label htmlFor="blurb">One-sentence hook</Label>
              <Input id="blurb" value={form.blurb}
                onChange={(e) => setForm({ ...form, blurb: e.target.value })}
                maxLength={240} placeholder="What will they get out of it?" />
            </div>
            <div>
              <Label htmlFor="body">Your article</Label>
              <Textarea id="body" value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={10} maxLength={6000}
                placeholder={"Write like you talk. Break it into short paragraphs — one thought per paragraph. Specific stories beat general advice."} />
              <p className="mt-1 text-xs text-muted-foreground">{form.body.length}/6000</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Sending…" : "Send for review"}</Button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            {loadingMine ? <p className="text-sm text-muted-foreground">Loading…</p>
              : mine.length === 0 ? <p className="text-sm text-muted-foreground">Nothing submitted yet.</p>
              : mine.map((a) => (
                <div key={a.id} className="rounded-xl border border-border bg-background/40 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-display text-sm font-semibold">{a.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{a.blurb}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                  {a.moderation_note && (
                    <p className="mt-2 rounded-md border border-dashed border-border/60 p-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Reviewer note: </span>{a.moderation_note}
                    </p>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ParentSubmittedArticle["status"] }) {
  const map = {
    pending: { icon: Clock, cls: "text-amber-400 bg-amber-500/10 border-amber-500/30", label: "Pending" },
    approved: { icon: CheckCircle2, cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", label: "Published" },
    rejected: { icon: XCircle, cls: "text-rose-400 bg-rose-500/10 border-rose-500/30", label: "Not published" },
  }[status];
  const Icon = map.icon;
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${map.cls}`}>
      <Icon className="h-3 w-3" /> {map.label}
    </span>
  );
}

// Ensure supabase import isn't tree-shaken accidentally by consumers
void supabase;
