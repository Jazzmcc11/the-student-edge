import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Copy, Link2, Trash2, Users, GraduationCap, Trophy, ClipboardList } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/family")({
  head: () => ({ meta: [{ title: "Family — The Plug" }] }),
  component: FamilyPage,
});

type Profile = { id: string; full_name: string | null; email: string | null; user_type: "student" | "parent" };
type Invite = { id: string; code: string; expires_at: string; used_at: string | null };

function randomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

function FamilyPage() {
  const [me, setMe] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("profiles").select("id, full_name, email, user_type").eq("id", user.id).maybeSingle();
    if (data) setMe(data as Profile);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <div className="min-h-screen bg-gradient-night">
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <p className="text-sm text-gold">Family</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {me?.user_type === "parent" ? "Your students" : "Share with a parent"}
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            {me?.user_type === "parent"
              ? "Link to your student's account with a code they give you. You'll get a read-only view of their progress."
              : "Generate a code your parent can use to follow your progress. They get read-only access — you stay in control."}
          </p>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : me?.user_type === "parent" ? (
          <ParentView onChange={refresh} />
        ) : (
          <StudentView onChange={refresh} />
        )}
      </main>
    </div>
  );
}

/* ------------------------- STUDENT ------------------------- */
function StudentView({ onChange }: { onChange: () => void }) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [parents, setParents] = useState<Profile[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [{ data: inv }, { data: links }] = await Promise.all([
      supabase.from("parent_invites").select("id, code, expires_at, used_at").eq("student_id", user.id).order("created_at", { ascending: false }),
      supabase.from("parent_student_links").select("id, parent_id, student_id, created_at").eq("student_id", user.id),
    ]);
    setInvites((inv as Invite[]) || []);

    const parentIds = (links || []).map((l: any) => l.parent_id);
    if (parentIds.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name, email, user_type").in("id", parentIds);
      // map link.id onto each parent for revoke
      const linkByParent = new Map((links || []).map((l: any) => [l.parent_id, l.id]));
      setParents(((profs as Profile[]) || []).map((p) => ({ ...p, __linkId: linkByParent.get(p.id) } as any)));
    } else {
      setParents([]);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function generateInvite() {
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // try a few times in case of unique collision
      let lastErr: any = null;
      for (let i = 0; i < 5; i++) {
        const code = randomCode();
        const { error } = await supabase.from("parent_invites").insert({ student_id: user.id, code });
        if (!error) { lastErr = null; break; }
        lastErr = error;
        if (!String(error.message).toLowerCase().includes("duplicate")) break;
      }
      if (lastErr) throw lastErr;
      toast.success("Invite code generated");
      await load();
    } catch (e: any) {
      toast.error(e.message || "Could not generate invite");
    } finally {
      setBusy(false);
    }
  }

  async function revokeInvite(id: string) {
    const { error } = await supabase.from("parent_invites").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Invite revoked");
    load();
  }

  async function revokeLink(linkId: string) {
    const { error } = await supabase.from("parent_student_links").delete().eq("id", linkId);
    if (error) return toast.error(error.message);
    toast.success("Parent unlinked");
    load(); onChange();
  }

  function copy(code: string) {
    navigator.clipboard.writeText(code);
    toast.success("Code copied");
  }

  const activeInvites = invites.filter((i) => !i.used_at && new Date(i.expires_at) > new Date());

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold sm:text-xl">Generate an invite code</h2>
            <p className="text-sm text-muted-foreground">Codes expire after 7 days and work once.</p>
          </div>
          <Button onClick={generateInvite} disabled={busy} className="shrink-0 bg-gradient-gold text-primary-foreground shadow-gold">
            New code
          </Button>
        </div>

        {activeInvites.length > 0 && (
          <ul className="mt-5 space-y-2">
            {activeInvites.map((inv) => (
              <li key={inv.id} className="flex flex-col gap-3 rounded-lg border border-gold/30 bg-gold/5 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="font-mono text-xl font-bold tracking-[0.25em] text-gold sm:text-2xl sm:tracking-[0.3em]">{inv.code}</div>
                  <p className="text-xs text-muted-foreground">
                    Expires {new Date(inv.expires_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => copy(inv.code)} className="flex-1 sm:flex-none">
                    <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => revokeInvite(inv.id)} aria-label="Revoke code">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl font-semibold">Linked parents</h2>
        {parents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No parents linked yet.</p>
        ) : (
          <ul className="space-y-2">
            {parents.map((p: any) => (
              <li key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-medium">{p.full_name || "Parent"}</div>
                    <div className="truncate text-xs text-muted-foreground">{p.email}</div>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => revokeLink(p.__linkId)} className="shrink-0">
                  <Trash2 className="h-4 w-4 sm:mr-1.5" /> <span className="hidden sm:inline">Unlink</span>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ------------------------- PARENT ------------------------- */
function ParentView({ onChange }: { onChange: () => void }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [students, setStudents] = useState<any[]>([]);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: links } = await supabase.from("parent_student_links").select("id, student_id").eq("parent_id", user.id);
    const ids = (links || []).map((l: any) => l.student_id);
    if (!ids.length) { setStudents([]); return; }

    const [{ data: profs }, { data: schApps }, { data: collegeApps }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email").in("id", ids),
      supabase.from("scholarship_applications").select("user_id, received, amount, name, date_applied").in("user_id", ids),
      supabase.from("college_applications").select("user_id, college_name, submitted, accepted").in("user_id", ids),
    ]);

    const linkByStudent = new Map((links || []).map((l: any) => [l.student_id, l.id]));
    const merged = (profs || []).map((p: any) => {
      const sch = (schApps || []).filter((s: any) => s.user_id === p.id);
      const col = (collegeApps || []).filter((c: any) => c.user_id === p.id);
      return {
        ...p,
        linkId: linkByStudent.get(p.id),
        won: sch.filter((s: any) => s.received).reduce((a: number, s: any) => a + Number(s.amount || 0), 0),
        pending: sch.filter((s: any) => !s.received).length,
        scholarships: sch,
        colleges: col,
      };
    });
    setStudents(merged);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function redeem(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    try {
      const { error } = await supabase.rpc("redeem_parent_invite", { _code: code.trim().toUpperCase() });
      if (error) throw error;
      toast.success("Linked to student");
      setCode("");
      await load();
      onChange();
    } catch (e: any) {
      toast.error(e.message || "Could not redeem code");
    } finally {
      setBusy(false);
    }
  }

  async function unlink(linkId: string) {
    const { error } = await supabase.from("parent_student_links").delete().eq("id", linkId);
    if (error) return toast.error(error.message);
    toast.success("Unlinked");
    load();
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold sm:text-xl">Link a student</h2>
        <p className="text-sm text-muted-foreground">Ask your student to generate a code from their Family page.</p>
        <form onSubmit={redeem} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="code">Invite code</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABCD23"
              maxLength={6}
              className="font-mono tracking-[0.3em]"
            />
          </div>
          <Button type="submit" disabled={busy || code.length < 4} className="bg-gradient-gold text-primary-foreground shadow-gold">
            <Link2 className="mr-1.5 h-4 w-4" /> Link
          </Button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl font-semibold">Your students</h2>
        {students.length === 0 ? (
          <p className="text-sm text-muted-foreground">No students linked yet.</p>
        ) : (
          <div className="space-y-4">
            {students.map((s) => (
              <div key={s.id} className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-display text-lg font-semibold">{s.full_name || "Student"}</div>
                      <div className="truncate text-xs text-muted-foreground">{s.email}</div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => unlink(s.linkId)} className="shrink-0">
                    <Trash2 className="h-4 w-4 sm:mr-1.5" /> <span className="hidden sm:inline">Unlink</span>
                  </Button>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <MiniStat icon={Trophy} label="Won" value={`$${s.won.toLocaleString()}`} highlight />
                  <MiniStat icon={ClipboardList} label="Pending apps" value={s.pending.toString()} />
                  <MiniStat icon={GraduationCap} label="Colleges" value={s.colleges.length.toString()} />
                </div>

                {s.colleges.length > 0 && (
                  <div className="mt-6">
                    <h3 className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Colleges</h3>
                    <ul className="divide-y divide-border rounded-lg border border-border">
                      {s.colleges.map((c: any, i: number) => (
                        <li key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                          <span>{c.college_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {c.accepted === true ? "Accepted" : c.accepted === false ? "Denied" : c.submitted ? "Submitted" : "Drafting"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {s.scholarships.length > 0 && (
                  <div className="mt-6">
                    <h3 className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Scholarships</h3>
                    <ul className="divide-y divide-border rounded-lg border border-border">
                      {s.scholarships.map((sc: any, i: number) => (
                        <li key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                          <span>{sc.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {sc.received ? `Won $${Number(sc.amount || 0).toLocaleString()}` : "Pending"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, highlight }: { icon: any; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${highlight ? "border-gold/40 bg-gold/5" : "border-border bg-background/40"}`}>
      <Icon className="h-4 w-4 text-gold" />
      <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-0.5 font-display text-base font-semibold ${highlight ? "text-gold" : ""}`}>{value}</p>
    </div>
  );
}
