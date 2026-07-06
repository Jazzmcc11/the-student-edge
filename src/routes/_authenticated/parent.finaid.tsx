import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, PiggyBank, CheckCircle2, Circle, DollarSign, GraduationCap, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/parent/finaid")({
  head: () => ({ meta: [{ title: "Financial aid — Parent view" }] }),
  component: ParentFinaidPage,
});

type StudentLite = { id: string; full_name: string | null; display_name: string | null };
type FinaidTask = { id: string; title: string; category: string | null; done: boolean; due_date: string | null };
type AidAward = { id: string; college_name: string; total_cost: number | null; grants: number | null; scholarships: number | null; loans_subsidized: number | null; loans_unsubsidized: number | null; work_study: number | null; parent_plus: number | null };

function ParentFinaidPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentLite[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [tasks, setTasks] = useState<FinaidTask[]>([]);
  const [awards, setAwards] = useState<AidAward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: prof } = await supabase.from("profiles").select("user_type").eq("id", user.id).maybeSingle();
      if (prof?.user_type !== "parent") { toast.error("Parent-only area"); navigate({ to: "/dashboard" }); return; }
      const { data: links } = await supabase.from("parent_student_links").select("student_id").eq("parent_id", user.id);
      const ids = (links || []).map((l: any) => l.student_id);
      if (!ids.length) { setLoading(false); return; }
      const { data: profs } = await supabase.from("profiles").select("id, full_name, display_name").in("id", ids);
      setStudents((profs as StudentLite[]) || []);
      setActive(ids[0]);
      setLoading(false);
    })();
  }, [navigate]);

  useEffect(() => {
    if (!active) return;
    (async () => {
      const [{ data: t }, { data: a }] = await Promise.all([
        supabase.from("finaid_tasks").select("id, title, category, done, due_date").eq("user_id", active).order("due_date", { ascending: true, nullsFirst: false }),
        supabase.from("aid_awards").select("id, college_name, total_cost, grants, scholarships, loans_subsidized, loans_unsubsidized, work_study, parent_plus").eq("user_id", active),
      ]);
      setTasks((t as FinaidTask[]) || []);
      setAwards((a as AidAward[]) || []);
    })();
  }, [active]);

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <div className="min-h-screen bg-gradient-night">
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold"><ArrowLeft className="h-4 w-4" /> Dashboard</Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <p className="text-sm text-gold">Parent view</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">Paying for college, together</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Track FAFSA progress, see aid offers side-by-side, and know where you can jump in. FAFSA needs your info — this is your part.
          </p>
        </div>

        {loading ? <p className="text-muted-foreground">Loading…</p> : students.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gold/30 bg-card p-10 text-center">
            <PiggyBank className="mx-auto h-8 w-8 text-gold" />
            <h2 className="mt-4 font-display text-xl font-semibold">Link a student first</h2>
            <Link to="/family"><Button className="mt-6 bg-gold text-primary-foreground hover:bg-gold/90">Go to Family</Button></Link>
          </div>
        ) : (
          <>
            {students.length > 1 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {students.map((s) => (
                  <button key={s.id} onClick={() => setActive(s.id)}
                    className={`rounded-full px-4 py-2 text-sm transition ${active === s.id ? "border border-gold/40 bg-gold/15 text-gold" : "border border-border bg-card text-muted-foreground hover:text-gold"}`}>
                    <Users className="mr-1.5 inline h-3.5 w-3.5" /> {s.display_name || s.full_name || "Student"}
                  </button>
                ))}
              </div>
            )}

            <section className="mb-8 rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gold">FAFSA & CSS progress</p>
                  <h2 className="mt-1 font-display text-2xl font-bold">{doneCount} of {tasks.length || "—"} tasks done</h2>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Your student manages this list.</p>
                  <p className="text-xs text-muted-foreground">You can see it and step in.</p>
                </div>
              </div>
              {tasks.length > 0 && (
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-gradient-gold transition-all" style={{ width: `${(doneCount / tasks.length) * 100}%` }} />
                </div>
              )}
            </section>

            <section className="mb-8">
              <h3 className="mb-3 font-display text-xl font-semibold">Checklist</h3>
              {tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks logged yet. When they add FAFSA/CSS steps, they'll show up here.</p>
              ) : (
                <ul className="space-y-2">
                  {tasks.map((t) => (
                    <li key={t.id} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
                      {t.done ? <CheckCircle2 className="h-5 w-5 text-gold" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.title}</p>
                        {t.due_date && <p className="text-xs text-muted-foreground">Due {new Date(t.due_date).toLocaleDateString()}</p>}
                      </div>
                      {t.category && <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{t.category}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mb-8">
              <h3 className="mb-3 font-display text-xl font-semibold">Aid offers</h3>
              {awards.length === 0 ? (
                <p className="text-sm text-muted-foreground">Once aid letters start arriving, log them together to compare the real cost side-by-side.</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {awards.map((a) => {
                    const grants = Number(a.grants || 0) + Number(a.scholarships || 0);
                    const selfHelp = Number(a.loans_subsidized || 0) + Number(a.loans_unsubsidized || 0) + Number(a.work_study || 0);
                    const netCost = Number(a.total_cost || 0) - grants;
                    return (
                      <div key={a.id} className="rounded-2xl border border-border bg-card p-5">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-gold" />
                          <h4 className="font-display font-semibold">{a.college_name}</h4>
                        </div>
                        <div className="mt-4 space-y-1.5 text-sm">
                          <Row label="Cost of attendance" value={`$${Number(a.total_cost || 0).toLocaleString()}`} />
                          <Row label="Gift aid (grants + scholarships)" value={`-$${grants.toLocaleString()}`} accent />
                          <Row label="Loans + work-study" value={`$${selfHelp.toLocaleString()}`} muted />
                          {Number(a.parent_plus || 0) > 0 && <Row label="Parent PLUS (your debt)" value={`$${Number(a.parent_plus).toLocaleString()}`} warn />}
                          <div className="mt-3 border-t border-border pt-3">
                            <Row label="Net cost (your bill)" value={`$${netCost.toLocaleString()}`} big />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 text-gold">
                <DollarSign className="h-4 w-4" />
                <h3 className="font-display font-semibold">Parent quick-start</h3>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>• Create your <b className="text-foreground">FSA ID</b> at studentaid.gov (takes ~3 days to verify).</li>
                <li>• Pull your most recent <b className="text-foreground">federal tax return</b> and W-2s.</li>
                <li>• Note any <b className="text-foreground">income changes</b> since that return — you can appeal each school directly.</li>
              </ul>
              <a href="https://studentaid.gov/h/apply-for-aid/fafsa" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center text-sm text-gold hover:underline">
                Open FAFSA <ExternalLink className="ml-1 h-3.5 w-3.5" />
              </a>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function Row({ label, value, accent, muted, warn, big }: { label: string; value: string; accent?: boolean; muted?: boolean; warn?: boolean; big?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span className={`font-mono ${big ? "font-display text-lg font-bold text-gold" : ""} ${accent ? "text-gold" : ""} ${warn ? "text-destructive" : ""}`}>{value}</span>
    </div>
  );
}
