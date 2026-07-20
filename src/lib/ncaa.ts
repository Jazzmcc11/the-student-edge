// NCAA eligibility helpers: sliding scale + core-course requirements.
// Sources: NCAA D1/D2 eligibility guides (public 2023-24 published sliding scales).

export const DIVISIONS = ["D1", "D2", "D3", "NAIA", "JUCO", "Undecided"] as const;
export type Division = (typeof DIVISIONS)[number];

// D1 requires 16 core courses in specific categories.
export const NCAA_CORE_REQUIREMENTS = [
  { category: "english", label: "English", required: 4 },
  { category: "math", label: "Math (Algebra I or higher)", required: 3 },
  { category: "science", label: "Natural/Physical Science (1 lab)", required: 2 },
  { category: "additional", label: "Additional English/Math/Science", required: 1 },
  { category: "social_science", label: "Social Science", required: 2 },
  { category: "additional", label: "Additional core (any category)", required: 4 },
] as const;

// D1 sliding scale (abridged). GPA → minimum SAT (EBRW + Math) for full qualifier.
// Below the floor = academic non-qualifier.
const D1_SCALE: Array<[number, number]> = [
  [3.55, 400], [3.5, 420], [3.45, 440], [3.4, 460], [3.35, 480],
  [3.3, 500], [3.25, 520], [3.2, 540], [3.15, 560], [3.1, 580],
  [3.05, 600], [3.0, 620], [2.95, 640], [2.9, 660], [2.85, 680],
  [2.8, 700], [2.75, 720], [2.7, 740], [2.65, 760], [2.6, 780],
  [2.55, 800], [2.5, 820], [2.45, 840], [2.4, 860], [2.35, 880],
  [2.3, 900], [2.25, 940], [2.2, 980], [2.15, 1020], [2.1, 1060],
  [2.05, 1100], [2.0, 1140],
];

// D2 has a flat minimum: 2.2 core GPA + 840 SAT (or 70 ACT sum).
export const D2_MIN = { gpa: 2.2, sat: 840, actSum: 70 };

export function d1MinSatForGpa(gpa: number): number | null {
  if (gpa >= 3.55) return 400;
  if (gpa < 2.0) return null; // non-qualifier
  for (const [threshold, sat] of D1_SCALE) {
    if (gpa >= threshold) return sat;
  }
  return null;
}

export function evaluateD1(gpa: number | null, sat: number | null): {
  status: "qualifier" | "close" | "non_qualifier" | "unknown";
  message: string;
  needed?: number;
} {
  if (gpa == null || sat == null) return { status: "unknown", message: "Add your core GPA and SAT to see where you stand." };
  const min = d1MinSatForGpa(gpa);
  if (min == null) return { status: "non_qualifier", message: `Core GPA ${gpa.toFixed(2)} is below the D1 floor of 2.0.` };
  if (sat >= min) return { status: "qualifier", message: `You're clear for D1 — SAT ${sat} beats the ${min} needed at ${gpa.toFixed(2)} GPA.` };
  const gap = min - sat;
  if (gap <= 60) return { status: "close", message: `So close — you need ${gap} more SAT points at ${gpa.toFixed(2)} GPA.`, needed: min };
  return { status: "non_qualifier", message: `You need ${gap} more SAT points (or a higher core GPA).`, needed: min };
}

export function evaluateD2(gpa: number | null, sat: number | null): {
  status: "qualifier" | "close" | "non_qualifier" | "unknown";
  message: string;
} {
  if (gpa == null || sat == null) return { status: "unknown", message: "Add your core GPA and SAT to check D2." };
  if (gpa >= D2_MIN.gpa && sat >= D2_MIN.sat) {
    return { status: "qualifier", message: `D2 qualifier — ${gpa.toFixed(2)} GPA / ${sat} SAT clears the ${D2_MIN.gpa}/${D2_MIN.sat} minimum.` };
  }
  const gpaGap = Math.max(0, D2_MIN.gpa - gpa);
  const satGap = Math.max(0, D2_MIN.sat - sat);
  if (gpaGap <= 0.1 || satGap <= 60) {
    return { status: "close", message: `Almost — need ${gpaGap ? `+${gpaGap.toFixed(2)} GPA` : ""}${gpaGap && satGap ? " or " : ""}${satGap ? `+${satGap} SAT` : ""}.` };
  }
  return { status: "non_qualifier", message: `Below D2 minimums (${D2_MIN.gpa} GPA / ${D2_MIN.sat} SAT).` };
}

export const RECRUITING_STATUSES = [
  { key: "interested", label: "Interested" },
  { key: "contacted", label: "Contacted them" },
  { key: "responded", label: "They responded" },
  { key: "visiting", label: "Visit planned" },
  { key: "offer", label: "Offer on the table" },
  { key: "committed", label: "Committed" },
  { key: "passed", label: "Passed" },
] as const;

export const NCAA_CHECKLIST = [
  { key: "ncaa_registered", label: "Registered at eligibilitycenter.org", why: "Do this end of junior year." },
  { key: "amateurism_certified", label: "Amateurism questionnaire completed", why: "Certifies you haven't accepted disqualifying money." },
  { key: "transcripts_sent", label: "Official transcripts sent to NCAA", why: "Counselor sends after junior year + final after graduation." },
  { key: "test_scores_sent", label: "SAT/ACT scores sent to NCAA (code 9999)", why: "Scores must come from College Board / ACT directly." },
] as const;
