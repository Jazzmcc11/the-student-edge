import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StudentOnly } from "@/components/student-only";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, Trophy, Check, Plus, Trash2, ExternalLink, Target, ClipboardList, Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  DIVISIONS, NCAA_CHECKLIST, NCAA_CORE_REQUIREMENTS, RECRUITING_STATUSES,
  evaluateD1, evaluateD2,
} from "@/lib/ncaa";

export const Route = createFileRoute("/_authenticated/athlete")({
  head: () => ({ meta: [{ title: "Athlete Hub — The Plug" }] }),
  component: () => (
    <StudentOnly>
      <AthleteHub />
    </StudentOnly>
  ),
});

type AthleteProfile = {
  id?: string;
  user_id: string;
  primary_sport: string | null;
  position: string | null;
  division_target: string | null;
  graduation_year: number | null;
  height: string | null;
  weight: string | null;
  gpa_core: number | null;
  sat_score: number | null;
  act_score: number | null;
  ncaa_id: string | null;
  ncaa_registered: boolean;
  amateurism_certified: boolean;
  transcripts_sent: boolean;
  test_scores_sent: boolean;
  highlight_reel_url: string | null;
  notes: string | null;
};

type CoreCourse = {
  id: string;
  category: string;
  course_name: string;
  year_taken: string | null;
  grade: string | null;
  credits: number | null;
  completed: boolean;
};

type Contact = {
  id: string;
  school_name: string;
  coach_name: string | null;
  coach_email: string | null;
  coach_phone: string | null;
  division: string | null;
  status: string;
  last_contact_at: string | null;
  next_step: string | null;
  notes: string | null;
};

