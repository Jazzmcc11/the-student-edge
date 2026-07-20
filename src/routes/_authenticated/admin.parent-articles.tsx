import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ShieldAlert, CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import type { ParentSubmittedArticle } from "@/lib/parent-submissions";

export const Route = createFileRoute("/_authenticated/admin/parent-articles")({
  head: () => ({ meta: [{ title: "Parent article moderation — Admin — The Plug" }] }),
  component: AdminParentArticles,
});

function AdminParentArticles() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [items, setItems] = useState<ParentSubmittedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (adminLoading) return;
    if (!isAdmin) { toast.error("Admins only"); navigate({ to: "/dashboard" }); return; }
    load();
  }, [adminLoading, isAdmin, tab, navigate]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("parent_articles")
      .select("*")
      .eq("status", tab)
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) return toast.error(error.message);
    setItems((data ?? []) as ParentSubmittedArticle[]);
  }

  async function moderate(id: string, status: "approved" | "rejected") {
    setBusy(id);
    const patch: any = {
      status,
      moderation_note: notes[id] || null,
    };
    if (status === "approved") {
      const { data: { user } } = await supabase.auth.getUser();
      patch.approved_at = new Date().toISOString();
      patch.approved_by = user?.id ?? null;
    }
    const { error } = await supabase.from("parent_articles").update(patch).eq("id", id);
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success(status === "approved" ? "Published to the lounge" : "Rejected");
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  if (adminLoading) return null;

  return (
    <div className="min-h-screen bg-gradient-night">
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <div className="flex items-center gap-2 text-sm text-gold">
            <ShieldAlert className="h-4 w-4" /> Admin
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-3xl font-bold">Parent article moderation</h1>
        <p className="mt-1 text-muted-foreground">Review submissions from parents before they go live in the lounge.</p>

        <div className="mt-6 flex gap-2 border-b border-border">
          {(["pending", "approved", "rejected"] as const).map((s) => (
            <button key={s} onClick={() => setTab(s)}
              className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm capitalize ${
                tab === s ? "border-gold text-gold" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              {s === "pending" && <Clock className="h-3.5 w-3.5" />}
              {s === "approved" && <CheckCircle2 className="h-3.5 w-3.5" />}
              {s === "rejected" && <XCircle className="h-3.5 w-3.5" />}
              {s}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {loading ? <p className="text-sm text-muted-foreground">Loading…</p>
            : items.length === 0 ? <p className="text-sm text-muted-foreground">Nothing {tab} right now.</p>
            : items.map((a) => (
              <article key={a.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-xl font-semibold">{a.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{a.blurb}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      By <span className="text-gold">{a.author_display_name}</span>
                      {a.author_child_grade && <> · parent of {a.author_child_grade}</>}
                      <> · {a.category}</>
                    </p>
                  </div>
                </div>
                <div className="mt-4 whitespace-pre-wrap rounded-lg border border-dashed border-border/60 bg-background/40 p-4 text-sm leading-relaxed">
                  {a.body}
                </div>
                {tab === "pending" && (
                  <div className="mt-4 space-y-2">
                    <Textarea
                      placeholder="Optional note back to the author (shows in their 'My submissions' view)"
                      value={notes[a.id] ?? ""}
                      onChange={(e) => setNotes({ ...notes, [a.id]: e.target.value })}
                      rows={2}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" disabled={busy === a.id} onClick={() => moderate(a.id, "rejected")}>
                        <XCircle className="mr-1.5 h-4 w-4" /> Reject
                      </Button>
                      <Button size="sm" disabled={busy === a.id} onClick={() => moderate(a.id, "approved")}>
                        <CheckCircle2 className="mr-1.5 h-4 w-4" /> Publish
                      </Button>
                    </div>
                  </div>
                )}
                {a.moderation_note && tab !== "pending" && (
                  <p className="mt-3 rounded-md border border-dashed border-border/60 p-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Note: </span>{a.moderation_note}
                  </p>
                )}
              </article>
            ))}
        </div>
      </main>
    </div>
  );
}
