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
type TaskRow = { task_key: string; completed: boolean };
type AidAward = {
  id: string; college_name: string;
  cost_of_attendance: number | null; grants: number | null; scholarships_amt: number | null;
  loans: number | null; work_study: number | null; family_contribution: number | null;
};

const FAFSA_TASKS = [
  { key: "fsa_id_student", cat: "Before filing", label: "Create your FSA ID (studentaid.gov)" },
  { key: "fsa_id_parent", cat: "Before filing", label: "Parent creates their FSA ID" },
  { key: "ssn", cat: "Before filing", label: "Have your Social Security number ready" },
  { key: "tax_returns", cat: "Before filing", label: "Gather most recent tax returns (yours + parents)" },
  { key: "w2", cat: "Before filing", label: "W-2s and untaxed income records" },
  { key: "bank_records", cat: "Before filing", label: "Bank statements and investment records" },
  { key: "school_list", cat: "Before filing", label: "List of colleges to send FAFSA to" },
  { key: "fafsa_submitted", cat: "Filing", label: "Submit the FAFSA" },
  { key: "fafsa_signed", cat: "Filing", label: "Both student and parent signed FAFSA" },
  { key: "sar_review", cat: "After filing", label: "Review the Student Aid Report" },
  { key: "corrections", cat: "After filing", label: "Make any corrections needed" },
  { key: "verification", cat: "After filing", label: "Respond to verification requests" },
];
const CSS_TASKS = [
  { key: "css_account", cat: "CSS Profile", label: "Create College Board account" },
  { key: "css_parent_records", cat: "CSS Profile", label: "Gather parent income + assets" },
  { key: "css_submit", cat: "CSS Profile", label: "Submit CSS Profile" },
  { key: "css_idoc", cat: "CSS Profile", label: "Upload required docs to IDOC" },
];
const ALL_TASKS = [...FAFSA_TASKS, ...CSS_TASKS];
const TASK_LABEL = Object.fromEntries(ALL_TASKS.map((t) => [t.key, t.label]));

function ParentFinaidPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentLite[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
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
        supabase.from("finaid_tasks").select("task_key, completed").eq("user_id", active),
        supabase.from("aid_awards").select("id, college_name, cost_of_attendance, grants, scholarships_amt, loans, work_study, family_contribution").eq("user_id", active).order("college_name"),
      ]);
      setTasks((t as TaskRow[]) || []);
      setAwards((a as AidAward[]) || []);
    })();
  }, [active]);

  const completedMap = new Map(tasks.map((t) => [t.task_key, t.completed]));
  const doneCount = ALL_TASKS.filter((t) => completedMap.get(t.key)).length;
  const pct = Math.round((doneCount / ALL_TASKS.length) * 100);

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
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gold">FAFSA & CSS progress</p>
                  <h2 className="mt-1 font-display text-2xl font-bold">{doneCount} of {ALL_TASKS.length} done</h2>
                </div>
                <p className="text-right text-xs text-muted-foreground">Your student manages this list.<br/>You can see it and step in.</p>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-gradient-gold transition-all" style={{ width: `${pct}%` }} />
              </div>
            </section>

            <section className="mb-8">
              <h3 className="mb-3 font-display text-xl font-semibold">Checklist</h3>
              <ul className="space-y-2">
                {ALL_TASKS.map((t) => {
                  const done = completedMap.get(t.key);
                  return (
                    <li key={t.key} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
                      {done ? <CheckCircle2 className="h-5 w-5 text-gold" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                      <p className={`flex-1 text-sm ${done ? "line-through text-muted-foreground" : ""}`}>{TASK_LABEL[t.key]}</p>
                      <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{t.cat}</span>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="mb-3 font-display text-xl font-semibold">Aid offers</h3>
              {awards.length === 0 ? (
                <p className="text-sm text-muted-foreground">Once aid letters start arriving, log them together to compare the real cost side-by-side.</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {awards.map((a) => {
                    const gift = Number(a.grants || 0) + Number(a.scholarships_amt || 0);
                    const selfHelp = Number(a.loans || 0) + Number(a.work_study || 0);
                    const net = a.cost_of_attendance ? Number(a.cost_of_attendance) - gift : null;
                    return (
                      <div key={a.id} className="rounded-2xl border border-border bg-card p-5">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-gold" />
                          <h4 className="font-display font-semibold">{a.college_name}</h4>
                        </div>
                        <div className="mt-4 space-y-1.5 text-sm">
                          <Row label="Cost of attendance" value={a.cost_of_attendance != null ? `$${Number(a.cost_of_attendance).toLocaleString()}` : "—"} muted />
                          <Row label="Grants" value={`$${Number(a.grants || 0).toLocaleString()}`} accent />
                          <Row label="Scholarships" value={`$${Number(a.scholarships_amt || 0).toLocaleString()}`} accent />
                          <Row label="Loans + work-study" value={`$${selfHelp.toLocaleString()}`} muted />
                          {a.family_contribution != null && <Row label="Expected family contribution" value={`$${Number(a.family_contribution).toLocaleString()}`} />}
                          <div className="mt-3 border-t border-border pt-3">
                            <Row label="Net cost (your bill)" value={net != null ? `$${net.toLocaleString()}` : "—"} big />
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

function Row({ label, value, accent, muted, big }: { label: string; value: string; accent?: boolean; muted?: boolean; big?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span className={`font-mono ${big ? "font-display text-lg font-bold text-gold" : ""} ${accent ? "text-gold" : ""}`}>{value}</span>
    </div>
  );
}
