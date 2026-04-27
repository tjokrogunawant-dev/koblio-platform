# Current Sprint State

**Sprint:** 14  
**Phase:** 3 — Trial Gate 2 / Closed Beta Prep  
**Start:** 2026-04-27  
**End:** 2026-05-10  
**Sprint Goal:** Deploy-ready infrastructure — Dockerize API + web, Railway config, migration runbook, health checks. Targets Trial Gate 2 (closed beta invite).

---

## Roadmap Context

The project is now following `koblio_mvp_roadmap.md`. Key reminders:

- **No BullMQ/Redis until Section 9** — badge awarding is synchronous (in AttemptService, same as gamification side-effects)
- **Web-only until Trial Gate 2** — Flutter/Android resumes in Sprint 11+
- **No AWS/Terraform until Section 9** — still targeting Railway at Trial Gate 1
- **Trial Gate 1 context** — all Sections 1-5 complete; the MVP core is functionally done. Section 6 adds the retention layer before beta launch.

---

## Active Tasks

- **P4-T01** (Dev1): Dockerize API + Railway TOML config for API and web
- **P4-T02** (Dev2): Deployment runbook + pre-beta checklist, health check endpoint

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
| P2-T01 | Badge System (10 types, synchronous award, idempotent) | S08 | `9261cb0` |
| P2-T02 | Avatar Selection (8 slugs, PUT /me/avatar, avatar component) | S08 | `44bfbe6` |
| P2-T08 | Problem Seed Expansion (50 → 200 problems, Grades 1-3) | S08 | `44bfbe6` |
| P2-T03 | Badge Shelf UI (responsive grid, tooltips, student dashboard) | S09 | `33c7420` |
| P2-T07 | Admin CMS — Problem Authoring UI + POST/PUT /content/problems | S09 | `0f4b9b1` |
| P2-T04 | Weekly Email Digest (SendGrid, Monday 8am UTC cron) | S10 | `6b087e2` |
| P2-T05 | Stripe Subscriptions (Checkout, webhook, subscriptionStatus on User) | S10 | `96605a1` |
| P3-T01 | Flutter Android App Shell (GoRouter, Riverpod, Auth0 stub, login screen) | S11 | `4b76789` |
| P3-T02 | Flutter Student Screens (home, problem list, problem solver, all 3 types) | S11 | `6d719cf` |
| P3-T03 | Flutter Math Rendering (MathText widget, flutter_math_fork, LaTeX in solver) | S12 | `4f52099` |
| P3-T04 | Auth0 PKCE Login (flutter_appauth, Parent/Teacher, logout confirmation) | S12 | `da6c675` |
| P3-T05 | Flutter Gamification UI (XP bar, streak counter, badge shelf, home integration) | S13 | `85fefcc` |
| P3-T06 | Flutter Parent Dashboard (children list, child progress detail, role-based nav) | S13 | `85fefcc` |

---

## Sprint Blockers

None. All active tasks are unblocked.

---

## Up Next (Sprint 15 — Adaptive Engine / Section 8)

- FSRS-4.5 spaced repetition scheduler
- BKT (Bayesian Knowledge Tracing) per-skill mastery
- Mood-gated weight shifts (FLOW/FRUSTRATED/CONFUSED/BORED)
- TOP_OF_CLASS badge (leaderboard rank-1 detection)

---

## Last Updated
2026-04-27 by PM — Sprint 13 complete (P3-T05 gamification UI, P3-T06 parent dashboard). Sprint 14 launched: Docker + Railway deployment prep.
