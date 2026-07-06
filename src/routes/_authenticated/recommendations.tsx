import { createFileRoute, Link } from "@tanstack/react-router";
import { StudentOnly } from "@/components/student-only";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft, Plus, Trash2, Mail, UserPlus, Check, Clock, HandHeart, Sparkles, Copy,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/recommendations")({
  head: () => ({
    meta: [
      { title: "Recommendations — The Plug" },
      { name: "description", content: "Track your recommenders and letter requests without dropping the ball." },
    ],
  }),
  component: () => <StudentOnly><RecommendationsPage /></StudentOnly>,
});

type Recommender = {
  id: string;
  name: string;
  role: string | null;
  email: string | null;
  relationship: string | null;
  notes: string | null;
};

type RecRequest = {
  id: string;
  recommender_id: string;
  college_id: string | null;
  status: "not_asked" | "asked" | "confirmed" | "submitted";
  requested_at: string | null;
  submitted_at: string | null;
  thank_you_sent: boolean;
  deadline: string | null;
  notes: string | null;
};

type College = { id: string; college_name: string };

const STATUS_META: Record<string, { label: string; tone: string }> = {
  not_asked: { label: "Not asked", tone: "bg-secondary text-muted-foreground" },
  asked: { label: "Asked", tone: "bg-amber-500/15 text-amber-300" },
  confirmed: { label: "Confirmed", tone: "bg-blue-500/15 text-blue-300" },
  submitted: { label: "Submitted", tone: "bg-emerald-500/15 text-emerald-300" },
};

