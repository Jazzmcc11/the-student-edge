import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Plus } from "lucide-react";
import { toast } from "sonner";
import { useIsAdmin } from "@/hooks/use-admin";
import { EmptyState } from "@/components/empty-state";
import { CardGridSkeleton } from "@/components/skeletons";

export const Route = createFileRoute("/_authenticated/community/advice")({
  component: AdviceLayout,
});

type Post = {
  id: string; title: string; body: string; audience: "student" | "parent" | "both";
  category: string | null; created_at: string;
};

function AdviceLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // If on a detail route, just render outlet
  if (pathname !== "/community/advice") return <Outlet />;
  return <AdviceList />;
}

function AdviceList() {
  const { isAdmin } = useIsAdmin();
  const [rows, setRows] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [aud, setAud] = useState<"all" | "student" | "parent">("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", audience: "both" as Post["audience"], category: "" });

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("advice_posts")
      .select("id, title, body, audience, category, created_at")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as Post[]) || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function submit() {
    if (!form.title.trim() || !form.body.trim()) return toast.error("Title and body required");
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("advice_posts").insert({
      author_id: user?.id ?? null,
      title: form.title.trim().slice(0, 200),
      body: form.body.trim(),
      audience: form.audience,
      category: form.category.trim().slice(0, 80) || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Posted");
    setOpen(false);
    setForm({ title: "", body: "", audience: "both", category: "" });
    load();
  }

  const filtered = rows.filter((r) => aud === "all" || r.audience === aud || r.audience === "both");

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Advice</h1>
          <p className="mt-1 text-sm text-muted-foreground">Curated guides for students and parents.</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gold text-primary-foreground hover:bg-gold/90"><Plus className="mr-2 h-4 w-4" />New post</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>New advice post</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Title</Label><Input maxLength={200} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div><Label>Audience</Label>
                  <Select value={form.audience} onValueChange={(v) => setForm({ ...form, audience: v as Post["audience"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Both</SelectItem>
                      <SelectItem value="student">Students</SelectItem>
                      <SelectItem value="parent">Parents</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Category</Label><Input maxLength={80} placeholder="Essays, FAFSA, Visits…" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
                <div><Label>Body (markdown supported as plain text)</Label><Textarea rows={10} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={submit} className="bg-gold text-primary-foreground hover:bg-gold/90">Publish</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="mb-5 flex gap-2">
        {(["all", "student", "parent"] as const).map((k) => (
          <button key={k} onClick={() => setAud(k)}
            className={`rounded-full border px-3 py-1 text-xs ${aud === k ? "border-gold/40 bg-gold/10 text-gold" : "border-border text-muted-foreground hover:text-gold"}`}>
            {k === "all" ? "All" : k === "student" ? "For students" : "For parents"}
          </button>
        ))}
      </div>

      {loading ? (
        <CardGridSkeleton count={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={rows.length === 0 ? "Advice library is on its way." : "Nothing in this filter yet."}
          description={
            rows.length === 0
              ? "We’re seeding 10 starter guides for students and 10 for parents. Check back soon — or switch to discussions for live conversation."
              : "Try a different audience filter."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((p) => (
            <Link key={p.id} to="/community/advice/$id" params={{ id: p.id }}
              className="block rounded-xl border border-border bg-card p-5 transition hover:border-gold/40">
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-muted-foreground capitalize">{p.audience === "both" ? "Everyone" : p.audience === "student" ? "Students" : "Parents"}</span>
                {p.category && <span className="text-muted-foreground">· {p.category}</span>}
              </div>
              <h3 className="mt-2 font-display text-lg font-semibold">{p.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.body}</p>
              <p className="mt-3 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
