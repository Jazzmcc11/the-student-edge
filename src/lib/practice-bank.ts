// Curated practice question bank for TSI, SAT, PSAT.
// Modeled on publicly released official practice materials — realistic in
// format and difficulty, but not verbatim official questions.

export type TestKind = "TSI" | "SAT" | "PSAT";

export interface PracticeQuestion {
  id: string;
  test: TestKind;
  section: string;           // e.g. "Math", "Reading & Writing"
  difficulty: "easy" | "medium" | "hard";
  passage?: string;          // optional reading passage
  prompt: string;
  choices: { key: string; text: string }[]; // A/B/C/D
  answer: string;            // key of correct choice
  explanation: string;
}

export const PRACTICE_BANK: PracticeQuestion[] = [
  // ─────────────── TSI · Math ───────────────
  {
    id: "tsi-m-1", test: "TSI", section: "Math", difficulty: "easy",
    prompt: "If 3x + 5 = 20, what is the value of x?",
    choices: [{ key: "A", text: "3" }, { key: "B", text: "5" }, { key: "C", text: "7" }, { key: "D", text: "15" }],
    answer: "B",
    explanation: "Subtract 5 from both sides: 3x = 15. Divide by 3: x = 5.",
  },
  {
    id: "tsi-m-2", test: "TSI", section: "Math", difficulty: "medium",
    prompt: "A rectangle has a length that is 4 more than twice its width. If the perimeter is 26, what is the width?",
    choices: [{ key: "A", text: "3" }, { key: "B", text: "4" }, { key: "C", text: "5" }, { key: "D", text: "6" }],
    answer: "A",
    explanation: "Let width = w, length = 2w+4. Perimeter = 2(w + 2w+4) = 6w + 8 = 26 → 6w = 18 → w = 3.",
  },
  {
    id: "tsi-m-3", test: "TSI", section: "Math", difficulty: "medium",
    prompt: "What is the slope of the line passing through (2, -1) and (6, 7)?",
    choices: [{ key: "A", text: "1/2" }, { key: "B", text: "2" }, { key: "C", text: "4" }, { key: "D", text: "-2" }],
    answer: "B",
    explanation: "Slope = (7 − (−1)) / (6 − 2) = 8/4 = 2.",
  },
  {
    id: "tsi-m-4", test: "TSI", section: "Math", difficulty: "hard",
    prompt: "If f(x) = x² − 3x + 2, what is f(−2)?",
    choices: [{ key: "A", text: "0" }, { key: "B", text: "8" }, { key: "C", text: "12" }, { key: "D", text: "−4" }],
    answer: "C",
    explanation: "f(−2) = 4 − (−6) + 2 = 4 + 6 + 2 = 12.",
  },

  // ─────────────── TSI · Reading ───────────────
  {
    id: "tsi-r-1", test: "TSI", section: "Reading", difficulty: "medium",
    passage: "The invention of the printing press in the 15th century radically altered how information spread across Europe. Books, once painstakingly copied by hand, could now be produced in the hundreds. Literacy rates climbed as texts became affordable, and ideas — political, religious, and scientific — traveled faster than ever.",
    prompt: "The passage primarily suggests that the printing press:",
    choices: [
      { key: "A", text: "Was invented mainly for religious purposes." },
      { key: "B", text: "Made books cheaper and helped spread new ideas." },
      { key: "C", text: "Reduced the quality of European literature." },
      { key: "D", text: "Was rejected by European scholars." },
    ],
    answer: "B",
    explanation: "The passage focuses on affordability and the spread of ideas — choice B captures both.",
  },
  {
    id: "tsi-r-2", test: "TSI", section: "Reading", difficulty: "easy",
    prompt: "In the sentence 'Despite the storm, the game continued,' the word 'Despite' signals:",
    choices: [
      { key: "A", text: "A cause" }, { key: "B", text: "A contrast" },
      { key: "C", text: "A sequence" }, { key: "D", text: "An example" },
    ],
    answer: "B",
    explanation: "'Despite' introduces a contrast — the storm and the game continuing are opposing conditions.",
  },

  // ─────────────── TSI · Writing ───────────────
  {
    id: "tsi-w-1", test: "TSI", section: "Writing", difficulty: "easy",
    prompt: "Choose the correctly punctuated sentence:",
    choices: [
      { key: "A", text: "After the concert we went to eat, at a diner." },
      { key: "B", text: "After the concert, we went to eat at a diner." },
      { key: "C", text: "After, the concert we went to eat at a diner." },
      { key: "D", text: "After the concert we went, to eat at a diner." },
    ],
    answer: "B",
    explanation: "An introductory phrase ('After the concert') is followed by a comma; the rest of the sentence flows without extra commas.",
  },
  {
    id: "tsi-w-2", test: "TSI", section: "Writing", difficulty: "medium",
    prompt: "Which revision best fixes the run-on: 'Maria loves painting she has a studio downtown.'",
    choices: [
      { key: "A", text: "Maria loves painting, she has a studio downtown." },
      { key: "B", text: "Maria loves painting; she has a studio downtown." },
      { key: "C", text: "Maria loves painting she, has a studio downtown." },
      { key: "D", text: "Maria, loves painting she has a studio downtown." },
    ],
    answer: "B",
    explanation: "A semicolon correctly joins two independent clauses. A comma alone (A) creates a comma splice.",
  },

  // ─────────────── SAT · Math ───────────────
  {
    id: "sat-m-1", test: "SAT", section: "Math", difficulty: "medium",
    prompt: "If 2(x − 3) = 4x + 6, what is x?",
    choices: [{ key: "A", text: "−6" }, { key: "B", text: "−3" }, { key: "C", text: "0" }, { key: "D", text: "3" }],
    answer: "A",
    explanation: "2x − 6 = 4x + 6 → −12 = 2x → x = −6.",
  },
  {
    id: "sat-m-2", test: "SAT", section: "Math", difficulty: "medium",
    prompt: "A car travels 180 miles in 3 hours. At the same rate, how far does it travel in 5 hours?",
    choices: [{ key: "A", text: "240" }, { key: "B", text: "270" }, { key: "C", text: "300" }, { key: "D", text: "360" }],
    answer: "C",
    explanation: "Rate = 180/3 = 60 mph. In 5 hours: 60 × 5 = 300 miles.",
  },
  {
    id: "sat-m-3", test: "SAT", section: "Math", difficulty: "hard",
    prompt: "If x² + 6x + 9 = 25, what are the possible values of x?",
    choices: [{ key: "A", text: "2 or −8" }, { key: "B", text: "−2 or 8" }, { key: "C", text: "3 or −3" }, { key: "D", text: "5 or −5" }],
    answer: "A",
    explanation: "x² + 6x + 9 = (x + 3)². So (x + 3)² = 25 → x + 3 = ±5 → x = 2 or x = −8.",
  },

  // ─────────────── SAT · Reading & Writing ───────────────
  {
    id: "sat-rw-1", test: "SAT", section: "Reading & Writing", difficulty: "medium",
    passage: "Marine biologist Dr. Ayanna Bell has spent two decades studying kelp forests off the California coast. Her recent findings suggest that shifts in sea otter populations have a cascading effect on the entire ecosystem: fewer otters mean more sea urchins, which in turn devastate kelp forests that shelter countless species.",
    prompt: "Which choice best states the main idea of the passage?",
    choices: [
      { key: "A", text: "Sea otters are the most endangered species on the California coast." },
      { key: "B", text: "Sea urchins are the primary threat to marine biodiversity." },
      { key: "C", text: "Small changes in one species can have large effects on an ecosystem." },
      { key: "D", text: "Dr. Bell believes kelp forests should be legally protected." },
    ],
    answer: "C",
    explanation: "The passage describes a cascading chain — otters → urchins → kelp → other species. That's an example of a larger ecosystem principle (C).",
  },
  {
    id: "sat-rw-2", test: "SAT", section: "Reading & Writing", difficulty: "medium",
    prompt: "Choose the word that best completes the sentence: 'Although the plan seemed simple, its execution proved ______ than anyone anticipated.'",
    choices: [
      { key: "A", text: "easier" }, { key: "B", text: "more straightforward" },
      { key: "C", text: "less complicated" }, { key: "D", text: "more difficult" },
    ],
    answer: "D",
    explanation: "'Although … simple' sets up a contrast, so the execution must be the opposite of simple — 'more difficult' fits.",
  },
  {
    id: "sat-rw-3", test: "SAT", section: "Reading & Writing", difficulty: "easy",
    prompt: "Which sentence is punctuated correctly?",
    choices: [
      { key: "A", text: "The team, which practiced daily won the championship." },
      { key: "B", text: "The team which practiced daily, won the championship." },
      { key: "C", text: "The team, which practiced daily, won the championship." },
      { key: "D", text: "The team which, practiced daily won the championship." },
    ],
    answer: "C",
    explanation: "Nonrestrictive clauses ('which practiced daily') take commas on both sides.",
  },

  // ─────────────── PSAT · Math ───────────────
  {
    id: "psat-m-1", test: "PSAT", section: "Math", difficulty: "easy",
    prompt: "If y = 3x + 2 and x = 4, what is y?",
    choices: [{ key: "A", text: "10" }, { key: "B", text: "12" }, { key: "C", text: "14" }, { key: "D", text: "18" }],
    answer: "C",
    explanation: "y = 3(4) + 2 = 12 + 2 = 14.",
  },
  {
    id: "psat-m-2", test: "PSAT", section: "Math", difficulty: "medium",
    prompt: "A shirt originally priced at $40 is on sale for 25% off. What is the sale price?",
    choices: [{ key: "A", text: "$10" }, { key: "B", text: "$25" }, { key: "C", text: "$30" }, { key: "D", text: "$32" }],
    answer: "C",
    explanation: "25% of $40 = $10. Sale price = $40 − $10 = $30.",
  },
  {
    id: "psat-m-3", test: "PSAT", section: "Math", difficulty: "medium",
    prompt: "The mean of five numbers is 12. If four of the numbers are 10, 14, 11, and 13, what is the fifth?",
    choices: [{ key: "A", text: "10" }, { key: "B", text: "11" }, { key: "C", text: "12" }, { key: "D", text: "14" }],
    answer: "C",
    explanation: "Sum must be 5 × 12 = 60. Sum of known four = 48. Fifth = 60 − 48 = 12.",
  },

  // ─────────────── PSAT · Reading & Writing ───────────────
  {
    id: "psat-rw-1", test: "PSAT", section: "Reading & Writing", difficulty: "easy",
    prompt: "Choose the word that best fits: 'The scientist's findings were ______; every colleague who reviewed the data reached the same conclusion.'",
    choices: [
      { key: "A", text: "controversial" }, { key: "B", text: "conclusive" },
      { key: "C", text: "confusing" }, { key: "D", text: "outdated" },
    ],
    answer: "B",
    explanation: "The semicolon signals support — everyone agreeing means the findings were conclusive.",
  },
  {
    id: "psat-rw-2", test: "PSAT", section: "Reading & Writing", difficulty: "medium",
    passage: "Community gardens have become increasingly popular in urban neighborhoods. Beyond producing fresh food, they create shared spaces where neighbors — often strangers before — meet, work side by side, and form lasting connections.",
    prompt: "According to the passage, community gardens are valuable primarily because they:",
    choices: [
      { key: "A", text: "Produce more food than commercial farms." },
      { key: "B", text: "Beautify neighborhoods." },
      { key: "C", text: "Build relationships between neighbors." },
      { key: "D", text: "Are easier to maintain than backyard gardens." },
    ],
    answer: "C",
    explanation: "The passage emphasizes social connection — meeting, working together, forming connections — beyond the food itself.",
  },
];

