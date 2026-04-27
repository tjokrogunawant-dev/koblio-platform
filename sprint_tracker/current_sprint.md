# Current Sprint State

**Sprint:** 08  
**Phase:** 1 — Foundation & MVP  
**Start:** 2026-04-27  
**End:** 2026-05-09  
**Sprint Goal:** Section 6 Part 1 — Badge system (10 badge types, synchronous award after each attempt) and avatar selection (8 pre-made avatars, student picks on profile setup). This starts the growth/retention loop.

---

## Roadmap Context

The project is now following `koblio_mvp_roadmap.md`. Key reminders:

- **No BullMQ/Redis until Section 9** — badge awarding is synchronous (in AttemptService, same as gamification side-effects)
- **Web-only until Trial Gate 2** — Flutter/Android resumes in Sprint 11+
- **No AWS/Terraform until Section 9** — still targeting Railway at Trial Gate 1
- **Trial Gate 1 context** — all Sections 1-5 complete; the MVP core is functionally done. Section 6 adds the retention layer before beta launch.

---

## Active Tasks

None yet — Sprint 08 just started.

---

## On Hold (Intentionally deferred)

| Task ID | Title | Deferred To | Reason |
|---|---|---|---|
| P1-T15 | Admin CMS for Problem Authoring | Section 6 Sprint 10 | Seed problems via JSON files; CMS needed only when non-devs author content |
| P1-T04 | Docker Compose Local Dev Environment | Nice-to-have | Use Neon + Docker Desktop on Windows |
| P1-T05 (AWS) | Provision AWS Staging Environment | Section 9 | Deploy to Railway at Trial Gate 1; AWS at 5K+ MAU |
| P2-T04 | Weekly Email Digest | Sprint 09 | Needs SendGrid/Resend credentials; not blocking Section 6 Part 1 |
| P2-T05/T06 | Stripe Subscriptions + Paywall | Sprint 10 | Needs Stripe test keys; doing badges + avatars first |

---

## Completed (All Sprints)

| Task ID | Title | Sprint | Commit |
|---|---|---|---|
| P1-T01 | Initialize Turborepo Monorepo | S01 | `e81a0d8` |
| P1-T02 | GitHub Actions CI Pipeline | S01 | `ed0943d` |
| P1-T04* | Auth0 JWT + RBAC Guards + COPPA roles | S01 | `0e372b3` |
| P1-T05* | Prisma Schema + Core API Endpoints | S01 | `f536c19` |
| P1-T06* | NestJS API Bootstrap (helmet, rate limiting) | S01 | `a94b3e9` |
| P1-T07* | Next.js 15 Web App + Teacher Dashboard Shell | S01 | `e164ac6` |
| P1-T08 | Design System Foundations (10 components, @koblio/ui) | S02 | `b32e2bf` |
| P1-T08† | Flutter App Shell (GoRouter, Riverpod, Dio) | S02 | `a85d6fd` |
| P1-T10 | Auth Module — Parent & Teacher Registration | S03 | `acabf47` |
| P1-T11 | Auth Module — Student Login & RBAC enforcement | S03 | `d864978` |
| P1-T09 | Sentry Error Tracking Setup (web + API) | S03 | `9ce700e` |
| P1-T17 | KaTeX Integration — Web Math Rendering | S03 | `9ce700e` |
| P1-T12 | Parent-Child Linking & School Association | S03 | `4b2767d` |
| P1-T13 | Auth Frontend — Login & Registration Pages | S03 | `96bd921` |
| P1-T14r | Problem Schema (JSONB) in Prisma | S04 | `7b3a063` |
| P1-T14a | Problem API (GET /problems, filters, pagination) | S04 | `7b3a063` |
| P1-T14s | Seed 50 Math Problems (Grades 1-3) | S04 | `ff736f2` |
| P1-T21 | Student Attempt Recording + Stats API | S05 | `0b076e2` |
| P1-T18 | Topic Browser UI (grade→strand→topic) | S05 | `593043f` |
| P1-T19 | Problem Display (MCQ/fill-blank/true-false + KaTeX) | S05 | `593043f` |
| P1-T20 | Answer Submission + Feedback + Solution Reveal | S05 | `593043f` |
| P1-T23 | Points Ledger (coins per correct answer, scaled by difficulty) | S06 | `f34aa65` |
| P1-T24 | XP + Levels (accumulate from attempts, level thresholds) | S06 | `f34aa65` |
| P1-T25 | Daily Streak (last_active_date, streak_count, 7-day bonus) | S06 | `f34aa65` |
| P1-T26 | Class Leaderboard (SQL RANK() OVER, weekly window) | S06 | `f34aa65` |
| P1-T27 | Daily Challenge (deterministic per-grade per-day selection) | S06 | `f34aa65` |
| P1-T28 | Gamification UI (CoinCounter, XPBar, StreakBadge, LeaderboardWidget, DailyChallengeCard) | S06 | `a85bc16` |
| P1-T29 | Class Management API (POST/GET /classrooms, class code generation) | S07 | `3c8eb62` |
| P1-T30 | Assignment Creation API (POST /assignments, teacher-owned) | S07 | `3c8eb62` |
| P1-T31 | Assignment Tracking (GET /assignments/student, POST /assignments/:id/submit) | S07 | `3c8eb62` |
| P1-T32 | Student Progress View (GET /classrooms/:id/progress) | S07 | `3c8eb62` |
| P1-T33 | Parent View (GET /parent/children, GET /parent/children/:id/progress) | S07 | `49a625c` |
| P1-T34* | Teacher Dashboard UI (classes, assignments, progress tabs) | S07 | `e1fdd52` |
| P1-T35* | Parent Dashboard UI (child progress cards, linked children) | S07 | `49a625c` |
| P1-T36* | Student Assignment Solve Flow | S07 | `e1fdd52` |

---

## Sprint Blockers

None. All active tasks are unblocked.

---

## Up Next (Sprint 08 — Section 6, Part 1)

Tasks from `koblio_mvp_roadmap.md` Section 6:

- **P2-T01**: Badge system — 10 badge types, synchronous award in AttemptService (no BullMQ for MVP)
  - Badge types: First Correct, First Perfect Score, 7-Day Streak, 30-Day Streak, 100 Problems Attempted, 50 Correct, Fraction Master (grade 3 fractions 100% correct), Speed Demon (correct answer in <10s), Math Explorer (5 different topics), Top of Class (leaderboard rank 1)
  - Prisma: `Badge` model (type enum, studentId, awardedAt), `GET /badges/me` endpoint
  - Award badges after each attempt submit; idempotent (no duplicates)
  - Frontend: badge shelf in student dashboard + badge detail tooltip

- **P2-T02**: Avatar selection
  - 8 pre-made avatars identified by slug (fox, owl, bear, penguin, cat, dog, rabbit, dragon)
  - `User.avatarSlug String?` field; `PUT /me/avatar` endpoint
  - Frontend: avatar picker on student profile setup, avatar shown in dashboard header

- **P2-T08**: Expand seed content to 200+ problems (P0 priority)
  - Add Grade 1-3 complete coverage: expand from 50 to 200+ problems
  - All problem types (MCQ, fill-in-blank, true/false), all strands

---

## Last Updated
2026-04-27 by PM — Sprint 07 complete. Section 5 (Teacher Dashboard) closed. Moving to Sprint 08 (Section 6 — Growth Features Part 1) immediately.
