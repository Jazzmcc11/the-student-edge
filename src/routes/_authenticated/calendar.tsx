import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar as CalendarIcon, ExternalLink, MapPin, BellRing } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { refreshMyReminders } from "@/lib/reminders.functions";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({ meta: [{ title: "Deadline Calendar — The Plug" }] }),
  component: CalendarPage,
});

type KeyDate = {
  id: string;
  title: string;
  description: string | null;
  category: "fafsa" | "scholarship" | "college" | "test" | "financial_aid";
  date: string;
  state: string | null;
  url: string | null;
  source: string | null;
};

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "fafsa", label: "FAFSA" },
  { key: "financial_aid", label: "State Aid" },
  { key: "college", label: "College" },
  { key: "test", label: "SAT / ACT" },
  { key: "scholarship", label: "Scholarship" },
] as const;

const CAT_COLOR: Record<string, string> = {
  fafsa: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  financial_aid: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  college: "bg-gold/15 text-gold border-gold/30",
  test: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
  scholarship: "bg-amber-500/15 text-amber-300 border-amber-500/30",
};

const STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

function CalendarPage() {
  const [dates, setDates] = useState<KeyDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState<string>("all");
  const [state, setState] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data: prof } = await supabase.from("profiles").select("state").eq("id", user.id).maybeSingle();
      if ((prof as any)?.state) setState((prof as any).state);
      const { data, error } = await (supabase as any)
        .from("key_dates")
        .select("*")
        .gte("date", new Date().toISOString().slice(0, 10))
        .order("date", { ascending: true });
      if (error) toast.error(error.message);
      setDates((data as KeyDate[]) ?? []);
      setLoading(false);
    })();
  }, []);

  async function saveState(newState: string) {
    setState(newState);
    if (!userId) return;
    const val = newState || null;
    await supabase.from("profiles").update({ state: val } as any).eq("id", userId);
    toast.success(val ? `State set to ${val}` : "State cleared");
  }

  const filtered = useMemo(() => {
    return dates.filter((d) => {
      if (cat !== "all" && d.category !== cat) return false;
      // state filter: show federal (null state) always; show state-specific only if matching
      if (d.state && state && d.state !== state) return false;
      if (d.state && !state) return true; // no preference -> show all
      return true;
    });
  }, [dates, cat, state]);

  const grouped = useMemo(() => {
    const map = new Map<string, KeyDate[]>();
    for (const d of filtered) {
      const key = new Date(d.date + "T00:00:00").toLocaleString("en-US", { month: "long", year: "numeric" });
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="min-h-screen bg-gradient-night">
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-2 text-sm text-gold">Deadlines</div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight">Key Dates Calendar</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              FAFSA, college application milestones, SAT/ACT test dates, and state financial aid deadlines — all in one place.
            </p>
          </div>
          <RefreshRemindersButton />
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCat(c.key)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  cat === c.key
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-border text-muted-foreground hover:border-gold/40 hover:text-gold"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Select value={state || "ALL"} onValueChange={(v) => saveState(v === "ALL" ? "" : v)}>
              <SelectTrigger className="h-9 w-[150px]"><SelectValue placeholder="Your state" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All states</SelectItem>
                {STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8 space-y-8">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading deadlines…</p>
          ) : grouped.length === 0 ? (
            <EmptyState
              icon={CalendarIcon}
              title="No deadlines match your filters"
              description="Try a different category or clear the state filter."
            />
          ) : (
            grouped.map(([month, items]) => (
              <section key={month}>
                <h2 className="mb-3 font-display text-lg font-semibold text-muted-foreground">{month}</h2>
                <div className="space-y-2">
                  {items.map((d) => <DateRow key={d.id} d={d} />)}
                </div>
              </section>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function DateRow({ d }: { d: KeyDate }) {
  const dt = new Date(d.date + "T00:00:00");
  const day = dt.getDate();
  const weekday = dt.toLocaleString("en-US", { weekday: "short" });
  const daysOut = Math.ceil((dt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const Wrap: any = d.url ? "a" : "div";
  const wrapProps: any = d.url ? { href: d.url, target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <Wrap
      {...wrapProps}
      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-gold/40"
    >
      <div className="flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-secondary/40 ring-1 ring-border">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{weekday}</span>
        <span className="font-display text-xl font-bold leading-none">{day}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-semibold">{d.title}</p>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${CAT_COLOR[d.category]}`}>
            {d.category === "financial_aid" ? "State Aid" : d.category.toUpperCase()}
          </span>
          {d.state && (
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">{d.state}</span>
          )}
        </div>
        {d.description && <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{d.description}</p>}
      </div>
      <div className="hidden text-right sm:block">
        <p className="text-xs text-muted-foreground">
          {daysOut <= 0 ? "Today" : `in ${daysOut} day${daysOut === 1 ? "" : "s"}`}
        </p>
        {d.url && (
          <span className="mt-1 inline-flex items-center gap-1 text-xs text-gold opacity-0 transition-opacity group-hover:opacity-100">
            Open <ExternalLink className="h-3 w-3" />
          </span>
        )}
      </div>
    </Wrap>
  );
}

function RefreshRemindersButton() {
  const refresh = useServerFn(refreshMyReminders);
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const res = await refresh({ data: undefined } as any);
          toast.success(
            res?.created
              ? `Queued ${res.created} new reminder${res.created === 1 ? "" : "s"}`
              : "You're all caught up",
          );
        } catch (e: any) {
          toast.error(e?.message ?? "Couldn't refresh reminders");
        } finally {
          setBusy(false);
        }
      }}
    >
      <BellRing className="mr-2 h-4 w-4" />
      {busy ? "Refreshing…" : "Refresh reminders"}
    </Button>
  );
}
