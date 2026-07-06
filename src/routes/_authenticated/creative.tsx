import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listBoards, listBoardPins } from "@/lib/pinterest.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { pingActivity } from "@/lib/personalization";
import { ArrowLeft, ExternalLink, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { StudentOnly } from "@/components/student-only";

export const Route = createFileRoute("/_authenticated/creative")({
  head: () => ({
    meta: [
      { title: "Creative Resources — The Plug" },
      { name: "description", content: "Grad templates, senior year inspo, HOCO and event ideas — curated boards from Pinterest." },
    ],
  }),
  component: () => <StudentOnly><Creative /></StudentOnly>,
});

type Board = { id: string; name: string; description: string | null; pinCount: number; cover: string | null };
type Pin = { id: string; title: string | null; description: string | null; link: string | null; image: string | null; width: number | null; height: number | null };

function Creative() {
  const getBoards = useServerFn(listBoards);
  const getPins = useServerFn(listBoardPins);

  const [boards, setBoards] = useState<Board[] | null>(null);
  const [boardsErr, setBoardsErr] = useState<string | null>(null);
  const [active, setActive] = useState<Board | null>(null);
  const [pins, setPins] = useState<Pin[] | null>(null);
  const [pinsLoading, setPinsLoading] = useState(false);

  useEffect(() => {
    pingActivity("creative");
    loadBoards();
  }, []);

  async function loadBoards() {
    setBoardsErr(null);
    setBoards(null);
    try {
      const res = await getBoards();
      setBoards(res.boards);
      if (res.boards[0]) openBoard(res.boards[0]);
    } catch (e) {
      setBoardsErr(e instanceof Error ? e.message : "Failed to load boards");
    }
  }

  async function openBoard(b: Board) {
    setActive(b);
    setPins(null);
    setPinsLoading(true);
    try {
      const res = await getPins({ data: { boardId: b.id } });
      setPins(res.pins);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load pins");
      setPins([]);
    } finally {
      setPinsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-night">
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <Button variant="ghost" size="sm" onClick={loadBoards}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex items-start gap-3">
          <div className="rounded-lg bg-gold/10 p-2 text-gold">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">Creative Resources</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Grad templates, senior year guides, HOCO + event inspo. Live from Pinterest.
            </p>
          </div>
        </div>

        {/* Boards rail */}
        {boardsErr ? (
          <Card className="border-destructive/40 bg-destructive/5 p-6">
            <p className="font-medium text-destructive">Couldn't load Pinterest boards</p>
            <p className="mt-1 text-sm text-muted-foreground">{boardsErr}</p>
            <Button className="mt-4" size="sm" variant="outline" onClick={loadBoards}>
              Try again
            </Button>
          </Card>
        ) : !boards ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-40 shrink-0 rounded-lg" />
            ))}
          </div>
        ) : boards.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No boards yet"
            description="Add a few boards to the connected Pinterest account and they'll show up here."
          />
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-3">
            {boards.map((b) => {
              const isActive = active?.id === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => openBoard(b)}
                  className={`group relative h-24 w-44 shrink-0 overflow-hidden rounded-lg border text-left transition ${
                    isActive ? "border-gold shadow-gold" : "border-border/60 hover:border-gold/60"
                  }`}
                >
                  {b.cover ? (
                    <img src={b.cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60 transition group-hover:opacity-80" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-burnt/30 to-maroon/30" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-2">
                    <p className="line-clamp-1 text-sm font-semibold text-white">{b.name}</p>
                    <p className="text-[11px] text-white/70">{b.pinCount} pins</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Pins grid */}
        {active && (
          <section className="mt-8">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="font-display text-xl font-bold">{active.name}</h2>
              {active.description && (
                <p className="hidden text-sm text-muted-foreground sm:block">{active.description}</p>
              )}
            </div>

            {pinsLoading ? (
              <div className="columns-2 gap-4 sm:columns-3 md:columns-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="mb-4 h-48 w-full rounded-lg" style={{ height: 120 + (i % 4) * 40 }} />
                ))}
              </div>
            ) : !pins || pins.length === 0 ? (
              <EmptyState icon={Sparkles} title="No pins on this board yet" description="Add some inspo on Pinterest and refresh." />
            ) : (
              <div className="columns-2 gap-4 sm:columns-3 md:columns-4">
                {pins.map((p) => (
                  <a
                    key={p.id}
                    href={p.link ?? `https://www.pinterest.com/pin/${p.id}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative mb-4 block overflow-hidden rounded-lg border border-border/40 bg-card transition hover:border-gold/60 hover:shadow-gold"
                  >
                    {p.image ? (
                      <img src={p.image} alt={p.title ?? ""} loading="lazy" className="w-full" />
                    ) : (
                      <div className="aspect-square bg-muted" />
                    )}
                    {(p.title || p.description) && (
                      <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 text-white transition group-hover:translate-y-0">
                        {p.title && <p className="line-clamp-2 text-xs font-semibold">{p.title}</p>}
                        <p className="mt-1 flex items-center gap-1 text-[10px] text-white/70">
                          Open on Pinterest <ExternalLink className="h-3 w-3" />
                        </p>
                      </div>
                    )}
                  </a>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
