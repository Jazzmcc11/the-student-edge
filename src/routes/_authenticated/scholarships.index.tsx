import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { ArrowLeft, Calendar, DollarSign, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useIsAdmin } from "@/hooks/use-admin";

export const Route = createFileRoute("/_authenticated/scholarships/")({
  head: () => ({ meta: [{ title: "Scholarships — The Plug" }] }),
  component: () => <ScholarshipsList />,
});

type Scholarship = {
  id: string;
  name: string;
  provider: string | null;
  amount: number | null;
  deadline: string | null;
  category: string | null;
  description: string | null;
};

function ScholarshipsList() {
  const { isAdmin } = useIsAdmin();
  const [rows, setRows] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("scholarships")
      .select("id, name, provider, amount, deadline, category, description")
      .order("deadline", { ascending: true, nullsFirst: false });
    if (error) toast.error(error.message);
    setRows((data as Scholarship[]) || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const categories = Array.from(new Set(rows.map((r) => r.category).filter(Boolean))) as string[];
  const filtered = rows.filter((r) => {
    if (category && r.category !== category) return false;
    if (q && !`${r.name} ${r.provider ?? ""} ${r.description ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-night">
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          {isAdmin && <AddScholarshipDialog onCreated={load} />}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm text-gold">Browse</p>
          <h1 className="mt-1 font-display text-4xl font-bold tracking-tight">Scholarships</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Real money you can apply for. Save the ones you're chasing to your tracker.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, provider…" className="pl-9" />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <p className="text-muted-foreground">No scholarships yet.</p>
            {isAdmin && <p className="mt-2 text-sm">Click "Add scholarship" above to add the first one.</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filtered.map((s) => (
              <Link
                key={s.id}
                to="/scholarships/$id"
                params={{ id: s.id }}
                className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-gold/40 hover:shadow-gold"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-semibold group-hover:text-gold">{s.name}</h3>
                    {s.provider && <p className="text-sm text-muted-foreground">{s.provider}</p>}
                  </div>
                  {s.category && (
                    <span className="rounded-full border border-gold/30 bg-gold/5 px-2.5 py-0.5 text-xs text-gold">
                      {s.category}
                    </span>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  {s.amount != null && (
                    <span className="inline-flex items-center gap-1.5 text-gold">
                      <DollarSign className="h-4 w-4" />{Number(s.amount).toLocaleString()}
                    </span>
                  )}
                  {s.deadline && (
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-4 w-4" />{new Date(s.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {s.description && (
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{s.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function AddScholarshipDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", provider: "", amount: "", deadline: "", category: "", eligibility: "", apply_url: "", description: "",
  });

  async function save() {
    if (!form.name.trim()) { toast.error("Name required"); return; }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("scholarships").insert({
      name: form.name,
      provider: form.provider || null,
      amount: form.amount ? Number(form.amount) : null,
      deadline: form.deadline || null,
      category: form.category || null,
      eligibility: form.eligibility || null,
      apply_url: form.apply_url || null,
      description: form.description || null,
      created_by: user?.id ?? null,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Scholarship added");
    setOpen(false);
    setForm({ name: "", provider: "", amount: "", deadline: "", category: "", eligibility: "", apply_url: "", description: "" });
    onCreated();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gradient-gold text-primary-foreground">
          <Plus className="mr-1.5 h-4 w-4" /> Add scholarship
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>New scholarship</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <Field label="Name *"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Provider"><Input value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount ($)"><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
            <Field label="Deadline"><Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></Field>
          </div>
          <Field label="Category"><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="STEM, Arts, Need-based…" /></Field>
          <Field label="Eligibility"><Textarea rows={2} value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} /></Field>
          <Field label="Apply URL"><Input value={form.apply_url} onChange={(e) => setForm({ ...form, apply_url: e.target.value })} placeholder="https://…" /></Field>
          <Field label="Description"><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
