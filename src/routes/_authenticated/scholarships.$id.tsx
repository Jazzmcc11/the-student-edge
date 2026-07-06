import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { StudentOnly } from "@/components/student-only";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, DollarSign, ExternalLink, BookmarkPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useIsAdmin } from "@/hooks/use-admin";

export const Route = createFileRoute("/_authenticated/scholarships/$id")({
  head: () => ({ meta: [{ title: "Scholarship — The Plug" }] }),
  component: () => <StudentOnly><ScholarshipDetail /></StudentOnly>,
});

type Scholarship = {
  id: string; name: string; provider: string | null; amount: number | null;
  deadline: string | null; category: string | null; eligibility: string | null;
  apply_url: string | null; description: string | null;
};

function ScholarshipDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { isAdmin } = useIsAdmin();
  const [s, setS] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("scholarships")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) toast.error(error.message);
      setS(data as Scholarship | null);
      setLoading(false);
    })();
  }, [id]);

  async function saveToTracker() {
    if (!s) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Sign in first"); setSaving(false); return; }
    const { error } = await supabase.from("scholarship_applications").insert({
      user_id: user.id,
      scholarship_id: s.id,
      name: s.name,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Added to your tracker");
  }

  async function deleteScholarship() {
    if (!s || !confirm("Delete this scholarship from the database?")) return;
    const { error } = await supabase.from("scholarships").delete().eq("id", s.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    navigate({ to: "/scholarships" });
  }

  if (loading) return <Shell><p className="text-muted-foreground">Loading…</p></Shell>;
  if (!s) return <Shell><p className="text-muted-foreground">Not found.</p></Shell>;

  return (
    <Shell>
      <div className="rounded-2xl border border-border bg-card p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            {s.category && (
              <span className="rounded-full border border-gold/30 bg-gold/5 px-2.5 py-0.5 text-xs text-gold">
                {s.category}
              </span>
            )}
            <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">{s.name}</h1>
            {s.provider && <p className="mt-1 text-muted-foreground">{s.provider}</p>}
          </div>
          {isAdmin && (
            <Button variant="ghost" size="sm" onClick={deleteScholarship} className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-6 text-sm">
          {s.amount != null && (
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Amount</p>
              <p className="mt-1 inline-flex items-center gap-1.5 font-display text-xl text-gold">
                <DollarSign className="h-5 w-5" />{Number(s.amount).toLocaleString()}
              </p>
            </div>
          )}
          {s.deadline && (
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Deadline</p>
              <p className="mt-1 inline-flex items-center gap-1.5 font-display text-xl">
                <Calendar className="h-5 w-5" />{new Date(s.deadline).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {s.description && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">About</h2>
            <p className="mt-2 whitespace-pre-line text-foreground/90">{s.description}</p>
          </div>
        )}
        {s.eligibility && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Eligibility</h2>
            <p className="mt-2 whitespace-pre-line text-foreground/90">{s.eligibility}</p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {s.apply_url && (
            <a href={s.apply_url} target="_blank" rel="noreferrer">
              <Button className="bg-gradient-gold text-primary-foreground">
                Apply <ExternalLink className="ml-1.5 h-4 w-4" />
              </Button>
            </a>
          )}
          <Button variant="outline" onClick={saveToTracker} disabled={saving}>
            <BookmarkPlus className="mr-1.5 h-4 w-4" /> {saving ? "Saving…" : "Save to my tracker"}
          </Button>
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-night">
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <Link to="/scholarships" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
            <ArrowLeft className="h-4 w-4" /> All scholarships
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
    </div>
  );
}