function AthleteHub() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [courses, setCourses] = useState<CoreCourse[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Ensure is_athlete flag is on
      await supabase.from("profiles").update({ is_athlete: true }).eq("id", user.id);

      const [{ data: ap }, { data: cc }, { data: rc }] = await Promise.all([
        supabase.from("athlete_profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("ncaa_core_courses").select("*").eq("user_id", user.id).order("created_at"),
        supabase.from("recruiting_contacts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);

      if (ap) {
        setProfile(ap as any);
      } else {
        // Bootstrap an empty profile
        const empty: AthleteProfile = {
          user_id: user.id,
          primary_sport: null, position: null, division_target: "Undecided",
          graduation_year: null, height: null, weight: null,
          gpa_core: null, sat_score: null, act_score: null, ncaa_id: null,
          ncaa_registered: false, amateurism_certified: false,
          transcripts_sent: false, test_scores_sent: false,
          highlight_reel_url: null, notes: null,
        };
        const { data: inserted } = await supabase.from("athlete_profiles").insert(empty).select().single();
        setProfile((inserted as any) || empty);
      }
      setCourses((cc as any) || []);
      setContacts((rc as any) || []);
      setLoading(false);
    })();
  }, []);

  async function saveProfile(patch: Partial<AthleteProfile>) {
    if (!userId || !profile) return;
    const next = { ...profile, ...patch };
    setProfile(next);
    const { error } = await supabase.from("athlete_profiles").update(patch).eq("user_id", userId);
    if (error) toast.error(error.message);
  }

  async function addCourse(category: string) {
    if (!userId) return;
    const { data, error } = await supabase.from("ncaa_core_courses").insert({
      user_id: userId, category, course_name: "", credits: 1.0,
    }).select().single();
    if (error) return toast.error(error.message);
    setCourses((c) => [...c, data as any]);
  }

  async function updateCourse(id: string, patch: Partial<CoreCourse>) {
    setCourses((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    await supabase.from("ncaa_core_courses").update(patch).eq("id", id);
  }

  async function deleteCourse(id: string) {
    setCourses((cs) => cs.filter((c) => c.id !== id));
    await supabase.from("ncaa_core_courses").delete().eq("id", id);
  }

  async function addContact() {
    if (!userId) return;
    const { data, error } = await supabase.from("recruiting_contacts").insert({
      user_id: userId, school_name: "New school", status: "interested",
    }).select().single();
    if (error) return toast.error(error.message);
    setContacts((c) => [data as any, ...c]);
  }

  async function updateContact(id: string, patch: Partial<Contact>) {
    setContacts((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    await supabase.from("recruiting_contacts").update(patch).eq("id", id);
  }

  async function deleteContact(id: string) {
    setContacts((cs) => cs.filter((c) => c.id !== id));
    await supabase.from("recruiting_contacts").delete().eq("id", id);
  }

  const coreProgress = useMemo(() => {
    const completed = courses.filter((c) => c.completed).length;
    return { completed, total: 16 };
  }, [courses]);

  const d1 = useMemo(() => evaluateD1(profile?.gpa_core ?? null, profile?.sat_score ?? null), [profile]);
  const d2 = useMemo(() => evaluateD2(profile?.gpa_core ?? null, profile?.sat_score ?? null), [profile]);

  if (loading || !profile) {
    return <div className="min-h-screen bg-gradient-night p-8 text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-night">
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-gold">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-gold" />
            <span className="font-display text-lg font-semibold">Athlete Hub</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
        <section>
          <p className="text-xs uppercase tracking-wider text-gold">Playing at the next level</p>
          <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">Your recruiting command center.</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            NCAA eligibility, core-course tracker, and every coach conversation — in one place.
            Fill this in as you go. Nothing here shares publicly.
          </p>
        </section>

        {/* Sport & basics */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 font-display text-xl font-semibold">Your athlete profile</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Primary sport">
              <Input value={profile.primary_sport || ""} onChange={(e) => saveProfile({ primary_sport: e.target.value })} placeholder="Basketball, Football, Track…" />
            </Field>
            <Field label="Position / event">
              <Input value={profile.position || ""} onChange={(e) => saveProfile({ position: e.target.value })} placeholder="Point guard, WR, 400m…" />
            </Field>
            <Field label="Division you're aiming at">
              <select
                value={profile.division_target || "Undecided"}
                onChange={(e) => saveProfile({ division_target: e.target.value })}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Graduation year">
              <Input type="number" value={profile.graduation_year || ""} onChange={(e) => saveProfile({ graduation_year: e.target.value ? Number(e.target.value) : null })} placeholder="2027" />
            </Field>
            <Field label="Height">
              <Input value={profile.height || ""} onChange={(e) => saveProfile({ height: e.target.value })} placeholder={"6'2\""} />
            </Field>
            <Field label="Weight">
              <Input value={profile.weight || ""} onChange={(e) => saveProfile({ weight: e.target.value })} placeholder="185 lb" />
            </Field>
            <Field label="Highlight reel URL">
              <Input value={profile.highlight_reel_url || ""} onChange={(e) => saveProfile({ highlight_reel_url: e.target.value })} placeholder="Hudl / YouTube link" />
            </Field>
            <Field label="NCAA ID (once registered)">
              <Input value={profile.ncaa_id || ""} onChange={(e) => saveProfile({ ncaa_id: e.target.value })} placeholder="0000000000" />
            </Field>
          </div>
        </section>

        {/* Eligibility numbers */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-gold" />
            <h2 className="font-display text-xl font-semibold">Eligibility check</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            The NCAA uses your <strong>core-course GPA</strong> (not your school GPA) and best SAT/ACT.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Field label="Core GPA">
              <Input type="number" step="0.01" value={profile.gpa_core ?? ""} onChange={(e) => saveProfile({ gpa_core: e.target.value ? Number(e.target.value) : null })} placeholder="3.2" />
            </Field>
            <Field label="SAT (EBRW + Math)">
              <Input type="number" value={profile.sat_score ?? ""} onChange={(e) => saveProfile({ sat_score: e.target.value ? Number(e.target.value) : null })} placeholder="1050" />
            </Field>
            <Field label="ACT sum score">
              <Input type="number" value={profile.act_score ?? ""} onChange={(e) => saveProfile({ act_score: e.target.value ? Number(e.target.value) : null })} placeholder="72" />
            </Field>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <EligibilityCard title="D1 sliding scale" verdict={d1.status} message={d1.message} />
            <EligibilityCard title="D2 minimums" verdict={d2.status} message={d2.message} />
          </div>
        </section>

        {/* NCAA checklist */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-gold" />
            <h2 className="font-display text-xl font-semibold">NCAA registration checklist</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Register at the end of junior year at{" "}
            <a href="https://eligibilitycenter.org" target="_blank" rel="noreferrer" className="text-gold hover:underline">
              eligibilitycenter.org <ExternalLink className="inline h-3 w-3" />
            </a>.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <a
              href="https://www.ncaa.org/eligibility-center/initial-eligibility-requirements/division-i/"
              target="_blank" rel="noreferrer"
              className="rounded-lg border border-gold/40 bg-gold/5 p-3 text-sm transition hover:bg-gold/10"
            >
              <p className="font-display font-semibold text-gold">D1 initial-eligibility requirements</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Official NCAA breakdown of core courses, GPA, and test-score rules <ExternalLink className="inline h-3 w-3" />
              </p>
            </a>
            <a
              href="https://www.ncaa.org/eligibility-center/initial-eligibility-requirements/division-ii/"
              target="_blank" rel="noreferrer"
              className="rounded-lg border border-border p-3 text-sm transition hover:border-gold/40"
            >
              <p className="font-display font-semibold">D2 initial-eligibility requirements</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Official NCAA D2 standards <ExternalLink className="inline h-3 w-3" />
              </p>
            </a>
          </div>

          <ul className="mt-4 space-y-2">
            {NCAA_CHECKLIST.map((item) => {
              const checked = Boolean(profile[item.key as keyof AthleteProfile]);
              return (
                <li key={item.key}>
                  <button
                    onClick={() => saveProfile({ [item.key]: !checked } as any)}
                    className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition ${
                      checked ? "border-gold/40 bg-gold/5" : "border-border hover:border-foreground/40"
                    }`}
                  >
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                      checked ? "border-gold bg-gold text-primary-foreground" : "border-border"
                    }`}>
                      {checked && <Check className="h-3 w-3" />}
                    </span>
                    <div>
                      <p className={`text-sm ${checked ? "text-gold" : ""}`}>{item.label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.why}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Core courses */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold">16 core courses</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {coreProgress.completed}/16 completed. D1 needs 16, D2 needs 16.
              </p>
            </div>
            <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
              <div className="h-full bg-gold" style={{ width: `${Math.min(100, (coreProgress.completed / 16) * 100)}%` }} />
            </div>
          </div>

          <div className="mt-5 space-y-5">
            {NCAA_CORE_REQUIREMENTS.map((req, i) => {
              const rows = courses.filter((c) => c.category === req.category);
              return (
                <div key={`${req.category}-${i}`}>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold">
                      {req.label} <span className="text-muted-foreground">· {req.required} required</span>
                    </p>
                    <button onClick={() => addCourse(req.category)} className="inline-flex items-center text-xs text-gold hover:underline">
                      <Plus className="mr-1 h-3 w-3" /> Add course
                    </button>
                  </div>
                  {rows.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Nothing added yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {rows.map((c) => (
                        <div key={c.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background/40 p-2">
                          <button
                            onClick={() => updateCourse(c.id, { completed: !c.completed })}
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                              c.completed ? "border-gold bg-gold text-primary-foreground" : "border-border"
                            }`}
                          >
                            {c.completed && <Check className="h-3 w-3" />}
                          </button>
                          <Input
                            value={c.course_name}
                            onChange={(e) => updateCourse(c.id, { course_name: e.target.value })}
                            placeholder="Course name (e.g. Algebra II)"
                            className="h-8 flex-1 min-w-[180px]"
                          />
                          <select
                            value={c.year_taken || ""}
                            onChange={(e) => updateCourse(c.id, { year_taken: e.target.value })}
                            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                          >
                            <option value="">Year</option>
                            <option value="9">9th</option>
                            <option value="10">10th</option>
                            <option value="11">11th</option>
                            <option value="12">12th</option>
                          </select>
                          <Input
                            value={c.grade || ""}
                            onChange={(e) => updateCourse(c.id, { grade: e.target.value })}
                            placeholder="Grade"
                            className="h-8 w-20"
                          />
                          <button onClick={() => deleteCourse(c.id)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Recruiting contacts */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gold" />
              <h2 className="font-display text-xl font-semibold">Recruiting contacts</h2>
            </div>
            <Button size="sm" onClick={addContact} className="bg-gold text-primary-foreground hover:bg-gold/90">
              <Plus className="mr-1.5 h-4 w-4" /> Add school
            </Button>
          </div>
          {contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Every school that's shown interest — or that you're chasing — goes here. Coaches, emails, next step.
            </p>
          ) : (
            <div className="space-y-3">
              {contacts.map((c) => (
                <div key={c.id} className="rounded-xl border border-border bg-background/40 p-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="School">
                      <Input value={c.school_name} onChange={(e) => updateContact(c.id, { school_name: e.target.value })} />
                    </Field>
                    <Field label="Coach">
                      <Input value={c.coach_name || ""} onChange={(e) => updateContact(c.id, { coach_name: e.target.value })} placeholder="Coach name" />
                    </Field>
                    <Field label="Email">
                      <Input value={c.coach_email || ""} onChange={(e) => updateContact(c.id, { coach_email: e.target.value })} placeholder="coach@school.edu" />
                    </Field>
                    <Field label="Phone">
                      <Input value={c.coach_phone || ""} onChange={(e) => updateContact(c.id, { coach_phone: e.target.value })} />
                    </Field>
                    <Field label="Division">
                      <select
                        value={c.division || ""}
                        onChange={(e) => updateContact(c.id, { division: e.target.value })}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">—</option>
                        {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </Field>
                    <Field label="Status">
                      <select
                        value={c.status}
                        onChange={(e) => updateContact(c.id, { status: e.target.value })}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        {RECRUITING_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                      </select>
                    </Field>
                    <Field label="Last contact">
                      <Input type="date" value={c.last_contact_at || ""} onChange={(e) => updateContact(c.id, { last_contact_at: e.target.value || null })} />
                    </Field>
                    <Field label="Next step">
                      <Input value={c.next_step || ""} onChange={(e) => updateContact(c.id, { next_step: e.target.value })} placeholder="Send film, campus visit…" />
                    </Field>
                  </div>
                  <div className="mt-3 flex items-start gap-2">
                    <Textarea
                      value={c.notes || ""}
                      onChange={(e) => updateContact(c.id, { notes: e.target.value })}
                      rows={2}
                      placeholder="Notes — what they said, vibe, anything to remember"
                      className="flex-1"
                    />
                    <button onClick={() => deleteContact(c.id)} className="text-muted-foreground hover:text-destructive" aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-dashed border-border bg-card/50 p-6">
          <h3 className="font-display text-lg font-semibold">Notes to self</h3>
          <Textarea
            value={profile.notes || ""}
            onChange={(e) => saveProfile({ notes: e.target.value })}
            rows={4}
            placeholder="Camps to hit, film to cut, questions for your coach…"
            className="mt-3"
          />
        </section>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function EligibilityCard({ title, verdict, message }: { title: string; verdict: string; message: string }) {
  const color =
    verdict === "qualifier" ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-400"
    : verdict === "close" ? "border-gold/40 bg-gold/5 text-gold"
    : verdict === "non_qualifier" ? "border-rose-500/40 bg-rose-500/5 text-rose-400"
    : "border-border bg-background/40 text-muted-foreground";
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <p className="text-xs uppercase tracking-wider">{title}</p>
      <p className="mt-2 text-sm">{message}</p>
    </div>
  );
}
