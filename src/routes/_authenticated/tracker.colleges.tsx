import { createFileRoute } from "@tanstack/react-router";
import { StudentOnly } from "@/components/student-only";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Plus, Trash2, Check, X, GraduationCap, ChevronDown, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { TableSkeleton } from "@/components/skeletons";

export const Route = createFileRoute("/_authenticated/tracker/colleges")({
  head: () => ({ meta: [{ title: "My colleges — The Plug" }] }),
  component: CollegesTracker,
});

type Row = {
  id: string;
  college_name: string;
  submitted: boolean;
  accepted: boolean | null;
  notes: string | null;
  common_app_submitted: boolean;
  supplements_submitted: boolean;
  recs_submitted: boolean;
  transcript_sent: boolean;
  scores_sent: boolean;
  deadline_type: string | null;
  deadline_date: string | null;
  essay_draft: string | null;
};

const COMMON_APP_EXPLORE = (name: string) =>
  `https://www.commonapp.org/explore?search=${encodeURIComponent(name)}`;

function CollegesTracker() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("college_applications")
      .select("*")
      .order("deadline_date", { ascending: true, nullsFirst: false });
    if (error) toast.error(error.message);
    setRows((data as Row[]) || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function update(id: string, patch: Partial<Row>) {
    const { error } = await supabase.from("college_applications").update(patch).eq("id", id);
    if (error) toast.error(error.message);
    else setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  async function remove(id: string) {
    if (!confirm("Delete this college?")) return;
    const { error } = await supabase.from("college_applications").delete().eq("id", id);
    if (error) toast.error(error.message);
    else load();
  }

  const submitted = rows.filter((r) => r.submitted || r.common_app_submitted).length;
  const accepted = rows.filter((r) => r.accepted === true).length;

  return (
    <div>
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Stat label="Total" value={rows.length} />
        <Stat label="Submitted" value={submitted} />
        <Stat label="Accepted" value={accepted} />
      </div>

      <div className="mb-4 flex justify-end">
        <AddCollegeDialog onAdded={load} />
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : rows.length === 0 ? (
        <Empty />
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <CollegeCard key={r.id} row={r} onUpdate={update} onRemove={remove} />
          ))}
        </div>
      )}
    </div>
  );
}