export const TEST_SECTIONS: Record<TestKind, string[]> = {
  TSI: ["Math", "Reading", "Writing"],
  SAT: ["Math", "Reading & Writing"],
  PSAT: ["Math", "Reading & Writing"],
};

export const TEST_META: Record<TestKind, { label: string; blurb: string; officialUrl: string; officialLabel: string }> = {
  TSI: {
    label: "TSI Assessment",
    blurb: "Texas Success Initiative — Texas colleges use it to place you in the right courses.",
    officialUrl: "https://accuplacer.collegeboard.org/students/prepare-for-accuplacer/practice",
    officialLabel: "Official TSI practice on College Board",
  },
  SAT: {
    label: "SAT",
    blurb: "Digital SAT — used by most 4-year colleges for admissions.",
    officialUrl: "https://satsuite.collegeboard.org/sat/practice-preparation",
    officialLabel: "Official full-length SAT practice tests",
  },
  PSAT: {
    label: "PSAT/NMSQT",
    blurb: "Practice SAT + qualifier for the National Merit Scholarship.",
    officialUrl: "https://satsuite.collegeboard.org/psat-nmsqt/preparation",
    officialLabel: "Official PSAT/NMSQT practice",
  },
};

export function questionsFor(test: TestKind, section?: string): PracticeQuestion[] {
  return PRACTICE_BANK.filter((q) => q.test === test && (!section || q.section === section));
}
