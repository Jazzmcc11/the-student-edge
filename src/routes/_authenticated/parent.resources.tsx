import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bookmark, BookmarkCheck, Clock, PenLine, Users } from "lucide-react";
import { ARTICLES, ARTICLE_CATEGORIES, type ArticleCategory, type ParentArticle } from "@/lib/parent-articles";
import { fetchApprovedSubmissions, aboutGradeLabel, ABOUT_GRADE_OPTIONS, type ParentSubmittedArticle } from "@/lib/parent-submissions";
import { ParentSubmissionModal } from "@/components/parent-submission-modal";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/parent/resources")({
  head: () => ({ meta: [{ title: "Parent resources — The Plug" }] }),
  component: ParentResourcesPage,
});

function ParentResourcesPage() {
  const navigate = useNavigate();
  const [me, setMe] = useState<string | null>(null);
  const [myName, setMyName] = useState<string>("");
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<ArticleCategory | "all" | "saved" | "fubu">("all");
  const [reading, setReading] = useState<ParentArticle | null>(null);
  const [submissions, setSubmissions] = useState<ParentSubmittedArticle[]>([]);
  const [showSubmit, setShowSubmit] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: prof } = await supabase.from("profiles").select("user_type, full_name").eq("id", user.id).maybeSingle();
      if (prof?.user_type !== "parent") { toast.error("Parent-only area"); navigate({ to: "/dashboard" }); return; }
      setMe(user.id);
      setMyName(prof?.full_name ?? "");
      const { data } = await supabase.from("parent_saved_articles").select("article_slug").eq("parent_id", user.id);
      setSaved(new Set((data || []).map((r: any) => r.article_slug)));
      loadSubmissions();
    })();
  }, [navigate]);

  async function loadSubmissions() {
    try { setSubmissions(await fetchApprovedSubmissions()); } catch { /* silent */ }
  }

  async function toggleSave(slug: string) {
    if (!me) return;
    if (saved.has(slug)) {
      await supabase.from("parent_saved_articles").delete().eq("parent_id", me).eq("article_slug", slug);
      const n = new Set(saved); n.delete(slug); setSaved(n);
    } else {
      const { error } = await supabase.from("parent_saved_articles").insert({ parent_id: me, article_slug: slug });
      if (error) return toast.error(error.message);
      setSaved(new Set(saved).add(slug));
      toast.success("Saved");
    }
  }

  const list = useMemo(() => {
    if (filter === "all") return ARTICLES;
    if (filter === "saved") return ARTICLES.filter((a) => saved.has(a.slug));
    if (filter === "fubu") return [];
    return ARTICLES.filter((a) => a.category === filter);
  }, [filter, saved]);

  const showFubuSection = filter === "all" || filter === "fubu";

  // Adapt submissions to ParentArticle shape for the reader
  function submissionToArticle(s: ParentSubmittedArticle): ParentArticle {
    return {
      slug: `sub-${s.id}`,
      title: s.title,
      blurb: s.blurb,
      category: (s.category as ArticleCategory) ?? "senior-year",
      readMinutes: Math.max(2, Math.round(s.body.split(/\s+/).length / 200)),
      emoji: "💬",
      gradient: "from-gold/20 via-amber-500/10 to-transparent",
      body: s.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
    };
  }

  return (
    <div className="min-h-screen bg-gradient-night">
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold"><ArrowLeft className="h-4 w-4" /> Dashboard</Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gold">For you</p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">The parent lounge</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Real talk on paying for college, throwing a grad party that doesn't wreck your budget, and staying sane senior year. Save what's useful, skip what's not.
            </p>
          </div>
          {me && (
            <Button onClick={() => setShowSubmit(true)} className="shrink-0">
              <PenLine className="mr-1.5 h-4 w-4" /> Share your wisdom
            </Button>
          )}
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <Pill active={filter === "all"} onClick={() => setFilter("all")}>All</Pill>
          <Pill active={filter === "fubu"} onClick={() => setFilter("fubu")}>
            <Users className="mr-1 h-3.5 w-3.5" /> From other parents {submissions.length > 0 && `(${submissions.length})`}
          </Pill>
          <Pill active={filter === "saved"} onClick={() => setFilter("saved")}>
            <BookmarkCheck className="mr-1 h-3.5 w-3.5" /> Saved {saved.size > 0 && `(${saved.size})`}
          </Pill>
          {ARTICLE_CATEGORIES.map((c) => (
            <Pill key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>{c.label}</Pill>
          ))}
        </div>

        {showFubuSection && (
          <section className="mb-10">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-display text-lg font-semibold">From other parents · FUBU</h2>
              <p className="text-xs text-muted-foreground">Written by parents in the community</p>
            </div>
            {submissions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                No community pieces published yet. Be the first — hit <span className="text-gold">Share your wisdom</span> up top.
              </div>
            ) : (
              <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
                {submissions.map((s) => (
                  <SubmissionCard key={s.id} sub={s} onOpen={() => setReading(submissionToArticle(s))} />
                ))}
              </div>
            )}
          </section>
        )}

        {filter !== "fubu" && (
          <>
            {list.length > 0 && (
              <h2 className="mb-3 font-display text-lg font-semibold">
                {filter === "saved" ? "Your saved articles" : "From the editors"}
              </h2>
            )}
            {list.length === 0 && filter === "saved" ? (
              <p className="text-sm text-muted-foreground">Nothing saved yet — tap the bookmark on any article to save it here.</p>
            ) : (
              <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
                {list.map((a) => (
                  <ArticleCard key={a.slug} article={a} saved={saved.has(a.slug)} onSave={() => toggleSave(a.slug)} onOpen={() => setReading(a)} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {reading && (
        <ReaderModal article={reading} saved={saved.has(reading.slug)} onSave={() => toggleSave(reading.slug)} onClose={() => setReading(null)} />
      )}
      {showSubmit && me && (
        <ParentSubmissionModal userId={me} defaultName={myName} onClose={() => setShowSubmit(false)} onSubmitted={loadSubmissions} />
      )}
    </div>
  );
}

function Pill({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-sm transition ${active ? "border border-gold/40 bg-gold/15 text-gold" : "border border-border bg-card text-muted-foreground hover:text-gold"}`}>
      {children}
    </button>
  );
}

function ArticleCard({ article, saved, onSave, onOpen }: { article: ParentArticle; saved: boolean; onSave: () => void; onOpen: () => void }) {
  return (
    <div className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-border bg-card transition hover:border-gold/40">
      <button onClick={onOpen} className={`block w-full bg-gradient-to-br ${article.gradient} p-6 text-left`}>
        <div className="text-4xl">{article.emoji}</div>
        <h3 className="mt-4 font-display text-lg font-semibold leading-snug">{article.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{article.blurb}</p>
      </button>
      <div className="flex items-center justify-between border-t border-border/50 px-5 py-3">
        <span className="inline-flex items-center text-xs text-muted-foreground">
          <Clock className="mr-1 h-3 w-3" /> {article.readMinutes} min read
        </span>
        <button onClick={onSave} aria-label={saved ? "Unsave" : "Save"} className={saved ? "text-gold" : "text-muted-foreground hover:text-gold"}>
          {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function SubmissionCard({ sub, onOpen }: { sub: ParentSubmittedArticle; onOpen: () => void }) {
  return (
    <div className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-gold/30 bg-card transition hover:border-gold/60">
      <button onClick={onOpen} className="block w-full bg-gradient-to-br from-gold/15 via-amber-500/5 to-transparent p-6 text-left">
        <div className="text-4xl">💬</div>
        <h3 className="mt-4 font-display text-lg font-semibold leading-snug">{sub.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{sub.blurb}</p>
      </button>
      <div className="border-t border-border/50 px-5 py-3 text-xs text-muted-foreground">
        <span className="text-gold">— {sub.author_display_name}</span>
        {sub.author_child_grade && <span> · parent of {sub.author_child_grade}</span>}
      </div>
    </div>
  );
}

function ReaderModal({ article, saved, onSave, onClose }: { article: ParentArticle; saved: boolean; onSave: () => void; onClose: () => void }) {
  const isSubmission = article.slug.startsWith("sub-");
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="sticky top-0 z-10 -mx-4 flex items-center justify-between border-b border-border/40 bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          <Button size="sm" variant="ghost" onClick={onClose}><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button>
          {!isSubmission && (
            <Button size="sm" variant="ghost" onClick={onSave} className={saved ? "text-gold" : ""}>
              {saved ? <><BookmarkCheck className="mr-1.5 h-4 w-4" /> Saved</> : <><Bookmark className="mr-1.5 h-4 w-4" /> Save</>}
            </Button>
          )}
        </div>
        <article className="py-8">
          <div className={`mb-6 rounded-2xl bg-gradient-to-br ${article.gradient} p-8 text-center`}>
            <div className="text-6xl">{article.emoji}</div>
          </div>
          <p className="text-sm uppercase tracking-wider text-gold">{ARTICLE_CATEGORIES.find((c) => c.id === article.category)?.label ?? "From other parents"}</p>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{article.title}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{article.blurb}</p>
          <div className="mt-8 space-y-4 leading-relaxed text-foreground/90">
            {(article.body || []).map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </article>
      </div>
    </div>
  );
}
