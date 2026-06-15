import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/community/advice/$id")({
  component: AdviceDetail,
});

type Post = {
  id: string; title: string; body: string; audience: string;
  category: string | null; created_at: string;
};

function AdviceDetail() {
  const { id } = Route.useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("advice_posts").select("*").eq("id", id).maybeSingle();
      if (error) toast.error(error.message);
      setPost(data as Post | null);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <p className="text-muted-foreground">Loading…</p>;
  if (!post) return <p className="text-muted-foreground">Post not found.</p>;

  return (
    <article>
      <Link to="/community/advice" className="inline-flex items-center text-sm text-muted-foreground hover:text-gold">
        <ArrowLeft className="mr-1 h-4 w-4" /> All advice
      </Link>
      <div className="mt-4 flex items-center gap-2 text-xs">
        <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-muted-foreground capitalize">
          {post.audience === "both" ? "Everyone" : post.audience === "student" ? "Students" : "Parents"}
        </span>
        {post.category && <span className="text-muted-foreground">· {post.category}</span>}
        <span className="text-muted-foreground">· {new Date(post.created_at).toLocaleDateString()}</span>
      </div>
      <h1 className="mt-2 font-display text-3xl font-bold">{post.title}</h1>
      <div className="prose prose-invert mt-6 max-w-none whitespace-pre-wrap text-foreground/90">{post.body}</div>
    </article>
  );
}
