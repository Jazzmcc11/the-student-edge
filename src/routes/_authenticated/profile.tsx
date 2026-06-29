import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/components/theme-provider";
import { AvatarBadge } from "@/components/avatar-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Check, Sparkles, Users, Heart } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Your Profile — The Plug" }] }),
  component: ProfilePage,
});

const ACCENTS: { key: "gold" | "burnt" | "maroon" | "navy"; label: string; swatch: string }[] = [
  { key: "gold", label: "Gold", swatch: "#C9A84C" },
  { key: "burnt", label: "Burnt Orange", swatch: "#BF5700" },
  { key: "maroon", label: "Maroon", swatch: "#7a1a1a" },
  { key: "navy", label: "Navy", swatch: "#1B2A4A" },
];

const PLAYLISTS = [
  { key: "hbcu", label: "HBCU Battle of the Bands" },
  { key: "studybeats", label: "Lo-fi Study Beats" },
  { key: "hype", label: "Hype / Gameday" },
  { key: "off", label: "No music, thanks" },
];

const RELATIONSHIPS = ["Mom", "Dad", "Stepparent", "Guardian", "Grandparent", "Aunt/Uncle", "Other"];
const PARENT_FOCUS = [
  { key: "stay_informed", label: "Stay informed without nagging" },
  { key: "app_help", label: "Help with college applications" },
  { key: "money", label: "Find scholarships & financial aid" },
  { key: "emotional", label: "Emotional support for senior year" },
  { key: "calendar", label: "Keep deadlines straight" },
  { key: "community", label: "Connect with other parents" },
];
const PARENT_STYLES = [
  { key: "hands_on", label: "Hands-on", sub: "Side-by-side, full involvement" },
  { key: "coach", label: "Coach from the sideline", sub: "Check in, advise, let them drive" },
  { key: "hype", label: "Hype squad", sub: "Cheer loud, only step in when asked" },
  { key: "logistics", label: "Logistics lead", sub: "Deadlines & paperwork, they do the rest" },
];
const FREQS = ["Daily nudges", "Weekly digest", "Only big moments"];

