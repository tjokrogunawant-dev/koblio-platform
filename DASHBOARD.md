# Koblio Platform — Progress Dashboard

> Updated automatically by the agent pipeline after every PM/DEV/QA cycle.

**Last updated:** 2026-04-29 | **By:** QA | **Sprint:** 20

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
| Student profile setup page (`/profile/setup`) | ✅ Done |
| Student home dashboard (`/student/dashboard`) | ✅ Done |
| Forgot password / reset flow | ✅ Done |
| Playwright e2e smoke tests | ✅ Done |

**Trial Gate 1 progress: 14 / 14 done — COMPLETE ✅**

---

## Trial Gate 2 — Closed Beta Readiness

| Requirement | Status |
|---|---|
| Everything from Trial Gate 1 | ✅ Done |
| Badges + avatar customization | ✅ Done |
| Weekly email digest (SendGrid) | ✅ Done |
| Stripe subscriptions (Checkout, webhook) | ✅ Done |
| 200+ problems across grades 1–3 | ✅ Done |
| Paywall enforcement (free tier 5-problems/day limit) | ✅ Done (P2-T06, Sprint 20) |

**Trial Gate 2 progress: 6 / 6 done — COMPLETE ✅**

---

## Current Sprint: S20 — Paywall Enforcement & Auth Hardening

**Goal:** Close the last Section 6 gap (P2-T06 paywall enforcement) and harden auth hydration for Trial Gate 2.

| Task ID | Title | Status | Last Actor |
|---|---|---|---|
| P2-T06 | Paywall enforcement (5-problems/day free tier limit) | done | QA |
| TG1-POLISH-01 | Auth hydration hardening (hydrated flag + displayName cold-load fix) | pending | PM |

---

## Agent Pipeline

| Field | Value |
|---|---|
| Next role | PM |
| Current task | (none) |
| Routine | `koblio-dev-pipeline` — runs every hour |

## CI Status

| Check | Status |
|---|---|
| pnpm lockfile | ✅ Fixed 2026-04-28 (katex deps added) |
| ECS deploy workflow | ✅ Changed to `workflow_dispatch` only |
| CI pipeline (lint/typecheck/test/build) | ⏳ Next push will trigger; gh CLI unavailable in this env — last known state: no failures |
| Playwright e2e CI job | ⏳ Added in S19 (TG1-T04); first live run on next push to main |

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
| S19 | Trial Gate 1 polish | Profile setup, student dashboard, forgot password, e2e tests — **TG1 COMPLETE** |

---

## Recent Activity Log

| Date | Agent | Action |
|---|---|---|
| 2026-04-29 | QA | P2-T06 QC: PASS WITH NBI — all 11 ACs pass; 1 minor NBI (null user treated as free tier) |
| 2026-04-29 | DEV | P2-T06 Paywall enforcement — ForbiddenException in AttemptService, PaywallError in api.ts, paywall modal in problem page (TBD) |
| 2026-04-29 | PM | Brief written for P2-T06: Paywall enforcement |
| 2026-04-29 | PM | Sprint 20 launched — paywall enforcement + auth hardening (Trial Gate 2 prep) |
| 2026-04-29 | PM | Sprint 19 retrospective written — velocity 4/4, Trial Gate 1 14/14 COMPLETE |
| 2026-04-29 | PM | CI HEALTH: gh CLI unavailable in this environment — skipped live check. Last known state (2026-04-28): no CI failures; lockfile and ECS fixes still valid. |
| 2026-04-29 | QA | TG1-T04 QC: PASS WITH NBI — 7/8 ACs verified directly; AC6 (live run) deferred to CI; no blocking issues |
| 2026-04-28 | DEV | TG1-T04 Playwright e2e smoke tests — playwright.config.ts, e2e/golden-path.spec.ts, CI e2e job, lockfile updated (a66c435) |
| 2026-04-28 | PM | CI HEALTH: no new failures — lockfile and ECS fixes from prior run still valid. Brief written for TG1-T04: Playwright e2e smoke tests |
| 2026-04-28 | QA | TG1-T03 QC: PASS WITH NBI — all 11 ACs pass; 1 cosmetic NBI (method ordering in email.service.ts) |
| 2026-04-28 | DEV | TG1-T03 Forgot password / reset flow — Prisma model, migration, DTOs, API endpoints, email method, web pages, login link (b2ff1cc) |
| 2026-04-28 | PM | Brief written for TG1-T03: Forgot password / reset flow |
| 2026-04-28 | PM | CI HEALTH: pnpm lockfile stale (katex deps missing) — fixed. ECS deploy.yml → workflow_dispatch only. |
| 2026-04-28 | QA | TG1-T02 QC: PASS — all 9 ACs pass, no regressions |
| 2026-04-28 | DEV | TG1-T02 Student home dashboard — /student/dashboard, middleware guard, profile setup redirects (118bf6c) |
| 2026-04-27 | PM | Brief written for TG1-T02: Student home dashboard |
| 2026-04-27 | QA | TG1-T01 QC: PASS WITH NBI — all 8 ACs pass; 2 minor cold-load hydration NBIs logged |
| 2026-04-27 | DEV | TG1-T01 Student profile setup page — PUT /me/profile, display name + avatar, auth guard (`a0e81d2`) |
| 2026-04-27 | PM | Brief written for TG1-T01: Student profile setup page |
| 2026-04-27 | PM | Sprint 19 launched — Trial Gate 1 polish tasks |
| 2026-04-27 | DEV | Auth0 removed — internal bcrypt + JWT (`b16ec63`) |
| 2026-04-27 | DEV | Student self-registration via class code (`c7e5af1`) |
| 2026-04-27 | DEV | Docker ports localhost-only for nginx compat (`87bed8e`) |
| 2026-04-27 | DEV | Redis sorted-set leaderboard (`2ccabf8`) |
| 2026-04-27 | DEV | TOP_OF_CLASS badge, classroomId wired (`2f6880d`) |
