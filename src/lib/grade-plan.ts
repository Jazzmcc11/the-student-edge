// Grade-level personalization: what each grade focuses on.
// Grades 9-12 map to standard high school prep framework.

export type GradeLevel = 9 | 10 | 11 | 12;

export interface ChecklistItem {
  id: string;
  label: string;
  href?: string;
}

export interface GradePlan {
  grade: GradeLevel;
  label: string;         // e.g. "Freshman"
  tagline: string;       // shown on dashboard
  phase: string;         // e.g. "Explore & build habits"
  color: string;         // tailwind class for accent
  checklist: ChecklistItem[];
  priorityModules: string[]; // module keys, ordered by relevance
  hiddenModules: string[];   // modules to hide entirely at this grade
}

export const GRADE_PLANS: Record<GradeLevel, GradePlan> = {
  9: {
    grade: 9,
    label: "Freshman",
    tagline: "Freshman year is your foundation. Build the habits, explore what you love.",
    phase: "Explore & build habits",
    color: "text-emerald-400",
    checklist: [
      { id: "gpa", label: "Log your first-semester GPA" },
      { id: "activities", label: "Join 1–2 clubs or activities that actually interest you" },
      { id: "study", label: "Set up a weekly study routine", href: "/tutor" },
      { id: "tsi-awareness", label: "Learn what the TSI is (Texas college placement test)", href: "/tutor" },
      { id: "explore-colleges", label: "Browse 3 colleges to see what's out there", href: "/colleges" },
      { id: "personality", label: "Take the Plug personality test", href: "/personality" },
      { id: "community", label: "Join the community", href: "/community/wins" },
    ],
    priorityModules: ["tutor", "personality", "community", "creative", "colleges"],
    hiddenModules: ["recommendations", "essays", "tracker-colleges", "finaid"],
  },
  10: {
    grade: 10,
    label: "Sophomore",
    tagline: "Sophomore year: go deeper. Lead something, prep for the PSAT, start dreaming bigger.",
    phase: "Deepen & prep",
    color: "text-sky-400",
    checklist: [
      { id: "gpa", label: "Log your current GPA — it matters more this year" },
      { id: "psat", label: "Register for the PSAT this fall" },
      { id: "leadership", label: "Take a leadership role in one activity" },
      { id: "tsi-diagnostic", label: "Take a TSI diagnostic to see where you stand", href: "/tutor" },
      { id: "summer", label: "Plan a meaningful summer (program, job, project)" },
      { id: "college-list", label: "Start a rough college list (5 schools)", href: "/colleges" },
      { id: "scholarships-browse", label: "Browse scholarships open to underclassmen", href: "/scholarships" },
    ],
    priorityModules: ["tutor", "colleges", "scholarships", "personality", "community"],
    hiddenModules: ["recommendations", "tracker-colleges", "finaid"],
  },
  11: {
    grade: 11,
    label: "Junior",
    tagline: "Junior year is THE year. Test prep, college list, essays start now — you got this.",
    phase: "Core prep",
    color: "text-gold",
    checklist: [
      { id: "gpa", label: "Track your GPA every semester — colleges care most about junior year" },
      { id: "sat", label: "Take the SAT/ACT (spring is prime time)" },
      { id: "tsi-prep", label: "Prep for the TSI — knock it out before senior year", href: "/tutor" },
      { id: "college-list", label: "Build your college list (10–15 schools)", href: "/tracker/colleges" },
      { id: "recs", label: "Identify 2 teachers to ask for rec letters", href: "/recommendations" },
      { id: "essay-brainstorm", label: "Brainstorm personal statement topics", href: "/essays" },
      { id: "summer-visits", label: "Plan college visits + a strong summer" },
      { id: "scholarships-junior", label: "Apply to junior-eligible scholarships", href: "/scholarships" },
    ],
    priorityModules: ["essays", "tracker-colleges", "recommendations", "colleges", "scholarships", "tutor"],
    hiddenModules: [],
  },
  12: {
    grade: 12,
    label: "Senior",
    tagline: "Senior year: apply, decide, celebrate. Deadlines are real — let's stay on top of them.",
    phase: "Apply & decide",
    color: "text-rose-400",
    checklist: [
      { id: "gpa", label: "Log your senior-year GPA (colleges see mid-year reports)" },
      { id: "common-app", label: "Finish your Common App + 3 supplements", href: "/essays" },
      { id: "apply", label: "Submit apps to every school on your list", href: "/tracker/colleges" },
      { id: "recs", label: "Confirm all rec letters submitted", href: "/recommendations" },
      { id: "fafsa", label: "File FAFSA (opens Oct 1)", href: "/finaid" },
      { id: "css", label: "File CSS Profile if your schools require it", href: "/finaid" },
      { id: "scholarships-senior", label: "Apply to at least 5 scholarships", href: "/scholarships" },
      { id: "compare", label: "Compare aid offers side-by-side", href: "/finaid" },
    ],
    priorityModules: ["tracker-colleges", "essays", "finaid", "scholarships", "recommendations", "calendar"],
    hiddenModules: [],
  },
};

export function getGradePlan(grade: number | string | null | undefined): GradePlan | null {
  const g = typeof grade === "string" ? parseInt(grade, 10) : grade;
  if (g === 9 || g === 10 || g === 11 || g === 12) return GRADE_PLANS[g];
  return null;
}
