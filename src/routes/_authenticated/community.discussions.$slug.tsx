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
import { ArrowLeft, MessageSquare, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/community/discussions/$slug")({
  component: TopicView,
});

type Topic = { id: string; slug: string; name: string; description: string | null };
type Thread = { id: string; title: string; body: string; author_id: string; created_at: string };

function TopicView() {
  const { slug } = Route.useParams();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "" });
  const [me, setMe] = useState<string | null>(null);

  async function load() {
    const { data: t } = await supabase.from("discussion_topics").select("*").eq("slug", slug).maybeSingle();
    if (!t) return;
    setTopic(t as Topic);
    const { data: th } = await supabase.from("discussion_threads").select("*").eq("topic_id", (t as Topic).id).order("created_at", { ascending: false });
    setThreads((th as Thread[]) || []);
  }

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setMe(user?.id || null);
      load();
    })();
  }, [slug]);

  async function submit() {
    if (!me || !topic) return;
    if (!form.title.trim() || !form.body.trim()) return toast.error("Title and message required");
    const { error } = await supabase.from("discussion_threads").insert({
      topic_id: topic.id,
      author_id: me,
      title: form.title.trim().slice(0, 200),
      body: form.body.trim().slice(0, 5000),
    });
    if (error) return toast.error(error.message);
    toast.success("Thread posted");
    setOpen(false);
    setForm({ title: "", body: "" });
    load();
  }

  if (!topic) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div>
      <Link to="/community/discussions" className="inline-flex items-center text-sm text-muted-foreground hover:text-gold">
        <ArrowLeft className="mr-1 h-4 w-4" /> All topics
      </Link>
      <div className="mt-4 mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">{topic.name}</h1>
          {topic.description && <p className="mt-1 text-sm text-muted-foreground">{topic.description}</p>}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gold text-primary-foreground hover:bg-gold/90"><Plus className="mr-2 h-4 w-4" />New thread</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Start a thread</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input maxLength={200} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Message</Label><Textarea rows={6} maxLength={5000} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={submit} className="bg-gold text-primary-foreground hover:bg-gold/90">Post</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {threads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-gold" />
          <p className="mt-3 font-display text-lg">No threads yet — start the conversation.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {threads.map((t) => (
            <li key={t.id}>
              <Link to="/community/threads/$id" params={{ id: t.id }} className="block p-5 transition hover:bg-secondary/40">
                <p className="font-display text-lg font-semibold">{t.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{t.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
