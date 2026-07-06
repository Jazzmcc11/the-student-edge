import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, DollarSign, Search, Trophy, Sparkles, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/parent/scholarships")({
  head: () => ({
    meta: [
      { title: "Their scholarships — The Plug" },
      { name: "description", content: "See what your student is chasing and celebrate every win." },
    ],
  }),
  component: ParentScholarships,
});

type Student = { id: string; full_name: string | null; display_name: string | null; email: string | null };
type App = {
  id: string;
  name: string;
  scholarship_id: string | null;
  amount: number | null;
  received: boolean;
  notes: string | null;
  date_applied: string | null;
  created_at: string;
  user_id: string;
};
type Scholarship = { id: string; name: string; amount: number | null; deadline: string | null; category: string | null; link: string | null };


const STATUS_TONE: Record<string, string> = {
  interested: "bg-secondary text-muted-foreground",
  in_progress: "bg-amber-500/15 text-amber-300",
  submitted: "bg-blue-500/15 text-blue-300",
  won: "bg-emerald-500/15 text-emerald-300",
  denied: "bg-rose-500/15 text-rose-300",
};

function ParentScholarships() {
  const [students, setStudents] = useState<Student[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [apps, setApps] = useState<App[]>([]);
  const [scholarships, setScholarships] = useState<Record<string, Scholarship>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: links } = await supabase
        .from("parent_student_links").select("student_id").eq("parent_id", user.id);
      const ids = (links || []).map((l: any) => l.student_id);
      if (!ids.length) { setLoading(false); return; }
      const { data: profs } = await supabase
        .from("profiles").select("id, full_name, display_name, email").in("id", ids);
      const s = (profs as Student[]) || [];
      setStudents(s);
      setActiveId(s[0]?.id || null);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!activeId) return;
    (async () => {
      const { data: rows } = await supabase
        .from("scholarship_applications").select("*").eq("user_id", activeId).order("created_at", { ascending: false });
      const list = (rows as App[]) || [];
      setApps(list);
      const schoIds = list.map(a => a.scholarship_id).filter(Boolean) as string[];
      if (schoIds.length) {
        const { data: sch } = await supabase
          .from("scholarships").select("id, name, amount, deadline, category, link").in("id", schoIds);
        const map: Record<string, Scholarship> = {};
        (sch || []).forEach((x: any) => { map[x.id] = x; });
        setScholarships(map);
      } else {
        setScholarships({});
      }
    })();
  }, [activeId]);

  const active = students.find(s => s.id === activeId);
  const studentName = active?.display_name || active?.full_name?.split(" ")[0] || "your student";

  const won = apps.filter(a => a.received);
  const wonTotal = won.reduce((s, a) => s + (Number(a.amount) || 0), 0);
  const inFlight = apps.filter(a => !a.received);

  return (
    <div className="min-h-screen bg-gradient-night">
      <header className="border-b border-border/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="flex items-center gap-2 text-sm text-gold">
            <Search className="h-4 w-4" /> Their scholarships
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">What {studentName}'s chasing</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            The scholarships they've saved and applied to. Send a nudge from the dashboard when they land one.
          </p>
        </div>

        {students.length > 1 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {students.map((s) => {
              const isActive = s.id === activeId;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveId(s.id)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    isActive ? "border border-gold/40 bg-gold/15 text-gold" : "border border-border bg-card text-muted-foreground hover:text-gold"
                  }`}
                >
                  {s.display_name || s.full_name || s.email}
                </button>
              );
            })}
          </div>
        )}

        <div className="mb-8 grid grid-cols-3 gap-3">
          <MiniStat icon={Trophy} label="Won" value={`$${wonTotal.toLocaleString()}`} highlight />
          <MiniStat icon={Sparkles} label="In flight" value={inFlight.length.toString()} />
          <MiniStat icon={DollarSign} label="Total tracked" value={apps.length.toString()} />
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : !active ? (
          <div className="rounded-2xl border border-dashed border-gold/30 bg-card p-10 text-center">
            <p className="text-muted-foreground">Link a student from the Family page to see their scholarships.</p>
            <Link to="/family"><Button className="mt-4 bg-gold text-primary-foreground hover:bg-gold/90">Go to Family</Button></Link>
          </div>
        ) : apps.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gold/30 bg-card p-10 text-center">
            <Search className="mx-auto h-8 w-8 text-gold" />
            <h2 className="mt-4 font-display text-2xl font-bold">Nothing tracked yet</h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              When {studentName} saves or applies to a scholarship, it'll show up here.
            </p>
            <Link to="/scholarships">
              <Button variant="outline" className="mt-6">Browse the scholarship library yourself</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {apps.map((a) => {
              const s = a.scholarship_id ? scholarships[a.scholarship_id] : null;
              const tone = STATUS_TONE[a.status || "interested"] || STATUS_TONE.interested;
              return (
                <div key={a.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-lg font-semibold">{s?.name || "(scholarship removed)"}</h3>
                        {a.received && <Badge className="bg-emerald-500/20 text-emerald-300">Won 🎉</Badge>}
                        <Badge variant="outline" className={tone}>{(a.status || "interested").replace("_", " ")}</Badge>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {a.amount && <span>${Number(a.amount).toLocaleString()}</span>}
                        {s?.deadline && <span>Due {new Date(s.deadline).toLocaleDateString()}</span>}
                        {s?.category && <span>{s.category}</span>}
                      </div>
                      {a.notes && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{a.notes}</p>}
                    </div>
                    {s?.link && (
                      <a href={s.link} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm"><ExternalLink className="mr-1.5 h-3 w-3" /> Learn more</Button>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, highlight }: { icon: React.ElementType; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "border-gold/40 bg-gold/5" : "border-border bg-card"}`}>
      <Icon className="h-4 w-4 text-gold" />
      <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-0.5 font-display text-xl font-bold ${highlight ? "text-gold" : ""}`}>{value}</p>
    </div>
  );
}
