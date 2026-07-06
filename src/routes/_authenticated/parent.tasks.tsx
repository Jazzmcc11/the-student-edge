import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, ListChecks, Calendar } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/parent/tasks")({
  head: () => ({ meta: [{ title: "My parent to-dos — The Plug" }] }),
  component: ParentTasksPage,
});

type StudentLite = { id: string; full_name: string | null; display_name: string | null };
type Task = { id: string; title: string; notes: string | null; category: string; due_date: string | null; done: boolean; student_id: string | null };

const CATEGORIES = ["general", "finances", "logistics", "grad party", "college visits", "self-care"];

const STARTERS = [
  { title: "Create my FSA ID at studentaid.gov", category: "finances" },
  { title: "Pull last year's federal tax return + W-2s", category: "finances" },
  { title: "Order graduation announcements", category: "grad party" },
  { title: "Book grad party venue / order pizza", category: "grad party" },
  { title: "Plan a college visit weekend", category: "college visits" },
  { title: "Ask about parent orientation dates", category: "logistics" },
  { title: "Schedule a real dinner with your senior", category: "self-care" },
];

function ParentTasksPage() {
  const navigate = useNavigate();
  const [me, setMe] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentLite[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [studentId, setStudentId] = useState<string>("none");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: prof } = await supabase.from("profiles").select("user_type").eq("id", user.id).maybeSingle();
      if (prof?.user_type !== "parent") { toast.error("Parent-only area"); navigate({ to: "/dashboard" }); return; }
      setMe(user.id);
      const { data: links } = await supabase.from("parent_student_links").select("student_id").eq("parent_id", user.id);
      const ids = (links || []).map((l: any) => l.student_id);
      if (ids.length) {
        const { data: profs } = await supabase.from("profiles").select("id, full_name, display_name").in("id", ids);
        setStudents((profs as StudentLite[]) || []);
      }
      await load(user.id);
      setLoading(false);
    })();
  }, [navigate]);

  async function load(parentId: string) {
    const { data } = await supabase.from("parent_tasks").select("*").eq("parent_id", parentId).order("done", { ascending: true }).order("due_date", { ascending: true, nullsFirst: false }).order("created_at", { ascending: false });
    setTasks((data as Task[]) || []);
  }

  async function add(t?: { title: string; category: string }) {
    if (!me) return;
    const payload = {
      parent_id: me,
      title: t?.title || title.trim(),
      category: t?.category || category,
      student_id: studentId === "none" ? null : studentId,
      due_date: dueDate || null,
    };
    if (!payload.title) return;
    const { error } = await supabase.from("parent_tasks").insert(payload);
    if (error) return toast.error(error.message);
    if (!t) { setTitle(""); setDueDate(""); }
    load(me);
  }

  async function toggle(task: Task) {
    if (!me) return;
    const { error } = await supabase.from("parent_tasks").update({ done: !task.done }).eq("id", task.id);
    if (error) return toast.error(error.message);
    load(me);
  }

  async function del(id: string) {
    if (!me) return;
    await supabase.from("parent_tasks").delete().eq("id", id);
    load(me);
  }

  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);
  const studentName = (id: string | null) => students.find((s) => s.id === id)?.display_name || students.find((s) => s.id === id)?.full_name;

  return (
    <div className="min-h-screen bg-gradient-night">
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold"><ArrowLeft className="h-4 w-4" /> Dashboard</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <p className="text-sm text-gold">Your side of the list</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">Your parent to-dos</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            The stuff only you can do — the parent forms, the venue booking, the appointments. Keep it here so it doesn't live in your head.
          </p>
        </div>

        <section className="mb-8 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Add a to-do</h2>
          <div className="space-y-3">
            <Input placeholder="What needs doing?" value={title} onChange={(e) => setTitle(e.target.value)} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              {students.length > 0 && (
                <Select value={studentId} onValueChange={setStudentId}>
                  <SelectTrigger><SelectValue placeholder="For…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Just for me</SelectItem>
                    {students.map((s) => <SelectItem key={s.id} value={s.id}>{s.display_name || s.full_name || "Student"}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <Button onClick={() => add()} disabled={!title.trim()} className="w-full bg-gradient-gold text-primary-foreground shadow-gold">
              <Plus className="mr-1.5 h-4 w-4" /> Add
            </Button>
          </div>
        </section>

        {loading ? <p className="text-muted-foreground">Loading…</p> : (
          <>
            {tasks.length === 0 && (
              <section className="mb-8">
                <h2 className="mb-3 font-display text-lg font-semibold">Common starter to-dos</h2>
                <ul className="space-y-2">
                  {STARTERS.map((t) => (
                    <li key={t.title}>
                      <button onClick={() => add(t)} className="flex w-full items-center justify-between rounded-lg border border-dashed border-border bg-card/50 px-4 py-3 text-left text-sm transition hover:border-gold/40">
                        <span>{t.title}</span>
                        <span className="flex items-center gap-2 text-xs text-muted-foreground"><span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider">{t.category}</span><Plus className="h-3.5 w-3.5" /></span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="mb-8">
              <div className="mb-3 flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-gold" />
                <h2 className="font-display text-lg font-semibold">Open ({open.length})</h2>
              </div>
              {open.length === 0 ? (
                <p className="text-sm text-muted-foreground">Clean slate. That's a good place to be.</p>
              ) : (
                <ul className="space-y-2">
                  {open.map((t) => (
                    <li key={t.id} className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3">
                      <input type="checkbox" checked={t.done} onChange={() => toggle(t)} className="mt-1 h-4 w-4 accent-gold" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm">{t.title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="rounded-full border border-border bg-secondary px-2 py-0.5 uppercase tracking-wider">{t.category}</span>
                          {studentName(t.student_id) && <span>· For {studentName(t.student_id)}</span>}
                          {t.due_date && <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(t.due_date).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <button onClick={() => del(t.id)} className="text-muted-foreground hover:text-destructive" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {done.length > 0 && (
              <section>
                <h2 className="mb-3 font-display text-lg font-semibold text-muted-foreground">Done ({done.length})</h2>
                <ul className="space-y-2">
                  {done.map((t) => (
                    <li key={t.id} className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 px-4 py-2.5 text-sm text-muted-foreground">
                      <input type="checkbox" checked onChange={() => toggle(t)} className="h-4 w-4 accent-gold" />
                      <span className="flex-1 line-through">{t.title}</span>
                      <button onClick={() => del(t.id)} aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
