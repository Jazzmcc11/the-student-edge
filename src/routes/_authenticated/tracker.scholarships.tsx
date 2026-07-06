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
import { Plus, Trash2, Trophy } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { TableSkeleton } from "@/components/skeletons";

export const Route = createFileRoute("/_authenticated/tracker/scholarships")({
  head: () => ({ meta: [{ title: "My scholarships — The Plug" }] }),
  component: () => <StudentOnly><ScholarshipTracker /></StudentOnly>,
});

type Row = {
  id: string;
  name: string;
  date_applied: string | null;
  received: boolean;
  amount: number | null;
  notes: string | null;
};

function ScholarshipTracker() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("scholarship_applications")
      .select("id, name, date_applied, received, amount, notes")
      .order("date_applied", { ascending: false, nullsFirst: false });
    if (error) toast.error(error.message);
    setRows((data as Row[]) || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function update(id: string, patch: Partial<Row>) {
    const { error } = await supabase.from("scholarship_applications").update(patch).eq("id", id);
    if (error) toast.error(error.message);
    else load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this entry?")) return;
    const { error } = await supabase.from("scholarship_applications").delete().eq("id", id);
    if (error) toast.error(error.message);
    else load();
  }

  const totalWon = rows.filter((r) => r.received).reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const pending = rows.filter((r) => !r.received).length;

  return (
    <div>
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Stat label="Applied" value={rows.length.toString()} />
        <Stat label="Pending" value={pending.toString()} />
        <Stat label="Won" value={`$${totalWon.toLocaleString()}`} highlight />
      </div>

      <div className="mb-4 flex justify-end">
        <AddDialog onAdded={load} />
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Start tracking your scholarship apps."
          description="Add one you’re working on, or browse the database and save scholarships straight into your tracker."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Scholarship</th>
                <th className="px-4 py-3">Date applied</th>
                <th className="px-4 py-3">Received</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.date_applied ? new Date(r.date_applied).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3">
                    <Checkbox checked={r.received} onCheckedChange={(v) => update(r.id, { received: !!v })} />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      defaultValue={r.amount ?? ""}
                      placeholder="—"
                      onBlur={(e) => {
                        const v = e.target.value ? Number(e.target.value) : null;
                        if (v !== r.amount) update(r.id, { amount: v });
                      }}
                      className="w-24 rounded-md border border-input bg-background px-2 py-1 text-sm"
                    />
                  </td>
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

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "border-gold/40 bg-gold/5" : "border-border bg-card"}`}>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 font-display text-2xl font-bold ${highlight ? "text-gold" : ""}`}>{value}</p>
    </div>
  );
}

function AddDialog({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", date_applied: "", received: false, amount: "", notes: "" });

  async function save() {
    if (!form.name.trim()) { toast.error("Name required"); return; }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const { error } = await supabase.from("scholarship_applications").insert({
      user_id: user.id,
      name: form.name,
      date_applied: form.date_applied || null,
      received: form.received,
      amount: form.amount ? Number(form.amount) : null,
      notes: form.notes || null,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Added");
    setOpen(false);
    setForm({ name: "", date_applied: "", received: false, amount: "", notes: "" });
    onAdded();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gradient-gold text-primary-foreground">
          <Plus className="mr-1.5 h-4 w-4" /> Add scholarship
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New scholarship application</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label className="text-xs">Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label className="text-xs">Date applied</Label>
              <Input type="date" value={form.date_applied} onChange={(e) => setForm({ ...form, date_applied: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Amount (if won)</Label>
              <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={form.received} onCheckedChange={(v) => setForm({ ...form, received: !!v })} />
            Already received
          </label>
          <div className="grid gap-1.5">
            <Label className="text-xs">Notes</Label>
            <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
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
