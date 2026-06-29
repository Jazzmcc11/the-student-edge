# Personalization Pack

Ship five tightly-scoped personal-experience features. Order is chosen so each step unlocks the next.

## 1. Profile customization
- Migration: add to `profiles` — `avatar_url`, `display_name`, `grade_level` (9–12), `school`, `bio`, `pronouns`.
- Storage bucket `avatars` (public, 2MB cap) + RLS so users only write their own folder.
- New route `/_authenticated/profile.tsx`: edit form with avatar upload (preview + crop-free), zod validation, save toast.
- Dashboard header swaps "Welcome, {email}" for avatar + display_name.

## 2. Personalized dashboard greeting
- Time-of-day greeting ("Good morning, Maya 🌅"), current streak (consecutive days with any activity), and a "Pick up where you left off" card driven by a new `last_visited` field on profile (updated on route enter for the 4 modules).
- Streak computed from a lightweight `activity_pings` table (one row per user per day).

## 3. Goals & interests
- Migration: `user_goals` table — `target_colleges text[]`, `intended_majors text[]`, `interests text[]`, `career_paths text[]`.
- Captured during onboarding modal (extend existing modal with a 4th step for students) and editable on the profile page.
- Wire into existing pages:
  - Scholarships list: surface a "Matches your goals" section first (filter on `field`/`tags` overlap with majors/interests).
  - Discussions: pin topics that match interests.
  - Advice: sort posts tagged with matching majors/interests to the top.

## 4. Theme & vibe
- Add `theme_mode` (light/dark/system), `accent` (burnt/maroon/navy/gold), `playlist_pref` to profiles.
- Build `ThemeProvider` that reads profile + writes `data-theme` + `data-accent` on `<html>`; CSS variables in `styles.css` switch the `--primary` token per accent.
- Settings panel on profile page; persists immediately.

## 5. Personality test → tailored suggestions
- Build it ourselves (no external API needed) using a 12-question Likert quiz mapping to a simplified 4-axis framework tuned for high schoolers:
  - **Explorer ↔ Focused** (breadth vs depth of academic interests)
  - **Analytical ↔ Creative** (STEM-leaning vs arts/humanities-leaning)
  - **Collaborative ↔ Independent** (group study vs solo)
  - **Structured ↔ Flexible** (planner vs spontaneous)
- Produces one of 8 archetypes (e.g. "The Architect", "The Storyteller", "The Connector") with a gold result card, blurb, and three concrete suggestions:
  - Academic: study technique that fits their axis (e.g. Pomodoro for Focused, mind-maps for Creative)
  - College/Career: 3 major families + 2 scholarship tags to watch
  - Community: which discussion topics + buddy match style suits them
- Schema: `personality_results` table — `archetype`, `axes jsonb`, `answers jsonb`, `taken_at`.
- New route `/_authenticated/personality.tsx`: quiz flow → animated reveal → save → suggestion cards with deep links into the matching modules.
- Dashboard adds a "Take the Plug Personality Test" card until completed; replaced by "Your archetype: {name}" + retake button after.

## Technical notes
- All new tables follow the GRANT → RLS → policy pattern, scoped to `auth.uid()`.
- One combined migration for steps 1–5 schema, then code in parallel.
- Onboarding modal extension reuses existing component; no new modal infra.
- Quiz logic lives in `src/lib/personality.ts` (pure functions, easy to test).

## Out of scope (next cycle)
- Parent-side personality results sharing
- AI-generated personalized study plan (would use Lovable AI — propose after quiz ships)
- Accent color custom hex picker (presets only for now)
