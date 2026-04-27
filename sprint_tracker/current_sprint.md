# Current Sprint State

**Sprint:** 07  
**Phase:** 1 — Foundation & MVP  
**Start:** 2026-04-27  
**End:** 2026-05-09  
**Sprint Goal:** Build the Teacher Dashboard (Section 5 of MVP roadmap) — class management, assignment creation, assignment tracking, student progress view, and parent read-only view. This closes Section 5 and puts us one sprint away from Trial Gate 1.

---

## Roadmap Context

The project is now following `koblio_mvp_roadmap.md` (revised 2026-04-23). Key changes from the original plan:

- **Web-only until Trial Gate 2** — Flutter/Android resumes in Sprint 11+
- **PostgreSQL JSONB replaces MongoDB** for Sprint 04 content pipeline — no Atlas credentials needed
- **No Redis until Section 9** — streaks and leaderboards run on PostgreSQL for MVP
- **No AWS/Terraform until Section 9** — deploy to Railway at Trial Gate 1 (~Jun 27)
- **Credentials are never blockers** — see the credential map in `koblio_mvp_roadmap.md`

---

## Active Tasks

None yet — Sprint 07 just started.

---

## On Hold (Intentionally deferred — not blockers)

| Task ID | Title | Deferred To | Reason |
|---|---|---|---|
| P1-T15 | Admin CMS for Problem Authoring | Section 6 (Sprint 10) | Seed problems via JSON files for MVP; CMS needed only when non-devs author content |
| P1-T04 | Docker Compose Local Dev Environment | Nice-to-have | Use Neon + Docker Desktop on Windows; not blocking any work |
| P1-T05 (AWS Terraform) | Provision AWS Staging Environment | Section 9 (Sprint 19+) | Deploy to Railway at Trial Gate 1; AWS needed only at 5K+ MAU |

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

---

## Sprint Blockers

None. All active tasks are unblocked. Work continues regardless of external credentials.

---

## Up Next (Sprint 07 — Teacher Dashboard)

Section 5 of `koblio_mvp_roadmap.md`:

- **P1-T29**: Class management — teacher creates class, students join by class code; API: `POST /classrooms`, `GET /classrooms/mine`, `GET /classrooms/:id/students`
- **P1-T30**: Assignment creation — teacher assigns topic + difficulty + optional deadline; API: `POST /assignments`, `GET /assignments/mine`
- **P1-T31**: Assignment tracking — students see assigned work; submissions auto-graded; API: `GET /assignments/student`, `POST /assignments/:id/submit`
- **P1-T32**: Student progress view — teacher sees % correct by topic, streak status per student; API: `GET /classrooms/:id/progress`
- **P1-T33**: Parent view — read-only child progress dashboard; `GET /parent/children/:childId/progress`

No new external services required.

---

## Last Updated
2026-04-27 by PM — Sprint 06 complete. Section 4 (Gamification) closed. Moving to Sprint 07 (Section 5 — Teacher Dashboard) immediately.
