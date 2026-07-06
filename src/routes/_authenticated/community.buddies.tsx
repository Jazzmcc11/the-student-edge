import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Users, Pencil } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { CardGridSkeleton } from "@/components/skeletons";

import { StudentOnly } from "@/components/student-only";

export const Route = createFileRoute("/_authenticated/community/buddies")({
  component: () => <StudentOnly><Buddies /></StudentOnly>,
});

type Buddy = {
  user_id: string;
  display_name: string;
  grade_level: string | null;
  bio: string | null;
  colleges: string | null;
  scholarships: string | null;
  contact: string | null;
  visible: boolean;
};

const empty: Buddy = {
  user_id: "", display_name: "", grade_level: "", bio: "", colleges: "", scholarships: "", contact: "", visible: true,
};

function Buddies() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Buddy[]>([]);
  const [me, setMe] = useState<string | null>(null);
  const [myProfile, setMyProfile] = useState<Buddy | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Buddy>(empty);
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("buddy_profiles").select("*").order("updated_at", { ascending: false });
    setRows((data as Buddy[]) || []);
    setLoading(false);
  }


  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setMe(user.id);
      const { data: mine } = await supabase.from("buddy_profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (mine) {
        setMyProfile(mine as Buddy);
        setForm(mine as Buddy);
      } else {
        const { data: prof } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
        setForm({ ...empty, user_id: user.id, display_name: prof?.full_name || "" });
      }
      load();
    })();
  }, []);

  async function save() {
    if (!me) return;
    if (!form.display_name.trim()) return toast.error("Display name required");
    const payload = {
      user_id: me,
      display_name: form.display_name.trim().slice(0, 80),
      grade_level: form.grade_level?.trim().slice(0, 50) || null,
      bio: form.bio?.trim().slice(0, 500) || null,
      colleges: form.colleges?.trim().slice(0, 300) || null,
      scholarships: form.scholarships?.trim().slice(0, 300) || null,
      contact: form.contact?.trim().slice(0, 200) || null,
      visible: form.visible,
    };
    const { error } = await supabase.from("buddy_profiles").upsert(payload, { onConflict: "user_id" });
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
    setOpen(false);
    setMyProfile(payload as Buddy);
    load();
  }

  const filtered = rows.filter((r) => {
    if (!q) return true;
    return `${r.display_name} ${r.colleges ?? ""} ${r.scholarships ?? ""} ${r.bio ?? ""}`.toLowerCase().includes(q.toLowerCase());
  });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Study Buddies</h1>
          <p className="mt-1 text-sm text-muted-foreground">Find students working on the same colleges or scholarships.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Pencil className="mr-2 h-4 w-4" />
              {myProfile ? "Edit my profile" : "Create profile"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Your buddy profile</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Display name</Label><Input maxLength={80} value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} /></div>
              <div><Label>Grade / year</Label><Input maxLength={50} placeholder="HS Senior, Sophomore, etc." value={form.grade_level || ""} onChange={(e) => setForm({ ...form, grade_level: e.target.value })} /></div>
              <div><Label>Colleges you're applying to</Label><Input maxLength={300} placeholder="UCLA, Howard, Spelman…" value={form.colleges || ""} onChange={(e) => setForm({ ...form, colleges: e.target.value })} /></div>
              <div><Label>Scholarships you're working on</Label><Input maxLength={300} placeholder="Gates, Coca-Cola, local…" value={form.scholarships || ""} onChange={(e) => setForm({ ...form, scholarships: e.target.value })} /></div>
              <div><Label>About you</Label><Textarea maxLength={500} placeholder="Interests, what you want in a buddy, study style…" value={form.bio || ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
              <div><Label>How to reach you</Label><Input maxLength={200} placeholder="Discord handle, email, IG…" value={form.contact || ""} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></div>
              <label className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-sm">Visible in the directory</span>
                <Switch checked={form.visible} onCheckedChange={(v) => setForm({ ...form, visible: v })} />
              </label>
            </div>
            <DialogFooter><Button onClick={save} className="bg-gold text-primary-foreground hover:bg-gold/90">Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Input placeholder="Search by name, college, scholarship…" value={q} onChange={(e) => setQ(e.target.value)} className="mb-5 max-w-md" />

      {loading ? (
        <CardGridSkeleton count={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={rows.length === 0 ? "No buddies yet." : "No matches for that search."}
          description={
            rows.length === 0
              ? "Create your profile and you’ll show up here for everyone working on the same colleges and scholarships."
              : "Try a different college, scholarship, or name."
          }
          action={
            rows.length === 0 ? (
              <Button onClick={() => setOpen(true)} variant="outline">
                <Pencil className="mr-2 h-4 w-4" />Create my profile
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((b) => (
            <article key={b.user_id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-lg font-semibold">{b.display_name}</p>
                  {b.grade_level && <p className="text-xs text-muted-foreground">{b.grade_level}</p>}
                </div>
                {b.user_id === me && <span className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-xs text-gold">You</span>}
              </div>
              {b.bio && <p className="mt-3 text-sm text-foreground/90">{b.bio}</p>}
              {b.colleges && <p className="mt-2 text-xs"><span className="text-muted-foreground">Colleges:</span> {b.colleges}</p>}
              {b.scholarships && <p className="mt-1 text-xs"><span className="text-muted-foreground">Scholarships:</span> {b.scholarships}</p>}
              {b.contact && b.user_id !== me && (
                <p className="mt-3 rounded-md bg-secondary px-3 py-2 text-xs">
                  <span className="text-muted-foreground">Reach out:</span> <span className="text-gold">{b.contact}</span>
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
