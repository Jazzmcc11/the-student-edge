import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { getGradePlan, type GradePlan } from "@/lib/grade-plan";
import { Link } from "@tanstack/react-router";
import { TrendingUp, CheckCircle2, Pencil, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface Props {
  userId: string;
  gradeLevel: number | string | null;
  gpa: number | null;
  checklist: Record<string, boolean>;
  onProfileUpdated?: (patch: { gpa?: number | null; grade_level?: number | null; onboarding_checklist?: Record<string, boolean> }) => void;
}

export function GradeLevelPanel({ userId, gradeLevel, gpa, checklist, onProfileUpdated }: Props) {
  const plan = getGradePlan(gradeLevel);
  const [checked, setChecked] = useState<Record<string, boolean>>(checklist || {});
  const [gpaValue, setGpaValue] = useState<string>(gpa != null ? String(gpa) : "");
  const [editingGpa, setEditingGpa] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingGrade, setSavingGrade] = useState(false);

  useEffect(() => { setChecked(checklist || {}); }, [checklist]);
  useEffect(() => { setGpaValue(gpa != null ? String(gpa) : ""); }, [gpa]);

  async function saveGrade(g: number) {
    setSavingGrade(true);
    const { error } = await supabase.from("profiles").update({ grade_level: g }).eq("id", userId);
    setSavingGrade(false);
    if (error) { toast.error(error.message || "Couldn't save grade"); return; }
    toast.success("Grade saved");
    onProfileUpdated?.({ grade_level: g });
  }

  if (!plan) {
    return (
      <div className="mb-8 rounded-2xl border border-border bg-card p-6">
        <p className="text-sm font-medium">What grade are you in?</p>
        <p className="mt-1 text-xs text-muted-foreground">Pick one to unlock your personalized plan.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[9, 10, 11, 12].map((g) => (
            <Button
              key={g}
              size="sm"
              variant="outline"
              disabled={savingGrade}
              onClick={() => saveGrade(g)}
            >
              {g}th
            </Button>
          ))}
        </div>
      </div>
    );
  }

  async function toggleItem(id: string, value: boolean) {
    const next = { ...checked, [id]: value };
    setChecked(next);
    const { error } = await supabase
      .from("profiles")
      .update({ onboarding_checklist: next })
      .eq("id", userId);
    if (error) toast.error("Couldn't save");
    else onProfileUpdated?.({ onboarding_checklist: next });
  }

  async function saveGpa() {
    setSaving(true);
    const val = gpaValue === "" ? null : Number(gpaValue);
    if (val != null && (isNaN(val) || val < 0 || val > 5)) {
      toast.error("Enter a GPA between 0 and 5");
      setSaving(false);
      return;
    }
    const { error } = await supabase.from("profiles").update({ gpa: val }).eq("id", userId);
    setSaving(false);
    if (error) { toast.error("Couldn't save GPA"); return; }
    toast.success("GPA saved");
    setEditingGpa(false);
    onProfileUpdated?.({ gpa: val });
  }

  const completed = plan.checklist.filter(i => checked[i.id]).length;
  const pct = Math.round((completed / plan.checklist.length) * 100);

  return (
    <section className="mb-10 grid gap-4 md:grid-cols-3">
      {/* Grade banner */}
      <div className="md:col-span-2 rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 via-transparent to-transparent p-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold uppercase tracking-wider ${plan.color}`}>
              {plan.label} · Grade {plan.grade}
            </span>
            <span className="text-xs text-muted-foreground">· {plan.phase}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {[9, 10, 11, 12].map((g) => (
              <button
                key={g}
                disabled={savingGrade || g === plan.grade}
                onClick={() => saveGrade(g)}
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition ${
                  g === plan.grade
                    ? "bg-gold/20 text-gold"
                    : "text-muted-foreground hover:text-gold"
                }`}
                title={g === plan.grade ? "Current grade" : `Switch to ${g}th`}
              >
                {g}th
              </button>
            ))}
          </div>
        </div>
        <h2 className="mt-2 font-display text-2xl font-bold">{plan.tagline}</h2>
        <div className="mt-4 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-gradient-gold" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">{completed}/{plan.checklist.length} done</span>
        </div>
      </div>

      {/* GPA tracker */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <TrendingUp className="h-3.5 w-3.5" /> GPA tracker
        </div>
        {editingGpa ? (
          <div className="flex items-center gap-2">
            <Input
              type="number" step="0.01" min="0" max="5"
              value={gpaValue}
              onChange={e => setGpaValue(e.target.value)}
              placeholder="e.g. 3.85"
              className="h-9"
              autoFocus
            />
            <Button size="sm" onClick={saveGpa} disabled={saving}>Save</Button>
          </div>
        ) : (
          <div className="flex items-end justify-between">
            <div>
              <div className="font-display text-4xl font-bold">
                {gpa != null ? gpa.toFixed(2) : "—"}
              </div>
              <div className="text-xs text-muted-foreground">out of 4.0 (unweighted)</div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setEditingGpa(true)}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              {gpa != null ? "Update" : "Add"}
            </Button>
          </div>
        )}
      </div>

      {/* Checklist */}
      <div className="md:col-span-3 rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-gold" />
          <h3 className="font-display text-lg font-semibold">Your {plan.label.toLowerCase()} year checklist</h3>
        </div>
        <ul className="grid gap-2 md:grid-cols-2">
          {plan.checklist.map(item => (
            <li key={item.id} className="flex items-start gap-3 rounded-lg border border-border/50 bg-background/40 p-3">
              <Checkbox
                id={`chk-${item.id}`}
                checked={!!checked[item.id]}
                onCheckedChange={(v) => toggleItem(item.id, !!v)}
                className="mt-0.5"
              />
              <label htmlFor={`chk-${item.id}`} className={`flex-1 cursor-pointer text-sm ${checked[item.id] ? "text-muted-foreground line-through" : ""}`}>
                {item.label}
              </label>
              {item.href && !checked[item.id] && (
                <Link to={item.href} className="text-xs text-gold hover:underline inline-flex items-center gap-0.5">
                  Go <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
