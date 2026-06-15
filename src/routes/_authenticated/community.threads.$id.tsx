import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/community/threads/$id")({
  component: ThreadView,
});

type Thread = { id: string; topic_id: string; title: string; body: string; author_id: string; created_at: string };
type Reply = { id: string; body: string; author_id: string; created_at: string };

function ThreadView() {
  const { id } = Route.useParams();
  const [thread, setThread] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [body, setBody] = useState("");
  const [me, setMe] = useState<string | null>(null);
  const [topicSlug, setTopicSlug] = useState<string | null>(null);

  async function load() {
    const { data: t } = await supabase.from("discussion_threads").select("*").eq("id", id).maybeSingle();
    if (!t) return;
    setThread(t as Thread);
    const { data: topic } = await supabase.from("discussion_topics").select("slug").eq("id", (t as Thread).topic_id).maybeSingle();
    setTopicSlug((topic as any)?.slug ?? null);
    const { data: r } = await supabase.from("discussion_replies").select("*").eq("thread_id", id).order("created_at");
    setReplies((r as Reply[]) || []);
  }

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setMe(user?.id || null);
      load();
    })();
  }, [id]);

  async function submitReply() {
    if (!me) return;
    if (!body.trim()) return;
    const { error } = await supabase.from("discussion_replies").insert({
      thread_id: id, author_id: me, body: body.trim().slice(0, 5000),
    });
    if (error) return toast.error(error.message);
    setBody("");
    load();
  }

  if (!thread) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div>
      {topicSlug ? (
        <Link to="/community/discussions/$slug" params={{ slug: topicSlug }} className="inline-flex items-center text-sm text-muted-foreground hover:text-gold">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to topic
        </Link>
      ) : (
        <Link to="/community/discussions" className="inline-flex items-center text-sm text-muted-foreground hover:text-gold">
          <ArrowLeft className="mr-1 h-4 w-4" /> Discussions
        </Link>
      )}

      <article className="mt-4 rounded-xl border border-border bg-card p-6">
        <h1 className="font-display text-2xl font-bold">{thread.title}</h1>
        <p className="mt-1 text-xs text-muted-foreground">{new Date(thread.created_at).toLocaleString()}</p>
        <p className="mt-4 whitespace-pre-wrap text-foreground/90">{thread.body}</p>
      </article>

      <h2 className="mt-8 mb-3 font-display text-lg font-semibold">{replies.length} {replies.length === 1 ? "reply" : "replies"}</h2>
      <ul className="space-y-3">
        {replies.map((r) => (
          <li key={r.id} className="rounded-lg border border-border bg-card p-4">
            <p className="whitespace-pre-wrap text-sm text-foreground/90">{r.body}</p>
            <p className="mt-2 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-xl border border-border bg-card p-4">
        <Textarea rows={3} maxLength={5000} placeholder="Add to the conversation…" value={body} onChange={(e) => setBody(e.target.value)} />
        <div className="mt-2 flex justify-end">
          <Button onClick={submitReply} disabled={!body.trim()} className="bg-gold text-primary-foreground hover:bg-gold/90">Reply</Button>
        </div>
      </div>
    </div>
  );
}
