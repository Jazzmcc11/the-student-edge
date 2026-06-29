// The Plug — Personality quiz logic
// 4 axes, 12 questions (3 per axis), 8 archetypes.

export type Axis = "EF" | "AC" | "CI" | "SF";
// EF: Explorer (-) ↔ Focused (+)
// AC: Analytical (-) ↔ Creative (+)
// CI: Collaborative (-) ↔ Independent (+)
// SF: Structured (-) ↔ Flexible (+)

export type Question = {
  id: string;
  axis: Axis;
  prompt: string;
  // direction: +1 if "Strongly agree" pushes toward the positive axis label, -1 if reverse
  direction: 1 | -1;
};

export const QUESTIONS: Question[] = [
  { id: "q1", axis: "EF", direction: 1, prompt: "I'd rather go deep on one subject than sample many." },
  { id: "q2", axis: "EF", direction: -1, prompt: "I like switching between clubs, classes, and side projects." },
  { id: "q3", axis: "EF", direction: 1, prompt: "I already know what I want to major in." },

  { id: "q4", axis: "AC", direction: 1, prompt: "I'd rather write a story or design something than solve an equation." },
  { id: "q5", axis: "AC", direction: -1, prompt: "I enjoy puzzles, data, and figuring out how things work." },
  { id: "q6", axis: "AC", direction: 1, prompt: "I think in images, sounds, or feelings more than numbers." },

  { id: "q7", axis: "CI", direction: 1, prompt: "I get more done studying alone than in a group." },
  { id: "q8", axis: "CI", direction: -1, prompt: "I think out loud — talking with people helps me learn." },
  { id: "q9", axis: "CI", direction: 1, prompt: "I'd pick a quiet library over a study group." },

  { id: "q10", axis: "SF", direction: 1, prompt: "I'd rather keep my options open than lock in a plan." },
  { id: "q11", axis: "SF", direction: -1, prompt: "I love a color-coded planner and crossing things off." },
  { id: "q12", axis: "SF", direction: 1, prompt: "Some of my best ideas come last minute." },
];

export type Answers = Record<string, number>; // 1..5 Likert

export type Axes = Record<Axis, number>; // normalized -1..1

export function scoreAxes(answers: Answers): Axes {
  const sums: Record<Axis, number> = { EF: 0, AC: 0, CI: 0, SF: 0 };
  const counts: Record<Axis, number> = { EF: 0, AC: 0, CI: 0, SF: 0 };
  for (const q of QUESTIONS) {
    const a = answers[q.id];
    if (!a) continue;
    // Convert 1..5 -> -2..+2, then apply direction
    const v = (a - 3) * q.direction;
    sums[q.axis] += v;
    counts[q.axis] += 1;
  }
  const out = { EF: 0, AC: 0, CI: 0, SF: 0 } as Axes;
  (Object.keys(sums) as Axis[]).forEach((k) => {
    const max = counts[k] * 2 || 1;
    out[k] = +(sums[k] / max).toFixed(3); // -1..1
  });
  return out;
}

export type Archetype = {
  key: string;
  name: string;
  blurb: string;
  emoji: string;
  academic: string;
  career: { majors: string[]; scholarshipTags: string[] };
  community: { topics: string[]; buddyStyle: string };
};