function CollegeCard({
  row: r,
  onUpdate,
  onRemove,
}: {
  row: Row;
  onUpdate: (id: string, patch: Partial<Row>) => void;
  onRemove: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [essay, setEssay] = useState(r.essay_draft ?? "");
  const items: Array<[keyof Row, string]> = [
    ["common_app_submitted", "Common App"],
    ["supplements_submitted", "Supplements"],
    ["recs_submitted", "Rec letters"],
    ["transcript_sent", "Transcript"],
    ["scores_sent", "Test scores"],
  ];
  const done = items.filter(([k]) => r[k]).length;
  const total = items.length;

  const daysLeft = r.deadline_date
    ? Math.ceil((new Date(r.deadline_date).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-center gap-3 p-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-semibold truncate">{r.college_name}</h3>
            {r.accepted === true && <span className="rounded-full bg-gold/20 px-2 py-0.5 text-xs text-gold">Accepted</span>}
            {r.accepted === false && <span className="rounded-full bg-destructive/20 px-2 py-0.5 text-xs text-destructive">Not this time</span>}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{done}/{total} checklist</span>
            {r.deadline_type && <span>· {r.deadline_type}</span>}
            {r.deadline_date && (
              <span>· due {new Date(r.deadline_date).toLocaleDateString()}
                {daysLeft != null && daysLeft >= 0 && ` (${daysLeft}d left)`}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <a
            href={COMMON_APP_EXPLORE(r.college_name)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-gold/40 bg-gold/5 px-2.5 py-1 text-xs text-gold hover:bg-gold/10"
          >
            Common App <ExternalLink className="h-3 w-3" />
          </a>
          <button
            onClick={() => onUpdate(r.id, { accepted: r.accepted === true ? null : true })}
            className={`rounded-md p-1.5 ${r.accepted === true ? "bg-gold/20 text-gold" : "text-muted-foreground hover:bg-secondary"}`}
            title="Mark accepted"
          ><Check className="h-4 w-4" /></button>
          <button
            onClick={() => onUpdate(r.id, { accepted: r.accepted === false ? null : false })}
            className={`rounded-md p-1.5 ${r.accepted === false ? "bg-destructive/20 text-destructive" : "text-muted-foreground hover:bg-secondary"}`}
            title="Mark denied"
          ><X className="h-4 w-4" /></button>
          <button
            onClick={() => onRemove(r.id)}
            className="rounded-md p-1.5 text-muted-foreground hover:text-destructive"
            title="Delete"
          ><Trash2 className="h-4 w-4" /></button>
          <CollapsibleTrigger asChild>
            <button className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary">
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
          </CollapsibleTrigger>
        </div>
      </div>

      <CollapsibleContent>
        <div className="space-y-4 border-t border-border/50 p-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Application checklist</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {items.map(([key, label]) => (
                <label key={key as string} className="flex items-center gap-2 rounded-md border border-border/60 bg-background/50 p-2 text-sm">
                  <Checkbox
                    checked={!!r[key]}
                    onCheckedChange={(v) => onUpdate(r.id, { [key]: !!v } as Partial<Row>)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label className="text-xs">Deadline type</Label>
              <select
                value={r.deadline_type ?? ""}
                onChange={(e) => onUpdate(r.id, { deadline_type: e.target.value || null })}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">—</option>
                <option>Early Decision</option>
                <option>Early Decision II</option>
                <option>Early Action</option>
                <option>Restrictive EA</option>
                <option>Regular Decision</option>
                <option>Rolling</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Deadline date</Label>
              <Input
                type="date"
                value={r.deadline_date ?? ""}
                onChange={(e) => onUpdate(r.id, { deadline_date: e.target.value || null })}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Supplemental essay draft</Label>
              <span className="text-[10px] text-muted-foreground">{essay.trim() ? essay.trim().split(/\s+/).length : 0} words</span>
            </div>
            <Textarea
              rows={6}
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              onBlur={() => essay !== (r.essay_draft ?? "") && onUpdate(r.id, { essay_draft: essay })}
              placeholder="Draft your 'Why us?' or supplemental prompt here…"
            />
          </div>

          <div className="grid gap-1.5">
            <Label className="text-xs">Notes</Label>
            <Textarea
              rows={2}
              defaultValue={r.notes ?? ""}
              onBlur={(e) => e.target.value !== (r.notes ?? "") && onUpdate(r.id, { notes: e.target.value || null })}
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
    </div>
  );
}

function Empty() {
  return (
    <EmptyState
      icon={GraduationCap}
      title="Build your college list."
      description="Add the colleges you're applying to. Track Common App status, essays, deadlines, and decisions."
    />
  );
}

function AddCollegeDialog({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ college_name: "", deadline_type: "", deadline_date: "", notes: "" });
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form.college_name.trim()) { toast.error("Name required"); return; }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const { error } = await supabase.from("college_applications").insert({
      user_id: user.id,
      college_name: form.college_name,
      deadline_type: form.deadline_type || null,
      deadline_date: form.deadline_date || null,
      notes: form.notes || null,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Added");
    setOpen(false);
    setForm({ college_name: "", deadline_type: "", deadline_date: "", notes: "" });
    onAdded();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gradient-gold text-primary-foreground">
          <Plus className="mr-1.5 h-4 w-4" /> Add college
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New college application</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label className="text-xs">College name *</Label>
            <Input value={form.college_name} onChange={(e) => setForm({ ...form, college_name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label className="text-xs">Deadline type</Label>
              <select
                value={form.deadline_type}
                onChange={(e) => setForm({ ...form, deadline_type: e.target.value })}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">—</option>
                <option>Early Decision</option>
                <option>Early Decision II</option>
                <option>Early Action</option>
                <option>Restrictive EA</option>
                <option>Regular Decision</option>
                <option>Rolling</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Deadline date</Label>
              <Input type="date" value={form.deadline_date} onChange={(e) => setForm({ ...form, deadline_date: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Notes</Label>
            <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-gradient-gold text-primary-foreground">
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
