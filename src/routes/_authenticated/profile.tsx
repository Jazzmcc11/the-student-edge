import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/components/theme-provider";
import { AvatarBadge } from "@/components/avatar-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Your Profile — The Plug" }] }),
  component: ProfilePage,
});

const profileSchema = z.object({
  display_name: z.string().trim().max(60).optional().or(z.literal("")),
  school: z.string().trim().max(120).optional().or(z.literal("")),
  grade_level: z.number().int().min(9).max(12).nullable(),
  pronouns: z.string().trim().max(30).optional().or(z.literal("")),
  bio: z.string().trim().max(280).optional().or(z.literal("")),
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

function ProfilePage() {
  const navigate = useNavigate();
  const { accent, setAccent, themeMode, setThemeMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  const [form, setForm] = useState({
    display_name: "",
    school: "",
    grade_level: "" as string,
    pronouns: "",
    bio: "",
    playlist_pref: "hbcu",
  });

  const [goals, setGoals] = useState({
    target_colleges: "",
    intended_majors: "",
    interests: "",
    career_paths: "",
  });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      setEmail(user.email || "");
      const [{ data: prof }, { data: g }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("user_goals").select("*").eq("user_id", user.id).maybeSingle(),
      ]);
      if (prof) {
        setForm({
          display_name: prof.display_name || prof.full_name || "",
          school: prof.school || "",
          grade_level: prof.grade_level?.toString() || "",
          pronouns: prof.pronouns || "",
          bio: prof.bio || "",
          playlist_pref: prof.playlist_pref || "hbcu",
        });
      }
      if (g) {
        setGoals({
          target_colleges: (g.target_colleges || []).join(", "),
          intended_majors: (g.intended_majors || []).join(", "),
          interests: (g.interests || []).join(", "),
          career_paths: (g.career_paths || []).join(", "),
        });
      }
      setLoading(false);
    })();
  }, []);

  async function save() {
    if (!userId) return;
    const parsed = profileSchema.safeParse({
      display_name: form.display_name,
      school: form.school,
      grade_level: form.grade_level ? Number(form.grade_level) : null,
      pronouns: form.pronouns,
      bio: form.bio,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message || "Check your inputs");
      return;
    }
    setSaving(true);
    const splitCsv = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from("profiles").update({
        display_name: form.display_name || null,
        school: form.school || null,
        grade_level: form.grade_level ? Number(form.grade_level) : null,
        pronouns: form.pronouns || null,
        bio: form.bio || null,
        playlist_pref: form.playlist_pref,
      }).eq("id", userId),
      supabase.from("user_goals").upsert({
        user_id: userId,
        target_colleges: splitCsv(goals.target_colleges),
        intended_majors: splitCsv(goals.intended_majors),
        interests: splitCsv(goals.interests),
        career_paths: splitCsv(goals.career_paths),
      }),
    ]);
    setSaving(false);
    if (e1 || e2) return toast.error("Couldn't save. Try again.");
    toast.success("Profile saved");
  }

  if (loading) {
    return <div className="min-h-screen bg-background p-8 text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-gold">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Dashboard
          </Link>
          <span className="font-display text-lg font-bold">Your profile</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 space-y-10">
        {/* Identity */}
        <section className="flex items-center gap-5">
          <AvatarBadge name={form.display_name || email} size="xl" />
          <div>
            <h1 className="font-display text-3xl font-bold">{form.display_name || "Add a display name"}</h1>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </section>

        {/* Basics */}
        <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-semibold">Basics</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Display name">
              <Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="What we call you" />
            </Field>
            <Field label="Pronouns">
              <Input value={form.pronouns} onChange={(e) => setForm({ ...form, pronouns: e.target.value })} placeholder="she/her, they/them…" />
            </Field>
            <Field label="School">
              <Input value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} placeholder="Your high school" />
            </Field>
            <Field label="Grade level">
              <select
                value={form.grade_level}
                onChange={(e) => setForm({ ...form, grade_level: e.target.value })}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">—</option>
                <option value="9">9th</option>
                <option value="10">10th</option>
                <option value="11">11th</option>
                <option value="12">12th</option>
              </select>
            </Field>
          </div>
          <Field label="Bio">
            <Textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              maxLength={280}
              rows={3}
              placeholder="One line about you. 280 chars."
            />
          </Field>
        </section>

        {/* Goals & Interests */}
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

        {/* Theme & vibe */}
        <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-semibold">Theme & vibe</h2>

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

          <div>
            <Label className="mb-2 block text-sm">Default playlist</Label>
            <div className="flex flex-wrap gap-2">
              {PLAYLISTS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setForm({ ...form, playlist_pref: p.key })}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    form.playlist_pref === p.key ? "border-gold text-gold" : "border-border text-muted-foreground hover:border-foreground/40"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Personality CTA */}
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