const ARCHETYPES: Record<string, Archetype> = {
  architect: {
    key: "architect",
    name: "The Architect",
    emoji: "📐",
    blurb: "Focused, analytical, independent, and structured. You build systems and execute them.",
    academic: "Time-block your week. Use the Cornell note system and Pomodoro (25/5) for deep work.",
    career: { majors: ["Engineering", "Computer Science", "Architecture"], scholarshipTags: ["STEM", "Merit"] },
    community: { topics: ["Test Prep", "Summer Programs"], buddyStyle: "1:1 study partner who respects quiet focus." },
  },
  strategist: {
    key: "strategist",
    name: "The Strategist",
    emoji: "♟️",
    blurb: "Focused and analytical, but you love bouncing ideas off others.",
    academic: "Teach-back method: explain each concept aloud to a buddy after every chapter.",
    career: { majors: ["Business", "Economics", "Political Science"], scholarshipTags: ["Leadership", "Merit"] },
    community: { topics: ["College Apps", "Career"], buddyStyle: "Small study circle (3–4 people), shared whiteboard." },
  },
  storyteller: {
    key: "storyteller",
    name: "The Storyteller",
    emoji: "✍️",
    blurb: "Focused and creative — you go deep on a craft and have something to say.",
    academic: "Mind-map every essay before writing. Outline by image, not bullet.",
    career: { majors: ["English", "Film", "Journalism"], scholarshipTags: ["Arts", "Writing"] },
    community: { topics: ["Essays", "College Apps"], buddyStyle: "Writing buddy who'll swap drafts weekly." },
  },
  performer: {
    key: "performer",
    name: "The Performer",
    emoji: "🎭",
    blurb: "Focused, creative, collaborative — the stage (or studio) is where you sharpen.",
    academic: "Record yourself summarizing material. Schedule weekly jam/critique sessions.",
    career: { majors: ["Music", "Theater", "Visual Arts"], scholarshipTags: ["Arts", "Performance"] },
    community: { topics: ["Auditions", "Summer Programs"], buddyStyle: "Creative crew — share works in progress." },
  },
  explorer: {
    key: "explorer",
    name: "The Explorer",
    emoji: "🧭",
    blurb: "Broad, analytical, independent, flexible. You sample everything and follow what's interesting.",
    academic: "Keep a single 'curiosity log.' Batch reading on weekends; deep dive one topic at a time.",
    career: { majors: ["Liberal Arts", "Data Science", "Biology"], scholarshipTags: ["Undecided", "Research"] },
    community: { topics: ["Summer Programs", "Career"], buddyStyle: "Async accountability buddy — weekly check-ins." },
  },
  connector: {
    key: "connector",
    name: "The Connector",
    emoji: "🤝",
    blurb: "Broad, analytical, collaborative. You see how everything links — and so do your people.",
    academic: "Build a 'who knows what' map. Study by interviewing classmates and synthesizing.",
    career: { majors: ["Public Health", "Sociology", "Marketing"], scholarshipTags: ["Community Service", "Leadership"] },
    community: { topics: ["Community Service", "Discussions"], buddyStyle: "Rotating study group — different topic each week." },
  },
  visionary: {
    key: "visionary",
    name: "The Visionary",
    emoji: "🌌",
    blurb: "Broad, creative, independent, flexible. You see things others don't yet.",
    academic: "Sketch-first thinking. Voice notes for ideas. Loose Notion dashboard over rigid planner.",
    career: { majors: ["Design", "Entrepreneurship", "Media"], scholarshipTags: ["Innovation", "Arts"] },
    community: { topics: ["HOCO + Events", "Wins"], buddyStyle: "Idea partner — bounce concepts, no judgment." },
  },
  catalyst: {
    key: "catalyst",
    name: "The Catalyst",
    emoji: "⚡",
    blurb: "Broad, creative, collaborative — you start things and pull people in.",
    academic: "Lead a study group. Build flashcard decks together; use them as a class.",
    career: { majors: ["Education", "Communications", "Social Work"], scholarshipTags: ["Leadership", "Community Service"] },
    community: { topics: ["HOCO + Events", "Community Service"], buddyStyle: "Big group energy — host the study session." },
  },
};

export function pickArchetype(axes: Axes): Archetype {
  // Threshold: > 0 means Focused / Creative / Independent / Flexible
  const focused = axes.EF > 0;
  const creative = axes.AC > 0;
  const independent = axes.CI > 0;
  const flexible = axes.SF > 0;

  if (focused && !creative && independent && !flexible) return ARCHETYPES.architect;
  if (focused && !creative && !independent) return ARCHETYPES.strategist;
  if (focused && creative && independent) return ARCHETYPES.storyteller;
  if (focused && creative && !independent) return ARCHETYPES.performer;
  if (!focused && !creative && independent && flexible) return ARCHETYPES.explorer;
  if (!focused && !creative && !independent) return ARCHETYPES.connector;
  if (!focused && creative && independent) return ARCHETYPES.visionary;
  if (!focused && creative && !independent) return ARCHETYPES.catalyst;

  // Fallback by strongest axis
  return ARCHETYPES.explorer;
}

export const ARCHETYPE_LIST = Object.values(ARCHETYPES);
