# Koblio Platform — Progress Dashboard

> Updated automatically by the agent pipeline after every PM/DEV/QA cycle.

**Last updated:** 2026-04-27 | **By:** PM | **Sprint:** 19

---

## Trial Gate 1 — Deployable Web App for Testing

| Requirement | Status |
|---|---|
| Auth system (internal bcrypt + HS256 JWT, no Auth0) | ✅ Done |
| Parent & teacher registration | ✅ Done |
| Student self-registration via class code | ✅ Done |
| 200 math problems seeded (Grades 1–3) | ✅ Done |
| Problem solving UI (MCQ, fill-blank, true/false + KaTeX) | ✅ Done |
| XP, coins, streaks, daily challenge | ✅ Done |
| Teacher dashboard (classes, assignments, student progress) | ✅ Done |
| Parent dashboard (child progress) | ✅ Done |
| Badge system (10 badge types) | ✅ Done |
| Docker Compose VPS deployment + DEPLOY.md | ✅ Done |
| Student profile setup page (`/profile/setup`) | ⏳ Sprint 19 |
| Student home dashboard (`/student/dashboard`) | ⏳ Sprint 19 |
| Forgot password / reset flow | ⏳ Sprint 19 |
| Playwright e2e smoke tests | ⏳ Sprint 19 |

**Trial Gate 1 progress: 10 / 14 done**

---

## Current Sprint: S19 — Trial Gate 1 Polish

**Goal:** Complete remaining gaps so the platform is fully testable by real users on VPS.

| Task ID | Title | Status | Last Actor |
|---|---|---|---|
| TG1-T01 | Student profile setup page | pending | — |
| TG1-T02 | Student home dashboard | pending | — |
| TG1-T03 | Forgot password / reset flow | pending | — |
| TG1-T04 | Playwright e2e smoke tests | pending | — |

---

## Agent Pipeline

| Field | Value |
|---|---|
| Next role | PM |
| Current task | (none) |
| Routine | `koblio-dev-pipeline` — runs every hour |

---

## Completed Sprints Summary

| Sprint | Goal | Key Deliverables |
|---|---|---|
| S01 | Monorepo bootstrap | Turborepo, CI, NestJS, Next.js 15 |
| S02 | Design system | @koblio/ui (10 components), Flutter shell |
| S03 | Auth | Parent/teacher/student auth, RBAC, Sentry, KaTeX |
| S04 | Content pipeline | JSONB problem schema, 50 problems, Problem API |
| S05 | Problem solving | Attempt recording, topic browser, MCQ/fill-blank UI |
| S06 | Gamification v1 | XP, coins, streaks, leaderboard, daily challenge, UI |
| S07 | Teacher + parent dashboards | Class management, assignments, progress, parent view |
| S08 | Badges + avatars | 10 badge types, 200 problems, avatar shop |
| S09 | Badge UI + CMS | Badge shelf, admin problem authoring UI |
| S10 | Monetization | SendGrid weekly digest, Stripe subscriptions |
| S11–S13 | Flutter mobile | Android app, problem solver, gamification UI |
| S14 | Deploy config | Docker + Railway, health check, CORS |
| S15 | Adaptive engine | FSRS-4.5 scheduler, BKT mastery tracking |
| S16 | Mood + blended scheduler | Mood detection, FSRS+BKT+mood weights |
| S17 | Redis leaderboard | ZINCRBY sorted sets, TOP_OF_CLASS badge |
| S18 | Trial Gate 1 ops | Auth0 removed, student class-code registration, VPS deploy |

---

## Recent Activity Log

| Date | Agent | Action |
|---|---|---|
| 2026-04-27 | PM | Sprint 19 launched — Trial Gate 1 polish tasks |
| 2026-04-27 | DEV | Auth0 removed — internal bcrypt + JWT (`b16ec63`) |
| 2026-04-27 | DEV | Student self-registration via class code (`c7e5af1`) |
| 2026-04-27 | DEV | Docker ports localhost-only for nginx compat (`87bed8e`) |
| 2026-04-27 | DEV | Redis sorted-set leaderboard (`2ccabf8`) |
| 2026-04-27 | DEV | TOP_OF_CLASS badge, classroomId wired (`2f6880d`) |
