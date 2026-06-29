import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { searchColleges, type CollegeResult } from "@/lib/colleges.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { pingActivity } from "@/lib/personalization";
import { ArrowLeft, Search, MapPin, Users, Percent, DollarSign, Plus, ExternalLink, GraduationCap } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/colleges")({
  head: () => ({
    meta: [
      { title: "Explore colleges — The Plug" },
      { name: "description", content: "Search real US colleges with admit rates, cost, and size from the Dept of Education." },
    ],
  }),
  component: Colleges,
});

const STATES = ["", "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];

function fmtPct(v: number | null) { return v == null ? "—" : `${Math.round(v * 100)}%`; }
function fmtMoney(v: number | null) { return v == null ? "—" : `$${Math.round(v).toLocaleString()}`; }
function fmtNum(v: number | null) { return v == null ? "—" : v.toLocaleString(); }

function Colleges() {
  const search = useServerFn(searchColleges);
  const [q, setQ] = useState("");
  const [state, setState] = useState("");
  const [hbcuOnly, setHbcuOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [results, setResults] = useState<CollegeResult[] | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<number | null>(null);

  useEffect(() => { pingActivity("colleges"); run(); }, []);

  async function run(p = 0) {
    setLoading(true);
    setPage(p);
    try {
      const res = await search({ data: { q: q || undefined, state: state || undefined, hbcuOnly, page: p } });
      setResults(res.results);
      setTotal(res.total);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function addToList(c: CollegeResult) {
    setAdding(c.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in first");
      const { error } = await supabase.from("college_applications").insert({
        user_id: user.id,
        college_name: c.name,
        notes: `${c.city}, ${c.state}${c.hbcu ? " · HBCU" : ""}`,
      });
      if (error) throw error;
      toast.success(`Added ${c.name} to your tracker`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't add");
    } finally {
      setAdding(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-night">
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <Link to="/tracker/colleges" className="text-sm text-gold hover:underline">My college list →</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-start gap-3">
          <div className="rounded-lg bg-gold/10 p-2 text-gold"><GraduationCap className="h-6 w-6" /></div>
          <div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">Explore colleges</h1>
            <p className="mt-1 text-sm text-muted-foreground">Real data from the US Dept of Education. Add any to your tracker.</p>
          </div>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); run(0); }}
          className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Howard, Spelman, UT Austin…" className="pl-9" />
          </div>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {STATES.map((s) => <option key={s} value={s}>{s || "All states"}</option>)}
          </select>
          <label className="flex h-10 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm">
            <input type="checkbox" checked={hbcuOnly} onChange={(e) => setHbcuOnly(e.target.checked)} className="accent-gold" />
            HBCU only
          </label>
          <Button type="submit" disabled={loading}>{loading ? "Searching…" : "Search"}</Button>
        </form>

        {loading && !results ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-lg" />)}
          </div>
        ) : !results || results.length === 0 ? (
          <EmptyState icon={Search} title="No matches" description="Try a different name, state, or remove the HBCU filter." />
        ) : (
          <>
            <p className="mb-3 text-xs text-muted-foreground">{total.toLocaleString()} schools match</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {results.map((c) => (
                <Card key={c.id} className="flex flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-lg font-bold leading-tight">{c.name}</h3>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {c.city}, {c.state}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {c.hbcu && <Badge className="bg-gold text-primary-foreground">HBCU</Badge>}
                      {c.ownership && <Badge variant="outline" className="capitalize">{c.ownership}</Badge>}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <Stat icon={Percent} label="Admit" value={fmtPct(c.admissionRate)} />
                    <Stat icon={Users} label="Students" value={fmtNum(c.size)} />
                    <Stat icon={DollarSign} label="Cost/yr" value={fmtMoney(c.cost ?? c.tuitionIn)} />
                  </div>

                  <div className="mt-auto flex items-center gap-2">
                    <Button size="sm" onClick={() => addToList(c)} disabled={adding === c.id} className="flex-1">
                      <Plus className="mr-1 h-4 w-4" /> {adding === c.id ? "Adding…" : "Add to my list"}
                    </Button>
                    {c.url && (
                      <a href={c.url.startsWith("http") ? c.url : `https://${c.url}`} target="_blank" rel="noopener noreferrer"
                         className="inline-flex h-9 items-center gap-1 rounded-md border border-input px-3 text-xs hover:bg-accent">
                        Site <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <Button variant="outline" size="sm" disabled={page === 0 || loading} onClick={() => run(page - 1)}>← Prev</Button>
              <span className="text-xs text-muted-foreground">Page {page + 1}</span>
              <Button variant="outline" size="sm" disabled={loading || (page + 1) * 20 >= total} onClick={() => run(page + 1)}>Next →</Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Percent; label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/40 bg-card/50 p-2">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-0.5 font-semibold">{value}</div>
    </div>
  );
}
