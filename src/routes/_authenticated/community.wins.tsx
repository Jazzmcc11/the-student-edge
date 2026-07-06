import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trophy } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { CardGridSkeleton } from "@/components/skeletons";

import { StudentOnly } from "@/components/student-only";

export const Route = createFileRoute("/_authenticated/community/wins")({
  component: () => <StudentOnly><WinsWall /></StudentOnly>,
});

type Win = {
  id: string;
  user_id: string;
  scholarship_name: string;
  amount: number | null;
  note: string | null;
  anonymous: boolean;
  display_name: string | null;
  created_at: string;
};

function WinsWall() {
  const [rows, setRows] = useState<Win[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ scholarship_name: "", amount: "", note: "", anonymous: false });
  const [me, setMe] = useState<{ id: string; name: string } | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("wins")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) toast.error(error.message);
    setRows((data as Win[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: prof } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
        setMe({ id: user.id, name: prof?.full_name || "A student" });
      }
      load();
    })();
  }, []);

  async function submit() {
    if (!me) return;
    if (!form.scholarship_name.trim()) return toast.error("Scholarship name required");
    const { error } = await supabase.from("wins").insert({
      user_id: me.id,
      scholarship_name: form.scholarship_name.trim().slice(0, 200),
      amount: form.amount ? Number(form.amount) : null,
      note: form.note.trim().slice(0, 500) || null,
      anonymous: form.anonymous,
      display_name: form.anonymous ? null : me.name,
    });
    if (error) return toast.error(error.message);
    toast.success("Posted! 🎉");
    setOpen(false);
    setForm({ scholarship_name: "", amount: "", note: "", anonymous: false });
    load();
  }

  const total = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Wins Wall</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real wins from real students. <span className="text-gold">${total.toLocaleString()}</span> earned by this community.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gold text-primary-foreground hover:bg-gold/90"><Plus className="mr-2 h-4 w-4" />Post a win</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Post a win</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Scholarship name</Label><Input maxLength={200} value={form.scholarship_name} onChange={(e) => setForm({ ...form, scholarship_name: e.target.value })} /></div>
              <div><Label>Amount ($)</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
              <div><Label>Note (optional)</Label><Textarea maxLength={500} placeholder="Anything you want to share — essay tip, where you found it, how you celebrated…" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={form.anonymous} onCheckedChange={(v) => setForm({ ...form, anonymous: !!v })} />
                Post anonymously
              </label>
            </div>
            <DialogFooter><Button onClick={submit} className="bg-gold text-primary-foreground hover:bg-gold/90">Post</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <CardGridSkeleton count={4} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Be the first to post a win."
          description="Even $250 counts — it inspires the next person to apply. Hit ‘Post a win’ to start the wall."
          action={
            <Button onClick={() => setOpen(true)} className="bg-gold text-primary-foreground hover:bg-gold/90">
              <Plus className="mr-2 h-4 w-4" />Post a win
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {rows.map((w) => (
            <article key={w.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold">{w.scholarship_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {w.anonymous ? "Anonymous" : w.display_name || "A student"} · {new Date(w.created_at).toLocaleDateString()}
                  </p>
                </div>
                {w.amount != null && (
                  <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-sm font-semibold text-gold">
                    ${Number(w.amount).toLocaleString()}
                  </span>
                )}
              </div>
              {w.note && <p className="mt-3 text-sm text-foreground/90">{w.note}</p>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
