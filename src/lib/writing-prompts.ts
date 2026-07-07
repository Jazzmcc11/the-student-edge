// Curated writing practice prompts, grade-tuned.
// Rotates daily via a simple hash of the date + grade.

export type WritingPromptCategory = "reflection" | "narrative" | "argument" | "college" | "creative";

export interface WritingPrompt {
  id: string;
  grades: number[];      // which grades it fits (9-12)
  category: WritingPromptCategory;
  minWords: number;
  maxWords: number;
  prompt: string;
  hint?: string;
}

export const WRITING_PROMPTS: WritingPrompt[] = [
  // 9th grade — foundation, reflection, low stakes
  { id: "w9-1", grades: [9], category: "reflection", minWords: 100, maxWords: 250, prompt: "Describe a moment this year that made you proud of yourself. Why did it matter?", hint: "Set the scene in one sentence, then dig into the feeling." },
  { id: "w9-2", grades: [9], category: "narrative", minWords: 150, maxWords: 300, prompt: "Tell the story of a friendship that changed how you see yourself.", hint: "Zoom in on one specific memory instead of summarizing." },
  { id: "w9-3", grades: [9, 10], category: "reflection", minWords: 100, maxWords: 250, prompt: "What's a skill you're actively getting better at right now? Walk me through your last practice session.", hint: "Concrete details > general claims." },
  { id: "w9-4", grades: [9], category: "creative", minWords: 150, maxWords: 300, prompt: "You wake up tomorrow with one new superpower. It's not what you would've picked. What is it, and how does your day go?" },

  // 10th grade — deeper, opinions, leadership
  { id: "w10-1", grades: [10], category: "argument", minWords: 200, maxWords: 400, prompt: "Should high schools require community service to graduate? Take a side and back it with real examples.", hint: "Address the strongest counterargument in one paragraph." },
  { id: "w10-2", grades: [10, 11], category: "reflection", minWords: 200, maxWords: 400, prompt: "Describe a time you had to lead when you didn't feel ready. What did you learn about yourself?" },
  { id: "w10-3", grades: [10], category: "narrative", minWords: 200, maxWords: 400, prompt: "Write about a place in your neighborhood that outsiders would misunderstand.", hint: "Sensory detail — what does it smell like, sound like, feel like?" },
  { id: "w10-4", grades: [10, 11], category: "argument", minWords: 200, maxWords: 400, prompt: "Pick a rule at your school you'd change. Argue for it convincingly to your principal." },

  // 11th grade — college-ready, personal statement muscles
  { id: "w11-1", grades: [11], category: "college", minWords: 250, maxWords: 500, prompt: "Common App practice: 'Some students have a background, identity, interest, or talent that is so meaningful they believe their application would be incomplete without it.' Write yours.", hint: "Show, don't tell. One specific story beats three general ones." },
  { id: "w11-2", grades: [11], category: "college", minWords: 250, maxWords: 500, prompt: "Common App practice: Describe a problem you've solved or would like to solve. Explain its significance to you.", hint: "The problem doesn't have to be huge — depth matters more than scale." },
  { id: "w11-3", grades: [11, 12], category: "reflection", minWords: 200, maxWords: 400, prompt: "What's a belief you held two years ago that you've since changed your mind about? What shifted it?" },
  { id: "w11-4", grades: [11], category: "narrative", minWords: 250, maxWords: 500, prompt: "Write about a family tradition — food, music, phrase, ritual — that you carry with you." },
  { id: "w11-5", grades: [11, 12], category: "college", minWords: 100, maxWords: 250, prompt: "Supplemental practice: 'Why us?' Pick a college on your list and write a genuine 250-word answer.", hint: "Name specific programs, professors, or classes. No generic praise." },

  // 12th grade — sharpening, supplements
  { id: "w12-1", grades: [12], category: "college", minWords: 100, maxWords: 250, prompt: "Supplemental practice: Describe an extracurricular activity or work experience that has been most meaningful to you." },
  { id: "w12-2", grades: [12], category: "college", minWords: 100, maxWords: 200, prompt: "Supplemental practice: What is a book, movie, or song that shaped how you think? Be specific about why." },
  { id: "w12-3", grades: [12], category: "reflection", minWords: 200, maxWords: 400, prompt: "You're graduating in a few months. Write a letter to freshman-you with what you actually wish you'd known." },
  { id: "w12-4", grades: [12], category: "college", minWords: 250, maxWords: 500, prompt: "Common App practice: Discuss an accomplishment, event, or realization that sparked a period of personal growth." },
];

export function promptsForGrade(grade: number | null): WritingPrompt[] {
  if (!grade) return WRITING_PROMPTS;
  return WRITING_PROMPTS.filter((p) => p.grades.includes(grade));
}

// Deterministic daily prompt: hash date+grade -> pick from grade's pool.
export function dailyPrompt(grade: number | null, date = new Date()): WritingPrompt {
  const pool = promptsForGrade(grade);
  if (pool.length === 0) return WRITING_PROMPTS[0];
  const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${grade ?? 0}`;
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return pool[Math.abs(h) % pool.length];
}

export function wordCount(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}