function RecommendationsPage() {
  const [recs, setRecs] = useState<Recommender[]>([]);
  const [reqs, setReqs] = useState<RecRequest[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [showRec, setShowRec] = useState(false);
  const [showReq, setShowReq] = useState<Recommender | null>(null);
  const [showEmail, setShowEmail] = useState<Recommender | null>(null);

  async function load() {
    const [{ data: r }, { data: rq }, { data: c }] = await Promise.all([
      supabase.from("recommenders").select("*").order("created_at", { ascending: false }),
      supabase.from("recommendation_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("college_applications").select("id, college_name").order("college_name"),
    ]);
    setRecs((r as Recommender[]) || []);
    setReqs((rq as RecRequest[]) || []);
    setColleges((c as College[]) || []);
  }
  useEffect(() => { load(); }, []);

  async function addRec(payload: Partial<Recommender>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("recommenders").insert({ user_id: user.id, name: payload.name!, role: payload.role || null, email: payload.email || null, relationship: payload.relationship || null, notes: payload.notes || null });
    if (error) return toast.error(error.message);
    setShowRec(false);
    load();
    toast.success("Added");
  }

  async function delRec(id: string) {
    if (!confirm("Delete this recommender and all their tracked requests?")) return;
    const { error } = await supabase.from("recommenders").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }

  async function addReq(rec: Recommender, college_id: string | null, deadline: string | null) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("recommendation_requests").insert({
      user_id: user.id, recommender_id: rec.id, college_id, deadline, status: "not_asked",
    });
    if (error) return toast.error(error.message);
    setShowReq(null); load();
  }

  async function updateReq(id: string, patch: Partial<RecRequest>) {
    const stamps: any = { ...patch };
    if (patch.status === "asked" && !reqs.find(r => r.id === id)?.requested_at) stamps.requested_at = new Date().toISOString();
    if (patch.status === "submitted") stamps.submitted_at = new Date().toISOString();
    const { error } = await supabase.from("recommendation_requests").update(stamps).eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }

  async function delReq(id: string) {
    await supabase.from("recommendation_requests").delete().eq("id", id);
    load();
  }

  // stats
  const stats = {
    asked: reqs.filter(r => r.status === "asked" || r.status === "confirmed").length,
    submitted: reqs.filter(r => r.status === "submitted").length,
    thanksOwed: reqs.filter(r => r.status === "submitted" && !r.thank_you_sent).length,
  };

  return (
    <div className="min-h-screen bg-gradient-night">
      <header className="border-b border-border/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="flex items-center gap-2 text-sm text-gold">
            <HandHeart className="h-4 w-4" /> Recommendations
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Your people</h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              The teachers and mentors in your corner. Track who you asked, who said yes, and who deserves a thank you.
            </p>
          </div>
          <Button onClick={() => setShowRec(true)} className="bg-gold text-primary-foreground hover:bg-gold/90 self-start md:self-auto">
            <UserPlus className="mr-2 h-4 w-4" /> Add recommender
          </Button>
        </div>

        <div className="mb-8 grid grid-cols-3 gap-3">
          <MiniStat icon={Clock} label="Waiting on" value={stats.asked} />
          <MiniStat icon={Check} label="Submitted" value={stats.submitted} highlight />
          <MiniStat icon={HandHeart} label="Thanks to send" value={stats.thanksOwed} warn={stats.thanksOwed > 0} />
        </div>

        {recs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gold/30 bg-card p-12 text-center">
            <UserPlus className="mx-auto h-10 w-10 text-gold" />
            <h2 className="mt-4 font-display text-2xl font-bold">Who's got your back?</h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              Add the teachers, counselors, or mentors you might ask for letters. You don't have to commit yet.
            </p>
            <Button onClick={() => setShowRec(true)} className="mt-6 bg-gold text-primary-foreground hover:bg-gold/90">
              <Plus className="mr-2 h-4 w-4" /> Add your first
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recs.map((r) => {
              const myReqs = reqs.filter((rq) => rq.recommender_id === r.id);
              return (
                <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <h3 className="font-display text-xl font-semibold">{r.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {[r.role, r.relationship].filter(Boolean).join(" · ") || "—"}
                      </p>
                      {r.email && <p className="mt-1 text-xs text-muted-foreground">{r.email}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {r.email && (
                        <Button size="sm" variant="outline" onClick={() => setShowEmail(r)}>
                          <Sparkles className="mr-1.5 h-3 w-3" /> Draft ask email
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => setShowReq(r)}>
                        <Plus className="mr-1.5 h-3 w-3" /> Track for college
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => delRec(r.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {myReqs.length > 0 && (
                    <div className="mt-4 divide-y divide-border/50 rounded-lg border border-border/50">
                      {myReqs.map((rq) => {
                        const meta = STATUS_META[rq.status];
                        const college = colleges.find(c => c.id === rq.college_id);
                        return (
                          <div key={rq.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
                            <div className="min-w-0">
                              <p className="font-medium">{college?.college_name || "(no college linked)"}</p>
                              {rq.deadline && (
                                <p className="text-xs text-muted-foreground">
                                  Due {new Date(rq.deadline).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Select value={rq.status} onValueChange={(v) => updateReq(rq.id, { status: v as any })}>
                                <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {Object.entries(STATUS_META).map(([k, v]) => (
                                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Badge variant="outline" className={meta.tone}>{meta.label}</Badge>
                              {rq.status === "submitted" && (
                                <Button
                                  size="sm"
                                  variant={rq.thank_you_sent ? "ghost" : "outline"}
                                  onClick={() => updateReq(rq.id, { thank_you_sent: !rq.thank_you_sent })}
                                  className={rq.thank_you_sent ? "text-emerald-400" : "text-gold"}
                                >
                                  <HandHeart className="mr-1.5 h-3 w-3" />
                                  {rq.thank_you_sent ? "Thanked" : "Send thanks"}
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" onClick={() => delReq(rq.id)} className="text-destructive">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <AddRecDialog open={showRec} onOpenChange={setShowRec} onSave={addRec} />
      {showReq && (
        <AddReqDialog rec={showReq} colleges={colleges} onClose={() => setShowReq(null)} onSave={addReq} />
      )}
      {showEmail && <EmailDraftDialog rec={showEmail} onClose={() => setShowEmail(null)} />}
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, highlight, warn }: { icon: React.ElementType; label: string; value: number; highlight?: boolean; warn?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "border-gold/40 bg-gold/5" : warn ? "border-amber-500/30 bg-amber-500/5" : "border-border bg-card"}`}>
      <Icon className={`h-4 w-4 ${warn ? "text-amber-400" : "text-gold"}`} />
      <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-display text-2xl font-bold">{value}</p>
    </div>
  );
}

function AddRecDialog({ open, onOpenChange, onSave }: { open: boolean; onOpenChange: (b: boolean) => void; onSave: (r: Partial<Recommender>) => void }) {
  const [form, setForm] = useState<Partial<Recommender>>({});
  useEffect(() => { if (open) setForm({}); }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New recommender</DialogTitle>
          <DialogDescription>Someone who might write you a letter.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Name (e.g. Ms. Patterson)" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Role (AP Lit teacher)" value={form.role || ""} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            <Input placeholder="Relationship (2 years)" value={form.relationship || ""} onChange={(e) => setForm({ ...form, relationship: e.target.value })} />
          </div>
          <Input placeholder="Email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Textarea placeholder="Notes — a specific project, why they'd write a strong letter…" value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-gold text-primary-foreground hover:bg-gold/90" disabled={!form.name} onClick={() => onSave(form)}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddReqDialog({ rec, colleges, onClose, onSave }: { rec: Recommender; colleges: College[]; onClose: () => void; onSave: (r: Recommender, c: string | null, d: string | null) => void }) {
  const [collegeId, setCollegeId] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Track a request for {rec.name}</DialogTitle>
          <DialogDescription>Link this letter to one of your colleges (optional).</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground">College</label>
            <Select value={collegeId} onValueChange={setCollegeId}>
              <SelectTrigger><SelectValue placeholder={colleges.length ? "Pick one" : "Add colleges in your tracker first"} /></SelectTrigger>
              <SelectContent>
                {colleges.map(c => <SelectItem key={c.id} value={c.id}>{c.college_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Deadline</label>
            <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button className="bg-gold text-primary-foreground hover:bg-gold/90" onClick={() => onSave(rec, collegeId || null, deadline || null)}>Track it</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EmailDraftDialog({ rec, onClose }: { rec: Recommender; onClose: () => void }) {
  const draft = `Subject: Would you be willing to write me a letter of recommendation?

Hi ${rec.name.split(" ")[0] || rec.name},

I hope you're doing well. I'm working on my college applications and would be honored if you'd be willing to write me a letter of recommendation. Your class was one of the most meaningful for me${rec.relationship ? ` — especially over the past ${rec.relationship.toLowerCase()}` : ""}, and your perspective on my growth would mean a lot to the admissions committee.

I'll be applying to a handful of schools this fall. The earliest deadline is [date], so I wanted to give you plenty of time. If you're able to, I'd be happy to send:
• My resume and a short "brag sheet"
• The list of schools with deadlines
• Any specific prompts each school requires

Totally understand if you can't — I know how busy things get. Either way, thank you for everything you've taught me.

With gratitude,
[Your name]`;

  function copy() {
    navigator.clipboard.writeText(draft);
    toast.success("Copied to clipboard");
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Draft email to {rec.name}</DialogTitle>
          <DialogDescription>Copy, edit to sound like you, and send.</DialogDescription>
        </DialogHeader>
        <Textarea value={draft} readOnly rows={16} className="text-sm" />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button className="bg-gold text-primary-foreground hover:bg-gold/90" onClick={copy}>
            <Copy className="mr-2 h-4 w-4" /> Copy draft
          </Button>
          {rec.email && (
            <a href={`mailto:${rec.email}?subject=${encodeURIComponent("Would you be willing to write me a letter of recommendation?")}&body=${encodeURIComponent(draft.split("\n").slice(2).join("\n"))}`}>
              <Button variant="outline"><Mail className="mr-2 h-4 w-4" /> Open in mail</Button>
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
