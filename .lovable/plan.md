# Student Side — Full Build Plan

Goal: make the student experience feel like a **coach in their corner**, not a homework assignment. Warm, momentum-driven, personal.

## 1. Redesigned Dashboard (home base)

Replace the current dashboard with a single-glance command center:

- **Greeting hero** — "Morning, Alex 👋" + one motivating line pulled from progress ("You're 3 apps deep — halfway to your list.")
- **Next up card** — the single most urgent thing (next deadline OR next task), big and actionable
- **Streak + XP bar** — days active, small delightful animation on load
- **This week grid** — deadlines, reminders, essay drafts due
- **Recent wins carousel** — pulls from `wins` table, celebratory tone
- **Quick jump tiles** — Essays, Colleges, Scholarships, FAFSA, Tutor
- **"You might've forgotten"** — soft nudges (e.g. "You haven't updated Stanford in 12 days")

Vibe: rounded cards, generous whitespace, soft gradients, subtle motion on load. No dense tables.

## 2. Essay / Personal Statement Workspace

New route: `/essays`

- **Prompt library** — Common App 2026 prompts + supplemental prompts per college (pulled from college_applications)
- **Draft manager** — multiple drafts per prompt, version history, word count vs limit
- **AI coach panel** (right side) — "Tighten this paragraph", "Show me stronger verbs", "Where's my voice weakest?" — never writes for them, only coaches
- **Focus mode** — distraction-free full-screen editor
- **Status badges** — Brainstorming / Drafting / Revising / Final

Table: `essays` (user_id, college_id nullable, prompt, prompt_type, draft_content, word_limit, status, version)

## 3. Financial Aid / FAFSA Hub

New route: `/finaid`

- **FAFSA checklist** — pre-filing docs (tax returns, SSN, FSA ID), filing steps, post-filing (SAR review, corrections)
- **CSS Profile tracker** — which colleges require it, completion status
- **Aid award comparison** — side-by-side of offers (grants vs loans vs work-study, net cost)
- **Deadline tracker** — FAFSA priority dates per school, state aid deadlines
- **Resource links** — net price calculators, scholarship search shortcut

Tables: `finaid_tasks` (checklist state), `aid_awards` (college_id, grants, loans, work_study, cost_of_attendance)

## 4. Recommendation Letter Tracker

New route: `/recommendations`

- Add recommenders (name, role, email, relationship)
- Track status per college: Not asked → Asked → Confirmed → Submitted
- Auto-reminder to send thank-you notes after submission
- Template email generator (AI drafts a polite ask)
- Deadline alerts

Table: `recommenders` + `recommendation_requests` (recommender_id, college_id, status, requested_at, submitted_at, thank_you_sent)

## 5. AI Tutor Upgrades

Enhance existing `/tutor`:

- **Subject modes** — Math, Writing, Test Prep (SAT/ACT), General
- **Persistent chat history** per subject (threaded)
- **File/photo upload** — snap a problem, get walked through it
- **"Explain like I'm..."** slider — beginner → advanced
- **Save to notes** — pin useful exchanges to a personal notebook

Table: `tutor_threads`, `tutor_messages`

## 6. Engagement Layer (cross-cutting)

Makes it feel unlike school:

- **Streaks** — daily login/activity streak, subtle flame icon
- **Micro-wins** — auto-generated when they complete anything (submit app, finish draft, add scholarship). Celebratory toast + logged to wins.
- **Progress rings** — visual completion per college app, per essay
- **Tone throughout** — encouraging copy ("You've got this", "One down, five to go"), no "assignments" or "requirements" language
- **Personality-driven** — pull their personality result into the greeting and coach voice

## Build Order

1. Database migration (all new tables in one migration)
2. Redesigned dashboard
3. Essay workspace
4. Rec letter tracker
5. FAFSA hub
6. Tutor upgrades
7. Engagement polish pass (streaks, micro-win toasts, tone)

## Technical notes

- New tables follow existing RLS pattern (owner-scoped via `auth.uid()`)
- Essay AI coach + tutor use Lovable AI Gateway via `createServerFn` (openai/gpt-5.5)
- File uploads for tutor → new Supabase storage bucket `tutor-uploads`
- Streak calc = client-side from `activity_pings` (already exists)
- Common App prompts + FAFSA checklist ship as static seed constants (not user-editable)

---

Approve and I'll start with the migration + dashboard redesign, then work down the list.
