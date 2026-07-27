// Known Early Decision / Early Action deadlines for popular schools.
// Dates are the most common published deadline; students should confirm on the school site.

export type EarlyPlan = {
  match: RegExp;
  school: string;
  type: "Early Decision" | "Early Action" | "Priority" | "Rolling (Priority)";
  deadline: string; // human readable
  decisionBy?: string;
  url: string;
};

export const EARLY_PLANS: EarlyPlan[] = [
  { match: /texas southern|^tsu\b/i, school: "Texas Southern", type: "Priority", deadline: "Nov 1", decisionBy: "December", url: "https://www.tsu.edu/admissions/" },
  { match: /howard/i, school: "Howard", type: "Early Action", deadline: "Nov 1", decisionBy: "Dec 24", url: "https://admissions.howard.edu/" },
  { match: /spelman/i, school: "Spelman", type: "Early Decision", deadline: "Nov 15", decisionBy: "Dec 15", url: "https://admission.spelman.edu/" },
  { match: /morehouse/i, school: "Morehouse", type: "Early Action", deadline: "Nov 1", decisionBy: "Dec 15", url: "https://morehouse.edu/admissions/" },
  { match: /rice/i, school: "Rice", type: "Early Decision", deadline: "Nov 1", decisionBy: "Dec 12", url: "https://admissions.rice.edu/" },
  { match: /ut austin|university of texas at austin/i, school: "UT Austin", type: "Priority", deadline: "Oct 15", decisionBy: "Feb 1", url: "https://admissions.utexas.edu/" },
  { match: /texas a&m|texas a and m/i, school: "Texas A&M", type: "Priority", deadline: "Oct 15", decisionBy: "Rolling", url: "https://admissions.tamu.edu/" },
  { match: /prairie view/i, school: "Prairie View A&M", type: "Priority", deadline: "Nov 1", decisionBy: "Rolling", url: "https://www.pvamu.edu/admissions/" },
  { match: /jackson state/i, school: "Jackson State", type: "Rolling (Priority)", deadline: "Nov 15", decisionBy: "Rolling", url: "https://www.jsums.edu/admissions/" },
  { match: /north texas|^unt\b/i, school: "University of North Texas", type: "Priority", deadline: "Nov 1", decisionBy: "Rolling", url: "https://admissions.unt.edu/" },
  { match: /florida a&m|^famu\b/i, school: "Florida A&M", type: "Early Action", deadline: "Nov 15", decisionBy: "Jan", url: "https://www.famu.edu/admissions/" },
  { match: /hampton/i, school: "Hampton", type: "Early Action", deadline: "Nov 1", decisionBy: "Dec 15", url: "https://home.hamptonu.edu/admission/" },
  { match: /north carolina a&t|^ncat\b/i, school: "NC A&T", type: "Early Action", deadline: "Nov 1", decisionBy: "December", url: "https://www.ncat.edu/admissions/" },
  { match: /clark atlanta/i, school: "Clark Atlanta", type: "Early Action", deadline: "Nov 15", decisionBy: "Jan", url: "https://www.cau.edu/admissions/" },
  { match: /tuskegee/i, school: "Tuskegee", type: "Early Action", deadline: "Nov 1", decisionBy: "December", url: "https://www.tuskegee.edu/admissions" },
  { match: /xavier university of louisiana/i, school: "Xavier (LA)", type: "Early Action", deadline: "Nov 1", decisionBy: "December", url: "https://www.xula.edu/admissions/" },
];

export function findEarlyPlan(collegeName: string): EarlyPlan | null {
  return EARLY_PLANS.find((p) => p.match.test(collegeName)) ?? null;
}

export function isEarlyDeadlineType(type: string | null | undefined): boolean {
  if (!type) return false;
  return /early|restrictive|priority/i.test(type);
}
