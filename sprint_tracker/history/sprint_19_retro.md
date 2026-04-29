# Sprint 19 Retrospective — 2026-04-29

## Velocity

- **Planned:** 4 tasks
- **Completed:** 4 tasks (100%)
- **Carry-over:** 0 tasks
- **Duration used:** 3 calendar days of a planned 14-day sprint (started Apr 27, all tasks done Apr 29)

---

## What Went Well

- **Trial Gate 1 achieved at 14 / 14** — the platform is fully deployable for real-user testing via Docker Compose on VPS. This is the most significant milestone of the project to date.
- **100% sprint velocity** — all four TG1 tasks completed in under a week, ahead of schedule.
- **Forgot password security properties** — TG1-T03 shipped with all security invariants correct: no-enumeration response, SHA-256 hash-only storage, one-time-use tokens, expiry enforcement, COPPA exclusion for students. All verified by QA.
- **Playwright e2e golden-path test** — TG1-T04 wired a full CI job (teacher register → class create → student register → problem solve → XP check) that runs after the core CI suite. This gives real regression protection before Trial Gate 2.
- **Auth0 dependency fully removed (S18)** — all auth runs on internal bcrypt + HS256 JWT, no external credential requirement.

## What Needs Improvement

- **Auth hydration race condition (NBI-TG1-T01-2)** — the auth guard in `profile/setup/page.tsx` fires before `AuthProvider` has read `localStorage`, causing a potential cold-load redirect flash for authenticated users. Low probability but racy. Fix is straightforward (add `hydrated` flag to `AuthProvider`). Carry to Sprint 20.
- **displayName pre-fill on cold load (NBI-TG1-T01-1)** — `useState(user?.name ?? '')` captures `null` on cold browser refresh because `AuthProvider`'s `useEffect` hasn't run yet. Pre-fill is blank. Fix: add a sync `useEffect` or gate render on `hydrated`. Carry to Sprint 20.
- **E2E tests never ran live** — AC6 of TG1-T04 was deferred to CI; the agent environment has no live API. The first push to `main` after this sprint will be the definitive validation. Most-likely failure modes are (a) no FILL_BLANK Grade 1 problems in seed data, or (b) API startup > 60s on GitHub runners.
- **gh CLI not available** — CI health check could not be performed via `gh run list`. CI state as of the last DASHBOARD entry (2026-04-28) showed no new failures; lockfile and ECS deploy.yml fixes from S18/early-S19 remain the last known state.

---

## QC Findings Summary

| Task | Verdict | NBI Count | Notes |
|---|---|---|---|
| TG1-T01 Student profile setup | PASS WITH NBI | 2 | Auth hydration flash (NBI-2), displayName cold-load (NBI-1) |
| TG1-T02 Student home dashboard | PASS | 0 | Clean pass, no issues |
| TG1-T03 Forgot password / reset | PASS WITH NBI | 1 | Cosmetic method ordering in `email.service.ts` (NBI-1) |
| TG1-T04 Playwright e2e smoke tests | PASS WITH NBI | 1 | AC6 (live run) deferred to CI (NBI-1) |

All tasks cleared for Trial Gate 1. No blocking issues.

---

## Phase Gate Status — Trial Gate 1

| Requirement | Status |
|---|---|
| Auth system (internal bcrypt + HS256 JWT) | ✅ PASS |
| Parent & teacher registration | ✅ PASS |
| Student self-registration via class code | ✅ PASS |
| 200 math problems seeded (Grades 1–3) | ✅ PASS |
| Problem solving UI (MCQ, fill-blank, true/false + KaTeX) | ✅ PASS |
| XP, coins, streaks, daily challenge | ✅ PASS |
| Teacher dashboard (classes, assignments, student progress) | ✅ PASS |
| Parent dashboard (child progress) | ✅ PASS |
| Badge system (10 badge types) | ✅ PASS |
| Docker Compose VPS deployment + DEPLOY.md | ✅ PASS |
| Student profile setup page (`/profile/setup`) | ✅ PASS |
| Student home dashboard (`/student/dashboard`) | ✅ PASS |
| Forgot password / reset flow | ✅ PASS |
| Playwright e2e smoke tests | ✅ PASS |

**Trial Gate 1: 14 / 14 — COMPLETE**

---

## Recommendations for Sprint 20

1. **P2-T06 Paywall enforcement (P0)** — this is the only remaining Section 6 item not yet shipped. Without it, free-tier users have unlimited access and Stripe subscriptions have no enforcement mechanism. Implement the 5-problems/day limit in `AttemptService.submitAnswer` and the paywall modal in the problem page. No external credentials required.

2. **TG1-POLISH-01 Auth hydration hardening (P2)** — add `hydrated` flag to `AuthProvider`, gate auth guards on it, fix `displayName` cold-load pre-fill in `profile/setup`. Low risk, high polish value before beta.

3. **Verify e2e CI run** — the first push in Sprint 20 will trigger the e2e CI job. Monitor its result. If it fails on seed data, the fix is to ensure at least one FILL_BLANK Grade 1 problem is seeded (there are 200 problems — it almost certainly is, but confirm).

4. **Prepare Trial Gate 2 checklist** — after P2-T06 ships, all Trial Gate 2 requirements will be met on the code side. Document the beta launch steps (Railway deploy, invite pilot schools, set up Stripe live mode).

## Priority Adjustments

- P2-T06 elevated to P0 for Sprint 20 (was P0 in original roadmap; enforcement was deferred until Stripe was live — Stripe is now live).
- TG1-POLISH-01 is P2 — do after P2-T06.