function ProfilePage() {
  const { accent, setAccent, themeMode, setThemeMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState<"student" | "parent">("student");
  const [linkedCount, setLinkedCount] = useState(0);

  // shared fields
  const [base, setBase] = useState({ display_name: "", pronouns: "", bio: "" });

  // student-only
  const [student, setStudent] = useState({
    school: "",
    grade_level: "" as string,
    playlist_pref: "hbcu",
  });
  const [goals, setGoals] = useState({
    target_colleges: "",
    intended_majors: "",
    interests: "",
    career_paths: "",
  });

  // parent-only
  const [parent, setParent] = useState({
    relationship: "",
    household_students: "" as string,
    focus: [] as string[],
    style: "",
    update_freq: "Weekly digest",
  });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      setEmail(user.email || "");

      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (prof) {
        setUserType((prof.user_type as "student" | "parent") || "student");
        setBase({
          display_name: prof.display_name || prof.full_name || "",
          pronouns: prof.pronouns || "",
          bio: prof.bio || "",
        });
        setStudent({
          school: prof.school || "",
          grade_level: prof.grade_level?.toString() || "",
          playlist_pref: prof.playlist_pref || "hbcu",
        });
        setParent({
          relationship: prof.parent_relationship || "",
          household_students: prof.parent_household_students?.toString() || "",
          focus: prof.parent_focus || [],
          style: prof.parent_style || "",
          update_freq: prof.parent_update_freq || "Weekly digest",
        });

        if (prof.user_type === "parent") {
          const { count } = await supabase
            .from("parent_student_links")
            .select("*", { count: "exact", head: true })
            .eq("parent_id", user.id);
          setLinkedCount(count || 0);
        } else {
          const { data: g } = await supabase.from("user_goals").select("*").eq("user_id", user.id).maybeSingle();
          if (g) {
            setGoals({
              target_colleges: (g.target_colleges || []).join(", "),
              intended_majors: (g.intended_majors || []).join(", "),
              interests: (g.interests || []).join(", "),
              career_paths: (g.career_paths || []).join(", "),
            });
          }
        }
      }
      setLoading(false);
    })();
  }, []);

  async function save() {
    if (!userId) return;
    const schema = z.object({
      display_name: z.string().trim().max(60).optional().or(z.literal("")),
      pronouns: z.string().trim().max(30).optional().or(z.literal("")),
      bio: z.string().trim().max(280).optional().or(z.literal("")),
    });
    if (!schema.safeParse(base).success) {
      toast.error("Check your inputs");
      return;
    }
    setSaving(true);
    const splitCsv = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

    const update = {
      display_name: base.display_name || null,
      pronouns: base.pronouns || null,
      bio: base.bio || null,
      ...(userType === "parent"
        ? {
            parent_relationship: parent.relationship || null,
            parent_household_students: parent.household_students ? Number(parent.household_students) : null,
            parent_focus: parent.focus,
            parent_style: parent.style || null,
            parent_update_freq: parent.update_freq || null,
          }
        : {
            school: student.school || null,
            grade_level: student.grade_level ? Number(student.grade_level) : null,
            playlist_pref: student.playlist_pref,
          }),
    };

    const profileRes = await supabase.from("profiles").update(update).eq("id", userId);
    const goalsRes =
      userType === "student"
        ? await supabase.from("user_goals").upsert({
            user_id: userId,
            target_colleges: splitCsv(goals.target_colleges),
            intended_majors: splitCsv(goals.intended_majors),
            interests: splitCsv(goals.interests),
            career_paths: splitCsv(goals.career_paths),
          })
        : { error: null };
    const results = [profileRes, goalsRes];
    setSaving(false);
    if (results.some((r) => r.error)) return toast.error("Couldn't save. Try again.");
    toast.success("Profile saved");
  }

  function toggleFocus(key: string) {
    setParent((p) => ({
      ...p,
      focus: p.focus.includes(key) ? p.focus.filter((k) => k !== key) : [...p.focus, key],
    }));
  }

  if (loading) {
    return <div className="min-h-screen bg-background p-8 text-muted-foreground">Loading…</div>;
  }

  const isParent = userType === "parent";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-gold">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Dashboard
          </Link>
          <span className="font-display text-lg font-bold">{isParent ? "Parent profile" : "Your profile"}</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 space-y-10">
        {/* Identity */}
        <section className="flex items-center gap-5">
          <AvatarBadge name={base.display_name || email} size="xl" />
          <div>
            <h1 className="font-display text-3xl font-bold">{base.display_name || "Add a display name"}</h1>
            <p className="text-sm text-muted-foreground">{email}</p>
            {isParent && (
              <p className="mt-1 text-xs uppercase tracking-wider text-gold">Parent account</p>
            )}
          </div>
        </section>

        {/* Basics — shared */}
        <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-semibold">Basics</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={isParent ? "What your kid calls you here" : "Display name"}>
              <Input
                value={base.display_name}
                onChange={(e) => setBase({ ...base, display_name: e.target.value })}
                placeholder={isParent ? "e.g. Mama J, Pops" : "What we call you"}
              />
            </Field>
            <Field label="Pronouns">
              <Input
                value={base.pronouns}
                onChange={(e) => setBase({ ...base, pronouns: e.target.value })}
                placeholder="she/her, he/him, they/them…"
              />
            </Field>
            {!isParent && (
              <>
                <Field label="School">
                  <Input
                    value={student.school}
                    onChange={(e) => setStudent({ ...student, school: e.target.value })}
                    placeholder="Your high school"
                  />
                </Field>
                <Field label="Grade level">
                  <select
                    value={student.grade_level}
                    onChange={(e) => setStudent({ ...student, grade_level: e.target.value })}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">—</option>
                    <option value="9">9th</option>
                    <option value="10">10th</option>
                    <option value="11">11th</option>
                    <option value="12">12th</option>
                  </select>
                </Field>
              </>
            )}
          </div>
          <Field label={isParent ? "About you" : "Bio"}>
            <Textarea
              value={base.bio}
              onChange={(e) => setBase({ ...base, bio: e.target.value })}
              maxLength={280}
              rows={3}
              placeholder={
                isParent
                  ? "One line so other parents know who they're talking to. 280 chars."
                  : "One line about you. 280 chars."
              }
            />
          </Field>
        </section>

        {isParent ? (
          <>
            {/* Parent — Family */}
            <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gold" />
                <h2 className="font-display text-xl font-semibold">Your family</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="You are their…">
                  <div className="flex flex-wrap gap-2">
                    {RELATIONSHIPS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setParent({ ...parent, relationship: r })}
                        className={`rounded-full border px-3 py-1.5 text-sm transition ${
                          parent.relationship === r
                            ? "border-gold bg-gold/10 text-gold"
                            : "border-border text-muted-foreground hover:border-foreground/40"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Students in your household">
                  <select
                    value={parent.household_students}
                    onChange={(e) => setParent({ ...parent, household_students: e.target.value })}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">—</option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n}{n === 5 ? "+" : ""}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="rounded-lg border border-dashed border-border bg-background/40 p-4 text-sm">
                <p className="text-muted-foreground">
                  {linkedCount === 0
                    ? "You haven't linked a student yet. Ask them for an invite code on their dashboard."
                    : `${linkedCount} student${linkedCount === 1 ? "" : "s"} linked.`}
                </p>
                <Button asChild variant="outline" className="mt-3">
                  <Link to="/family">{linkedCount === 0 ? "Link a student" : "Manage linked students"}</Link>
                </Button>
              </div>
            </section>

            {/* Parent — What you're here for */}
            <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
              <div>
                <h2 className="font-display text-xl font-semibold">What you're here for</h2>
                <p className="text-sm text-muted-foreground">Pick all that apply — we'll prioritize what shows up first.</p>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {PARENT_FOCUS.map((f) => {
                  const on = parent.focus.includes(f.key);
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => toggleFocus(f.key)}
                      className={`flex items-center gap-3 rounded-lg border p-3 text-left text-sm transition ${
                        on ? "border-gold bg-gold/5" : "border-border hover:border-foreground/40"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                          on ? "border-gold bg-gold text-primary-foreground" : "border-border"
                        }`}
                      >
                        {on && <Check className="h-3 w-3" />}
                      </span>
                      <span>{f.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Parent — Style */}
            <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-gold" />
                <h2 className="font-display text-xl font-semibold">Your parenting style</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                We'll tune our nudges and tips so we don't push you to do more (or less) than you actually want.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {PARENT_STYLES.map((s) => {
                  const on = parent.style === s.key;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setParent({ ...parent, style: s.key })}
                      className={`rounded-lg border p-4 text-left transition ${
                        on ? "border-gold bg-gold/5" : "border-border hover:border-foreground/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{s.label}</span>
                        {on && <Check className="h-4 w-4 text-gold" />}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{s.sub}</p>
                    </button>
                  );
                })}
              </div>
              <Field label="How often should we ping you?">
                <div className="flex flex-wrap gap-2">
                  {FREQS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setParent({ ...parent, update_freq: f })}
                      className={`rounded-full border px-3 py-1.5 text-sm ${
                        parent.update_freq === f
                          ? "border-gold text-gold"
                          : "border-border text-muted-foreground hover:border-foreground/40"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </Field>
            </section>
          </>
        ) : (
          <>
            {/* Student — Goals & Interests */}
            <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
              <div>
                <h2 className="font-display text-xl font-semibold">Goals & interests</h2>
                <p className="text-sm text-muted-foreground">
                  Comma-separated. We use these to surface scholarships and discussions that fit you.
                </p>
              </div>
              <Field label="Target colleges">
                <Input value={goals.target_colleges} onChange={(e) => setGoals({ ...goals, target_colleges: e.target.value })} placeholder="Howard, UT Austin, Spelman" />
              </Field>
              <Field label="Intended majors">
                <Input value={goals.intended_majors} onChange={(e) => setGoals({ ...goals, intended_majors: e.target.value })} placeholder="Computer Science, Design, Pre-Med" />
              </Field>
              <Field label="Interests">
                <Input value={goals.interests} onChange={(e) => setGoals({ ...goals, interests: e.target.value })} placeholder="robotics, debate, music" />
              </Field>
              <Field label="Career paths">
                <Input value={goals.career_paths} onChange={(e) => setGoals({ ...goals, career_paths: e.target.value })} placeholder="Software engineer, Doctor, Architect" />
              </Field>
            </section>
          </>
        )}

        {/* Theme & vibe — shared, but trim playlist for parents */}
        <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-semibold">Look & feel</h2>

          <div>
            <Label className="mb-2 block text-sm">Accent color</Label>
            <div className="flex flex-wrap gap-2">
              {ACCENTS.map((a) => (
                <button
                  key={a.key}
                  onClick={() => setAccent(a.key)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                    accent === a.key ? "border-foreground" : "border-border hover:border-foreground/40"
                  }`}
                >
                  <span className="h-4 w-4 rounded-full" style={{ background: a.swatch }} />
                  {a.label}
                  {accent === a.key && <Check className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-2 block text-sm">Theme</Label>
            <div className="inline-flex rounded-md border border-border p-0.5">
              {(["dark", "light", "system"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setThemeMode(m)}
                  className={`rounded px-3 py-1.5 text-xs capitalize ${themeMode === m ? "bg-gold text-primary-foreground" : "text-muted-foreground"}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {!isParent && (
            <div>
              <Label className="mb-2 block text-sm">Default playlist</Label>
              <div className="flex flex-wrap gap-2">
                {PLAYLISTS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setStudent({ ...student, playlist_pref: p.key })}
                    className={`rounded-full border px-3 py-1.5 text-sm ${
                      student.playlist_pref === p.key ? "border-gold text-gold" : "border-border text-muted-foreground hover:border-foreground/40"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* CTA — student gets personality test, parent gets parent lounge */}
        {isParent ? (
          <section className="rounded-2xl border border-gold/30 bg-gold/5 p-6">
            <div className="flex items-start gap-3">
              <Users className="mt-1 h-5 w-5 text-gold" />
              <div className="flex-1">
                <h3 className="font-display text-lg font-semibold">Parent Lounge</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Other parents going through the same season — paying for college, senior-year logistics, mental health check-ins.
                </p>
                <Button asChild className="mt-3 bg-gold text-primary-foreground hover:bg-gold/90">
                  <Link to="/community/discussions">Visit the lounge</Link>
                </Button>
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-gold/30 bg-gold/5 p-6">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-1 h-5 w-5 text-gold" />
              <div className="flex-1">
                <h3 className="font-display text-lg font-semibold">The Plug personality test</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  12 quick questions. Get an archetype with study tips, major suggestions, and a matching buddy style.
                </p>
                <Button asChild className="mt-3 bg-gold text-primary-foreground hover:bg-gold/90">
                  <Link to="/personality">Take the test</Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        <div className="sticky bottom-4 flex justify-end">
          <Button onClick={save} disabled={saving} size="lg" className="bg-gold text-primary-foreground hover:bg-gold/90 shadow-gold">
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
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
