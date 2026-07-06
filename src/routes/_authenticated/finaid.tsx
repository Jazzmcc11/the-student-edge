import { createFileRoute, Link } from "@tanstack/react-router";
import { StudentOnly } from "@/components/student-only";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft, DollarSign, ExternalLink, Plus, Trash2, PiggyBank, ClipboardCheck, Scale,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/finaid")({
  head: () => ({
    meta: [
      { title: "Financial Aid — The Plug" },
      { name: "description", content: "FAFSA checklist, CSS Profile tracker, and side-by-side aid award comparison." },
    ],
  }),
  component: FinAidPage,
});

const FAFSA_TASKS = [
  { key: "fsa_id_student", cat: "Before filing", label: "Create your FSA ID (studentaid.gov)" },
  { key: "fsa_id_parent", cat: "Before filing", label: "Parent creates their FSA ID" },
  { key: "ssn", cat: "Before filing", label: "Have your Social Security number ready" },
  { key: "tax_returns", cat: "Before filing", label: "Gather most recent tax returns (yours + parents)" },
  { key: "w2", cat: "Before filing", label: "W-2s and untaxed income records" },
  { key: "bank_records", cat: "Before filing", label: "Bank statements and investment records" },
  { key: "school_list", cat: "Before filing", label: "List of colleges to send FAFSA to (up to 20)" },
  { key: "fafsa_submitted", cat: "Filing", label: "Submit the FAFSA" },
  { key: "fafsa_signed", cat: "Filing", label: "Both student and parent signed FAFSA" },
  { key: "sar_review", cat: "After filing", label: "Review the Student Aid Report (SAR) for errors" },
  { key: "corrections", cat: "After filing", label: "Make any corrections needed" },
  { key: "verification", cat: "After filing", label: "Respond to verification requests from colleges (if asked)" },
];

const CSS_TASKS = [
  { key: "css_account", cat: "CSS Profile", label: "Create College Board account" },
  { key: "css_parent_records", cat: "CSS Profile", label: "Gather parent income + assets (both households if divorced)" },
  { key: "css_submit", cat: "CSS Profile", label: "Submit CSS Profile" },
  { key: "css_idoc", cat: "CSS Profile", label: "Upload required docs to IDOC (if requested)" },
];

const ALL_TASKS = [...FAFSA_TASKS, ...CSS_TASKS];

type TaskState = { task_key: string; completed: boolean };

type Award = {
  id: string;
  college_name: string;
  cost_of_attendance: number | null;
  grants: number;
  scholarships_amt: number;
  loans: number;
  work_study: number;
  family_contribution: number | null;
  notes: string | null;
};

