import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Feather, MessageSquare, Send, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/parent/essays")({
  head: () => ({ meta: [{ title: "Read your student's essays — The Plug" }] }),
  component: ParentEssaysPage,
});

type StudentLite = { id: string; full_name: string | null; display_name: string | null };
type Essay = {
  id: string;
  user_id: string;
  title: string;
  prompt: string | null;
  draft_content: string;
  status: string;
  word_limit: number | null;
  updated_at: string;
};
type Comment = {
  id: string;
  essay_id: string;
  author_id: string;
  body: string;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  brainstorm: "Brainstorm", drafting: "Drafting", revising: "Revising", ready: "Ready", final: "Final",
};

function ParentEssaysPage() {
  const navigate = useNavigate();
  const [me, setMe] = useState<{ id: string; user_type: string } | null>(null);
  const [students, setStudents] = useState<StudentLite[]>([]);
  const [activeStudent, setActiveStudent] = useState<string | null>(null);
  const [essays, setEssays] = useState<Essay[]>([]);
  const [openEssay, setOpenEssay] = useState<Essay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: prof } = await supabase.from("profiles").select("id, user_type").eq("id", user.id).maybeSingle();
      if (!prof || prof.user_type !== "parent") {
        toast.error("Parent-only area");
        navigate({ to: "/dashboard" });
        return;
      }
      setMe(prof as any);
      const { data: links } = await supabase.from("parent_student_links").select("student_id").eq("parent_id", user.id);
      const ids = (links || []).map((l: any) => l.student_id);
      if (!ids.length) { setLoading(false); return; }
      const { data: profs } = await supabase.from("profiles").select("id, full_name, display_name").in("id", ids);
      setStudents((profs as StudentLite[]) || []);
      setActiveStudent(ids[0]);
      setLoading(false);
    })();
  }, [navigate]);

  useEffect(() => {
    if (!activeStudent) return;
    (async () => {
      const { data } = await supabase
        .from("essays")
        .select("id, user_id, title, prompt, draft_content, status, word_limit, updated_at")
        .eq("user_id", activeStudent)
        .order("updated_at", { ascending: false });
      setEssays((data as Essay[]) || []);
    })();
  }, [activeStudent]);

  return (
    <div className="min-h-screen bg-gradient-night">
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <p className="text-sm text-gold">Parent view</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">Their essays, your quiet feedback</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Read what they're working on. Leave a comment they'll see next time they open the essay — no edits, no rewriting. You're their sounding board.
          </p>
        </div>

        {loading ? <p className="text-muted-foreground">Loading…</p> : students.length === 0 ? (
          <EmptyLink />
        ) : (
          <>
            {students.length > 1 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {students.map((s) => (
                  <button key={s.id} onClick={() => setActiveStudent(s.id)}
                    className={`rounded-full px-4 py-2 text-sm transition ${activeStudent === s.id ? "border border-gold/40 bg-gold/15 text-gold" : "border border-border bg-card text-muted-foreground hover:text-gold"}`}>
                    <Users className="mr-1.5 inline h-3.5 w-3.5" />
                    {s.display_name || s.full_name || "Student"}
                  </button>
                ))}
              </div>
            )}

            {essays.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                <Feather className="mx-auto h-8 w-8 text-gold" />
                <h2 className="mt-4 font-display text-xl font-semibold">No essays yet</h2>
                <p className="mt-2 text-sm text-muted-foreground">When they start a draft, you'll see it here.</p>
              </div>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {essays.map((e) => (
                  <li key={e.id}>
                    <button onClick={() => setOpenEssay(e)} className="w-full text-left">
                      <div className="rounded-2xl border border-border bg-card p-5 transition hover:border-gold/40">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-display text-lg font-semibold line-clamp-2">{e.title}</h3>
                          <span className="shrink-0 rounded-full border border-gold/30 bg-gold/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-gold">
                            {STATUS_LABEL[e.status] || e.status}
                          </span>
                        </div>
                        {e.prompt && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{e.prompt}</p>}
                        <p className="mt-3 text-xs text-muted-foreground">
                          {e.draft_content ? `${e.draft_content.trim().split(/\s+/).length} words` : "Empty"} · updated {new Date(e.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>

      {openEssay && me && (
        <EssayReader essay={openEssay} me={me.id} onClose={() => setOpenEssay(null)} />
      )}
    </div>
  );
}

function EssayReader({ essay, me, onClose }: { essay: Essay; me: string; onClose: () => void }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("essay_comments").select("*").eq("essay_id", essay.id).order("created_at", { ascending: true });
    setComments((data as Comment[]) || []);
  }, [essay.id]);

  useEffect(() => { load(); }, [load]);

  async function post() {
    if (!text.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("essay_comments").insert({
      essay_id: essay.id, author_id: me, student_id: essay.user_id, body: text.trim(),
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setText("");
    toast.success("Comment sent");
    load();
  }

  async function del(id: string) {
    const { error } = await supabase.from("essay_comments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }

  const words = essay.draft_content ? essay.draft_content.trim().split(/\s+/).length : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
      <div className="mx-auto max-w-5xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/40 bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <Button size="sm" variant="ghost" onClick={onClose}><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button>
            <h2 className="truncate font-display text-lg font-semibold">{essay.title}</h2>
          </div>
          <span className="text-xs text-muted-foreground">{words} words</span>
        </div>

        <div className="grid gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            {essay.prompt && (
              <div className="rounded-xl border border-gold/20 bg-gold/5 p-4">
                <div className="mb-1 text-xs uppercase tracking-wider text-gold">The prompt</div>
                <p className="text-sm">{essay.prompt}</p>
              </div>
            )}
            <div className="rounded-xl border border-border bg-card p-6 text-base leading-relaxed whitespace-pre-wrap min-h-[400px]">
              {essay.draft_content || <span className="italic text-muted-foreground">No draft written yet.</span>}
            </div>
          </div>

          <aside className="space-y-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gold" />
                <h3 className="font-display font-semibold">Your comments</h3>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">They'll see these when they open the essay. Keep it kind — they wrote it.</p>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No comments yet.</p>
                ) : comments.map((c) => (
                  <div key={c.id} className={`rounded-lg border p-3 text-sm ${c.author_id === me ? "border-gold/30 bg-gold/5" : "border-border bg-background/40"}`}>
                    <p className="whitespace-pre-wrap">{c.body}</p>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleString()}</span>
                      {c.author_id === me && (
                        <button onClick={() => del(c.id)} className="text-muted-foreground hover:text-destructive" aria-label="Delete">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 space-y-2">
                <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="What stood out? What sounds like them?" rows={3} className="text-sm" />
                <Button onClick={post} disabled={busy || !text.trim()} className="w-full bg-gradient-gold text-primary-foreground shadow-gold">
                  <Send className="mr-1.5 h-3.5 w-3.5" /> Send comment
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function EmptyLink() {
  return (
    <div className="rounded-2xl border border-dashed border-gold/30 bg-card p-10 text-center">
      <Feather className="mx-auto h-8 w-8 text-gold" />
      <h2 className="mt-4 font-display text-xl font-semibold">Link a student first</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Ask your student to generate a code in their Family settings, then redeem it on your Family page.</p>
      <Link to="/family"><Button className="mt-6 bg-gold text-primary-foreground hover:bg-gold/90">Go to Family</Button></Link>
    </div>
  );
}
