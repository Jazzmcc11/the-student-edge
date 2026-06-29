import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare } from "lucide-react";
import { CardGridSkeleton } from "@/components/skeletons";

export const Route = createFileRoute("/_authenticated/community/discussions")({
  component: DiscussionsLayout,
});

type Topic = { id: string; slug: string; name: string; description: string | null; audience: string };

function DiscussionsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/community/discussions") return <Outlet />;
  return <TopicsList />;
}

function TopicsList() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      let role: "student" | "parent" = "student";
      if (user) {
        const { data: prof } = await supabase.from("profiles").select("user_type").eq("id", user.id).maybeSingle();
        if (prof?.user_type) role = prof.user_type as "student" | "parent";
      }
      const { data } = await supabase.from("discussion_topics").select("*").order("sort_order");
      const all = (data as Topic[]) || [];
      // Show topics tagged for "both" plus the viewer's own audience
      const t = all.filter((x) => x.audience === "both" || x.audience === role);
      setTopics(t);
      const { data: threads } = await supabase.from("discussion_threads").select("topic_id");
      const c: Record<string, number> = {};
      (threads || []).forEach((row: any) => { c[row.topic_id] = (c[row.topic_id] || 0) + 1; });
      setCounts(c);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">Discussions</h1>
        <p className="mt-1 text-sm text-muted-foreground">Pick a topic. Start a thread. Help someone else.</p>
      </div>

      {loading ? (
        <CardGridSkeleton count={6} />
      ) : (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {topics.map((t) => (
          <Link key={t.id} to="/community/discussions/$slug" params={{ slug: t.slug }}
            className="group block rounded-xl border border-border bg-card p-5 transition hover:border-gold/40">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-gold" />
                  <h3 className="font-display text-lg font-semibold">{t.name}</h3>
                </div>
                {t.description && <p className="mt-1.5 text-sm text-muted-foreground">{t.description}</p>}
              </div>
              <div className="text-right">
                <p className="font-display text-xl font-bold text-gold">{counts[t.id] || 0}</p>
                <p className="text-xs text-muted-foreground">threads</p>
              </div>
            </div>
            {t.audience !== "both" && (
              <span className="mt-3 inline-block rounded-full border border-border bg-secondary px-2 py-0.5 text-xs text-muted-foreground capitalize">
                {t.audience === "student" ? "Students" : "Parents"}
              </span>
            )}
          </Link>
        ))}
      </div>
      )}
    </div>
  );
}
