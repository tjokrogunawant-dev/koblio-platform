# Current Sprint State

**Sprint:** 19  
**Phase:** Trial Gate 1 — Polish & Validation  
**Start:** 2026-04-27  
**End:** 2026-05-10  
**Sprint Goal:** Complete the remaining gaps for Trial Gate 1 — profile setup, student dashboard, password reset, and smoke tests so the platform is ready for real-user testing on VPS.

---

## Roadmap Context

The project follows `koblio_mvp_roadmap.md`. Key state as of Sprint 19:

- **Trial Gate 1 deployment is ready** — docker-compose VPS deploy works, no external accounts required
- **Auth0 removed** — all auth uses internal bcrypt + HS256 JWT (`iss: koblio-internal`)
- **Student self-registration via class code** — `POST /auth/register/student` + `/register/student` page live
- **AWS/Terraform written** (S18, commits f17cb46 + cce1cd5) — reference IaC only, not deployed; Railway stays live
- **Web-only until Trial Gate 2** — Flutter/Android stays parked
- **Redis leaderboard done** — ZINCRBY sorted sets, TOP_OF_CLASS badge wired

---

## Active Tasks

- **TG1-T01** (next): Student profile setup page — `/profile/setup` route; avatar picker (8 slugs), display name confirm, redirect to `/student/dashboard` on save. Students are redirected here after registration but the page is missing.

- **TG1-T02**: Student home dashboard — `/student/dashboard` with XP bar, coin counter, streak widget, "Today's Challenge" card, and "Practice" button linking to topic browser. Currently no home screen after login.

- **TG1-T03**: Forgot password / reset flow — `POST /auth/forgot-password` (generate 1h token, send SendGrid email if key set, else log token), `POST /auth/reset-password` (validate token, bcrypt new hash, invalidate token), plus `/forgot-password` and `/reset-password?token=...` pages.

- **TG1-T04**: Playwright e2e smoke tests — golden path: register teacher → create class → register student with class code → solve one problem → verify XP awarded. Run in CI via `pnpm test:e2e`.

---

## On Hold (Intentionally deferred)

| Task ID | Title | Deferred To | Reason |
|---|---|---|---|
| P1-T15 | Admin CMS for Problem Authoring | Section 6 Sprint 10 | Seed problems via JSON files |
| AWS deploy | AWS ECS Fargate deploy | Section 9 (5K+ MAU) | IaC written; credentials not provisioned |

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
| P1-T08† | Flutter App Shell (GoRouter, Riverpod, Auth0 stub, login screen) | S02 | `a85d6fd` |
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
| P4-T01 | Docker + Railway Config (multi-stage pnpm builds, railway.toml, Procfile) | S14 | `a2fac62` |
| P4-T02 | Health Check + DEPLOY.md + CORS hardening | S14 | `b06b571` |
| P5-T01 | FSRS-4.5 Scheduler (CardState model, review recording, adaptive endpoint) | S15 | `65df6c7` |
| P5-T02 | BKT Mastery Tracking (SkillMastery model, per-attempt update, GET /mastery/me) | S15 | `96720e6` |
| P5-T03 | Mood Detection (FLOW/FRUSTRATED/CONFUSED/BORED, weight-shift table, GET /mood/me) | S16 | `fc1c381` |
| P5-T04 | Blended Scheduler (FSRS urgency + BKT novelty + mood-gated weights, O(1) batch scoring) | S16 | `bb0d22a` |
| P6-T01 | Redis Leaderboard (ZINCRBY/ZREVRANGE, classroom + global keys, 8-day TTL, SQL fallback) | S17 | `2ccabf8` |
| P6-T02 | TOP_OF_CLASS Badge (ZREVRANK === 0 trigger, classroomId wired from Enrollment) | S17 | `2f6880d` |
| Auth-NBI | Remove Auth0 — internal bcrypt + HS256 JWT for all roles | S18 | `b16ec63` |
| TG1-REG | Student self-registration via class code (POST /auth/register/student) | S18 | `c7e5af1` |
| P7-T01 | Terraform AWS infrastructure (VPC, ECS, RDS, Redis, S3, IAM) — reference IaC | S18 | `f17cb46` |
| P7-T02 | GitHub Actions ECS CD pipeline — ECR push + rolling deploy | S18 | `cce1cd5` |
| TG1-OPS | Docker Compose VPS deployment — localhost port binding, DEPLOY.md, .env.example | S18 | `87bed8e` |

---

## Sprint Blockers

None. VPS deployment is live and ready for user testing.

---

## Last Updated
2026-04-27 by PM — Trial Gate 1 deployment complete. Sprint 19 launched: student profile setup, home dashboard, password reset, e2e smoke tests.
