import { createFileRoute } from "@tanstack/react-router";
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
import { Plus, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";

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
};

function CollegesTracker() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("college_applications")
      .select("id, college_name, submitted, accepted, notes")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as Row[]) || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function update(id: string, patch: Partial<Row>) {
    const { error } = await supabase.from("college_applications").update(patch).eq("id", id);
    if (error) toast.error(error.message);
    else load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this college?")) return;
    const { error } = await supabase.from("college_applications").delete().eq("id", id);
    if (error) toast.error(error.message);
    else load();
  }

  const accepted = rows.filter((r) => r.accepted === true).length;
  const submitted = rows.filter((r) => r.submitted).length;

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
        <p className="text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <Empty />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">College</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Accepted?</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3 font-medium">{r.college_name}</td>
                  <td className="px-4 py-3">
                    <Checkbox checked={r.submitted} onCheckedChange={(v) => update(r.id, { submitted: !!v })} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => update(r.id, { accepted: r.accepted === true ? null : true })}
                        className={`rounded-md p-1 ${r.accepted === true ? "bg-gold/20 text-gold" : "text-muted-foreground hover:bg-secondary"}`}
                      ><Check className="h-4 w-4" /></button>
                      <button
                        onClick={() => update(r.id, { accepted: r.accepted === false ? null : false })}
                        className={`rounded-md p-1 ${r.accepted === false ? "bg-destructive/20 text-destructive" : "text-muted-foreground hover:bg-secondary"}`}
                      ><X className="h-4 w-4" /></button>
                    </div>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">{r.notes}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remove(r.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
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
    <div className="rounded-xl border border-border bg-card p-10 text-center">
      <p className="text-muted-foreground">No colleges yet. Add your first one.</p>
    </div>
  );
}

function AddCollegeDialog({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ college_name: "", submitted: false, notes: "" });
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form.college_name.trim()) { toast.error("Name required"); return; }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const { error } = await supabase.from("college_applications").insert({
      user_id: user.id,
      college_name: form.college_name,
      submitted: form.submitted,
      notes: form.notes || null,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Added");
    setOpen(false);
    setForm({ college_name: "", submitted: false, notes: "" });
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
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={form.submitted} onCheckedChange={(v) => setForm({ ...form, submitted: !!v })} />
            Already submitted
          </label>
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