function FinAidPage() {
  const [tasks, setTasks] = useState<Record<string, boolean>>({});
  const [awards, setAwards] = useState<Award[]>([]);
  const [showAward, setShowAward] = useState<Award | null>(null);
  const [showNewAward, setShowNewAward] = useState(false);

  async function load() {
    const [{ data: t }, { data: a }] = await Promise.all([
      supabase.from("finaid_tasks").select("task_key, completed"),
      supabase.from("aid_awards").select("*").order("college_name"),
    ]);
    const map: Record<string, boolean> = {};
    ((t as TaskState[]) || []).forEach((r) => { map[r.task_key] = r.completed; });
    setTasks(map);
    setAwards((a as Award[]) || []);
  }
  useEffect(() => { load(); }, []);

  async function toggle(key: string, category: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const next = !tasks[key];
    setTasks({ ...tasks, [key]: next });
    const { error } = await supabase
      .from("finaid_tasks")
      .upsert({
        user_id: user.id,
        task_key: key,
        category,
        completed: next,
        completed_at: next ? new Date().toISOString() : null,
      }, { onConflict: "user_id,task_key" });
    if (error) toast.error(error.message);
    if (next) toast.success("Nice — one less thing", { duration: 1500 });
  }

  async function saveAward(a: Partial<Award> & { id?: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const payload = {
      user_id: user.id,
      college_name: a.college_name!,
      cost_of_attendance: a.cost_of_attendance || null,
      grants: a.grants || 0,
      scholarships_amt: a.scholarships_amt || 0,
      loans: a.loans || 0,
      work_study: a.work_study || 0,
      family_contribution: a.family_contribution || null,
      notes: a.notes || null,
    };
    if (a.id) {
      const { error } = await supabase.from("aid_awards").update(payload).eq("id", a.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("aid_awards").insert(payload);
      if (error) return toast.error(error.message);
    }
    setShowAward(null); setShowNewAward(false); load();
  }

  async function delAward(id: string) {
    if (!confirm("Delete this award?")) return;
    await supabase.from("aid_awards").delete().eq("id", id);
    load();
  }

  const fafsaDone = FAFSA_TASKS.filter(t => tasks[t.key]).length;
  const cssDone = CSS_TASKS.filter(t => tasks[t.key]).length;

  return (
    <div className="min-h-screen bg-gradient-night">
      <header className="border-b border-border/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="flex items-center gap-2 text-sm text-gold">
            <PiggyBank className="h-4 w-4" /> Financial Aid
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Paying for it</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            FAFSA, CSS Profile, and figuring out which award is actually the best deal. One step at a time.
          </p>
        </div>

        <Tabs defaultValue="fafsa" className="space-y-6">
          <TabsList>
            <TabsTrigger value="fafsa"><ClipboardCheck className="mr-2 h-4 w-4" /> FAFSA</TabsTrigger>
            <TabsTrigger value="css"><ClipboardCheck className="mr-2 h-4 w-4" /> CSS Profile</TabsTrigger>
            <TabsTrigger value="compare"><Scale className="mr-2 h-4 w-4" /> Compare offers</TabsTrigger>
            <TabsTrigger value="resources"><ExternalLink className="mr-2 h-4 w-4" /> Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="fafsa" className="space-y-4">
            <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gold">FAFSA progress</p>
                  <h3 className="font-display text-2xl font-bold">{fafsaDone} of {FAFSA_TASKS.length} done</h3>
                </div>
                <a href="https://studentaid.gov/h/apply-for-aid/fafsa" target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline"><ExternalLink className="mr-1.5 h-3 w-3" /> studentaid.gov</Button>
                </a>
              </div>
              <Progress value={(fafsaDone / FAFSA_TASKS.length) * 100} />
            </div>
            {groupBy(FAFSA_TASKS).map(([cat, list]) => (
              <TaskGroup key={cat} title={cat} tasks={list} state={tasks} onToggle={toggle} />
            ))}
          </TabsContent>

          <TabsContent value="css" className="space-y-4">
            <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gold">CSS Profile progress</p>
                  <h3 className="font-display text-2xl font-bold">{cssDone} of {CSS_TASKS.length} done</h3>
                </div>
                <a href="https://cssprofile.collegeboard.org" target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline"><ExternalLink className="mr-1.5 h-3 w-3" /> collegeboard.org</Button>
                </a>
              </div>
              <Progress value={(cssDone / CSS_TASKS.length) * 100} />
            </div>
            <TaskGroup title="CSS Profile" tasks={CSS_TASKS} state={tasks} onToggle={toggle} />
            <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
              <strong className="text-foreground">Heads up:</strong> Not every college needs the CSS Profile. Check your college's aid page — usually private schools and Ivies do.
            </div>
          </TabsContent>

          <TabsContent value="compare" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold">Award comparison</h3>
                <p className="text-sm text-muted-foreground">Add each offer as it arrives. See what's actually a scholarship vs. debt in disguise.</p>
              </div>
              <Button onClick={() => setShowNewAward(true)} className="bg-gold text-primary-foreground hover:bg-gold/90">
                <Plus className="mr-2 h-4 w-4" /> Add offer
              </Button>
            </div>

            {awards.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gold/30 bg-card p-12 text-center">
                <DollarSign className="mx-auto h-10 w-10 text-gold" />
                <h2 className="mt-4 font-display text-2xl font-bold">No offers yet</h2>
                <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                  Once colleges send financial aid letters, drop the numbers in here to see them side by side.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {awards.map((a) => <AwardCard key={a.id} award={a} onEdit={() => setShowAward(a)} onDelete={() => delAward(a.id)} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="resources" className="space-y-3">
            <ResourceLink title="Federal Student Aid — official FAFSA hub" href="https://studentaid.gov" desc="File, check status, and manage federal aid." />
            <ResourceLink title="CSS Profile (College Board)" href="https://cssprofile.collegeboard.org" desc="Institutional aid for many private colleges." />
            <ResourceLink title="Net Price Calculators" href="https://collegecost.ed.gov/net-price" desc="Every college's estimated real cost — required by law." />
            <ResourceLink title="FSA ID setup" href="https://studentaid.gov/fsa-id/create-account/launch" desc="Create your FSA ID (both you and a parent need one)." />
            <ResourceLink title="State aid deadlines" href="https://studentaid.gov/apply-for-aid/fafsa/fafsa-deadlines" desc="Your state might have earlier deadlines than the federal one." />
            <ResourceLink title="Scholarship search" href="/scholarships" desc="Free money is free money. Search the Plug database." internal />
          </TabsContent>
        </Tabs>
      </main>

      {(showAward || showNewAward) && (
        <AwardDialog
          initial={showAward || undefined}
          onClose={() => { setShowAward(null); setShowNewAward(false); }}
          onSave={saveAward}
        />
      )}
    </div>
  );
}

function groupBy(list: typeof FAFSA_TASKS): [string, typeof FAFSA_TASKS][] {
  const map = new Map<string, typeof FAFSA_TASKS>();
  for (const t of list) {
    if (!map.has(t.cat)) map.set(t.cat, []);
    map.get(t.cat)!.push(t);
  }
  return Array.from(map.entries());
}

function TaskGroup({ title, tasks, state, onToggle }: {
  title: string;
  tasks: typeof FAFSA_TASKS;
  state: Record<string, boolean>;
  onToggle: (key: string, cat: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-3 font-display text-lg font-semibold">{title}</h3>
      <div className="space-y-2">
        {tasks.map((t) => (
          <label key={t.key} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-secondary/40">
            <Checkbox checked={!!state[t.key]} onCheckedChange={() => onToggle(t.key, title.toLowerCase().replace(/\s+/g, "_"))} />
            <span className={`text-sm ${state[t.key] ? "text-muted-foreground line-through" : ""}`}>{t.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function AwardCard({ award, onEdit, onDelete }: { award: Award; onEdit: () => void; onDelete: () => void }) {
  const gift = (award.grants || 0) + (award.scholarships_amt || 0);
  const selfHelp = (award.loans || 0) + (award.work_study || 0);
  const total = gift + selfHelp;
  const net = award.cost_of_attendance ? (award.cost_of_attendance - gift) : null;
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <h3 className="font-display text-lg font-semibold">{award.college_name}</h3>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={onEdit}>Edit</Button>
          <Button size="sm" variant="ghost" onClick={onDelete} className="text-destructive"><Trash2 className="h-3 w-3" /></Button>
        </div>
      </div>
      <div className="mt-3 space-y-1.5 text-sm">
        <Row label="Cost of attendance" v={award.cost_of_attendance} muted />
        <Row label="Grants" v={award.grants} tone="text-emerald-400" />
        <Row label="Scholarships" v={award.scholarships_amt} tone="text-emerald-400" />
        <Row label="Loans" v={award.loans} tone="text-red-400" />
        <Row label="Work-study" v={award.work_study} tone="text-amber-400" />
        <div className="mt-2 border-t border-border/50 pt-2">
          <Row label="Gift aid (free money)" v={gift} tone="text-gold" bold />
          <Row label="Self-help (loans + work)" v={selfHelp} muted />
          <Row label="Total package" v={total} />
          {net !== null && <Row label="Net you owe" v={net} bold tone={net > 20000 ? "text-red-400" : "text-emerald-400"} />}
        </div>
      </div>
      {award.notes && <p className="mt-3 rounded-lg bg-secondary/40 p-2 text-xs text-muted-foreground">{award.notes}</p>}
    </div>
  );
}

function Row({ label, v, tone, bold, muted }: { label: string; v: number | null; tone?: string; bold?: boolean; muted?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span className={`${tone || ""} ${bold ? "font-semibold" : ""}`}>
        {v === null || v === undefined ? "—" : `$${Number(v).toLocaleString()}`}
      </span>
    </div>
  );
}

function AwardDialog({ initial, onClose, onSave }: { initial?: Award; onClose: () => void; onSave: (a: Partial<Award> & { id?: string }) => void }) {
  const [form, setForm] = useState<Partial<Award>>(initial || {});
  useEffect(() => { setForm(initial || {}); }, [initial]);
  const set = (k: keyof Award, v: any) => setForm({ ...form, [k]: v });
  const num = (v: string) => (v === "" ? null : Number(v));
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit offer" : "New offer"}</DialogTitle>
          <DialogDescription>Pull the numbers straight off your award letter.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="College name" value={form.college_name || ""} onChange={(e) => set("college_name", e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <NumField label="Cost of attendance" v={form.cost_of_attendance} onChange={(v) => set("cost_of_attendance", num(v))} />
            <NumField label="Family contribution (SAI)" v={form.family_contribution} onChange={(v) => set("family_contribution", num(v))} />
            <NumField label="Grants" v={form.grants} onChange={(v) => set("grants", num(v) ?? 0)} />
            <NumField label="Scholarships" v={form.scholarships_amt} onChange={(v) => set("scholarships_amt", num(v) ?? 0)} />
            <NumField label="Loans" v={form.loans} onChange={(v) => set("loans", num(v) ?? 0)} />
            <NumField label="Work-study" v={form.work_study} onChange={(v) => set("work_study", num(v) ?? 0)} />
          </div>
          <Textarea placeholder="Notes — merit vs need, renewable?, conditions…" value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} rows={2} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button className="bg-gold text-primary-foreground hover:bg-gold/90" disabled={!form.college_name} onClick={() => onSave({ ...form, id: initial?.id })}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NumField({ label, v, onChange }: { label: string; v: number | null | undefined; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <Input inputMode="numeric" value={v ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="$" />
    </div>
  );
}

function ResourceLink({ title, href, desc, internal }: { title: string; href: string; desc: string; internal?: boolean }) {
  const inner = (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition hover:border-gold/40">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <ExternalLink className="h-4 w-4 text-gold" />
    </div>
  );
  return internal ? <Link to={href}>{inner}</Link> : <a href={href} target="_blank" rel="noreferrer">{inner}</a>;
}
