# The Plug — Iteration Plan

_Last updated: 2026-06-29_

This document tracks the path from working prototype to production-ready
product. It's organized as three iterative cycles, each ~1–2 weeks, with
explicit goals, scope, and how we'll gather feedback.

---

## Where we are today (Prototype v0.9)

**Shipped**
- Auth (email + Google), `_authenticated` route gate
- Student dashboard
- Scholarships: browse, detail, apply tracking
- Tracker: scholarships + colleges
- Family: parent ↔ student invite codes, read-only parent view
- Community: Wins, Study Buddies, Advice, Discussions (8 topics incl. Summer
  Programs & Community Service), threads + replies
- DB: RLS on every table, GRANTs in place, `has_role` security-definer fn

**Known gaps for production**
- No onboarding / empty states are bare
- Mobile polish uneven across new community pages
- No in-app feedback channel for testers
- No analytics on what students actually use
- Advice library has no content yet
- No moderation tools on discussions / wins
- SEO metadata is per-route but not audited
- No email notifications (reply on your thread, parent linked, etc.)

---

## Cycle 1 — Polish & Production Hygiene (now)

Goal: take the existing surface from "demo-able" to "I'd let a stranger use it."

| Area | Work |
|---|---|
| Empty states | Friendly empty states on every list (wins, buddies, threads, advice, tracker) |
| Loading | Skeletons replace "Loading…" text on dashboard, community, tracker |
| Errors | Toast + retry on all mutations; verify `errorComponent` on every route w/ loader |
| Mobile | Audit community + family pages at 375px; fix tap targets <44px |
| Onboarding | First-run modal: "Are you a student or parent?" → seed 1 example scholarship/win |
| Feedback | In-app feedback widget (see Cycle 2) — stub button now |
| SEO | Run SEO review, fix titles/descriptions per route |

**Demo checkpoint:** walk a stakeholder through dashboard → community → family
on a phone, no dev assistance.

---

## Cycle 2 — Listen (feedback loop)

Goal: make external critique cheap to collect and easy to act on.

| Area | Work |
|---|---|
| Feedback widget | Floating "Feedback" button on every authenticated route; captures message + current path + user id |
| Admin inbox | `/admin/feedback` for triage (admin role already exists via `has_role`) |
| Analytics | Page-view + key-event tracking (apply clicked, win posted, parent linked) |
| Tester program | Invite 5–8 external critics: 2 students, 2 parents, 1 counselor, 1 designer, 1 PM |
| Critique script | 10-min task list testers run through; structured form afterward |

**Demo checkpoint:** present the first 10 pieces of feedback, sorted by theme,
with a proposed response for each.

---

## Cycle 3 — Refine & Grow

Goal: act on Cycle 2 feedback and add the highest-leverage missing features.

Likely candidates (final list comes from feedback):
- Email notifications (Lovable Email): reply on your thread, parent invite redeemed, scholarship deadline approaching
- Moderation: report button on wins/threads/replies; admin queue
- Discussion search + filter by topic
- Advice library seeding (10 articles for students, 10 for parents)
- Scholarship deadline reminders on the dashboard
- Stripe (if monetization is in scope) — gated feature: AI essay review

**Demo checkpoint:** before/after comparison on the top 3 feedback themes;
one new feature shipped end-to-end.

---

## Operating rules

- One cycle = one demo. No demo, cycle isn't done.
- Every cycle ends with: (a) what shipped, (b) what we learned, (c) what
  changed in the plan.
- Feedback that contradicts a design choice gets logged, not auto-applied —
  decide explicitly.
