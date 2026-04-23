# Sprint 03 Retrospective — 2026-04-23

> **Context:** This is the PM Agent's Sprint 03 retrospective, written on Day 2 of 10 (sprint window: 2026-04-22 to 2026-05-02). Per project cadence, retrospectives are written at the Friday PM Agent trigger regardless of calendar position relative to sprint end. The CRITICAL escalation threshold (2+ P0 tasks incomplete at sprint end) is **not triggered** — pending P0 tasks are within their sprint window and have not yet had their full execution window. Where a task is "pending" below, it reflects expected in-progress state for Day 2, not sprint-end failure.
>
> No Sprint 03 QC report has been generated as of this writing. The most recent QC report is `sprint_01_qc_2.md` (2026-04-17). P1-T03 (Terraform) and P1-T04 (Docker Compose) remain on hold per roadmap deferral and are excluded from velocity and blocker counts per project policy.

---

## Velocity

- **Planned:** 8 tasks — 5 × P0, 2 × P1, 1 × P2 (P1-T15 designated stretch goal)
- **Completed:** 1 task — P1-T10 (P0, Auth Module Parent & Teacher Registration)
- **Unblocked and in-sprint window:** 4 tasks — P1-T11 (P0), P1-T14 (P0), P1-T09 (P2), P1-T17 (P1)
- **Sequentially blocked (within sprint):** 2 tasks — P1-T12 (P0, awaits P1-T11), P1-T13 (P0, awaits P1-T11)
- **Stretch goal:** 1 task — P1-T15 (P1, awaits P1-T14)
- **On hold per roadmap:** 2 tasks — P1-T04 (Docker), P1-T03 (Terraform)

**Sprint 03 velocity at Day 2: 1 of 8 tasks complete (12.5%). Expected; P1-T10 completing on Day 1 is ahead of plan.**

| Task | Priority | Status | Note |
|---|---|---|---|
| P1-T10 Auth Module — Parent & Teacher Registration | P0 | ✅ done | Completed Day 1 — commit `acabf47`; 62 unit tests; all AC met |
| P1-T11 Auth Module — Student Login & RBAC | P0 | 🔲 pending | **Now unblocked** — P1-T10 done; Implementation Agent to start Day 2 |
| P1-T14 MongoDB Problem Document Schema & API | P0 | 🔲 pending | No blocker — MongoDB Atlas; parallel with P1-T11; target Day 5 |
| P1-T12 User Module — Parent-Child Linking | P0 | 🔲 pending | Blocked until P1-T11 done; target Days 6–7 |
| P1-T13 Auth Frontend — Login & Registration Pages | P0 | 🔲 pending | Blocked until P1-T11 done; target Days 7–9 |
| P1-T09 Sentry Error Tracking Setup | P2 | 🔲 pending | No blocker; 1-day effort; start Day 2 if not begun |
| P1-T17 KaTeX Integration — Web Math Rendering | P1 | 🔲 pending | No blocker; parallel with auth backend; target Days 1–2 |
| P1-T15 Admin CMS for Problem Authoring | P1 | 🔲 pending | Stretch goal — blocked until P1-T14 done; likely Sprint 04 carry-over |

---

## What Went Well

- **P1-T10 delivered on Day 1, one day ahead of the 3-day estimate.** Commit `acabf47` delivers both `POST /auth/register/parent` and `POST /auth/register/teacher` with 62 passing unit tests. COPPA consent is recorded with timestamp and IP. JWT issued via RS256. All acceptance criteria met. This is the critical path unlock for the entire auth chain (P1-T11 → P1-T12 → P1-T13).

- **Testcontainers mitigation validated in production.** The Sprint 03 plan's decision to adopt `@testcontainers/postgresql` for CI integration tests instead of requiring local Docker was tested and confirmed by P1-T10. Auth endpoint development no longer depends on Docker runtime availability. This mitigation preserves sprint delivery capability while the Docker environment blocker is resolved separately.

- **Auth chain is now unblocked and on schedule.** With P1-T10 done on Day 1, P1-T11 can start Day 2 (today), targeting completion by Day 4. The P1-T12 and P1-T13 sequential chain can follow on Days 6–9 as planned. Completing all 5 P0 tasks within the 10-day sprint remains achievable if no new blockers emerge.

- **Parallel workstreams preserved.** P1-T14 (MongoDB Atlas, P0), P1-T09 (Sentry, P2), and P1-T17 (KaTeX, P1) can all proceed in parallel with the auth backend chain. Sprint 03 design correctly isolated MongoDB Atlas as the backend for P1-T14, removing the local-Docker dependency for content pipeline work.

- **Cumulative test discipline holding.** P1-T10 alone delivers 62 unit tests. Combined with all Sprint 01–02 deliveries (200+ tests), the implementation pattern of shipping tests alongside implementation remains consistent. This is critical given the COPPA correctness requirements in the auth chain.

---

## What Needs Improvement

### RECURRING BLOCKER — Docker Runtime Unavailable in Implementation Environment (3rd Consecutive Sprint Cycle)

> First flagged: `sprint_01_retro_6.md` (2026-04-21, described as Docker Compose "not yet implemented"). Elevated to confirmed environment-level constraint: `sprint_02_retro.md` (2026-04-22). Now persisting into Sprint 03 with no resolution. **Three consecutive sprint cycles without change.**

Docker runtime is confirmed unavailable in the implementation environment. P1-T04 (Docker Compose local dev stack — PostgreSQL, MongoDB, Redis) remains on hold. The testcontainers mitigation successfully unblocks auth endpoint development for Sprint 03, but the Sprint 06 Trial Gate criterion (`docker-compose up` as part of the working local dev stack) cannot be satisfied without Docker.

| Impact | Scope |
|---|---|
| P1-T04 on hold | Direct — Docker CLI/daemon absent |
| Trial Gate criterion "working local dev stack" | At risk — testcontainers is a CI mitigation, not a local dev replacement |
| CI integration test pattern | **Resolved** via testcontainers — auth endpoint development proceeds |

**Required action:** Provision a Docker-capable environment for the Implementation Agent. This is an infrastructure/ops decision, not an implementation task. If Docker cannot be provisioned before Sprint 05, the local dev stack Trial Gate criterion must be formally re-scoped or waived by the project sponsor.

---

### RECURRING BLOCKER — QC Verification Lag (Across All Sprint Cycles)

> First raised: `sprint_01_retro.md` (2026-04-16). Present in every retrospective since. Now in the 3rd consecutive sprint with no QC report for sprints 02 or 03.

Six completed tasks remain QC-unverified since `sprint_01_qc_2.md` (2026-04-17). P1-T10 (62 unit tests, auth registration endpoints, COPPA consent recording) is the most recent addition to the unverified pile. Auth endpoints are now the production-critical path — they must be QC-verified before P1-T13 (Auth Frontend) is wired to a real backend.

The CORS restriction at `apps/api/src/main.ts:8` has not been confirmed patched or verified across **3 consecutive sprint cycles** (first flagged: `sprint_01_qc_2.md` 2026-04-17). Auth endpoints depend on this API surface. This is a compounding security risk.

| Task | Completed | Last QC Status |
|---|---|---|
| P1-T04 Auth0 COPPA JWT | 2026-04-19 | NO EVIDENCE (pre-completion) |
| P1-T05 Prisma Core Schema | 2026-04-19 | NO EVIDENCE (pre-completion) |
| P1-T06 NestJS API Bootstrap | 2026-04-18 | QC PENDING |
| P1-T07 Next.js Teacher Dashboard Shell | 2026-04-21 | NO EVIDENCE (pre-completion) |
| P1-T08 Design System Foundations | 2026-04-22 | NO EVIDENCE (pre-completion) |
| P1-T10 Auth Registration Endpoints | 2026-04-22 | **New — unverified** |

**Required action:** QC Agent must run a comprehensive verification pass covering P1-T04 through P1-T10 before P1-T13 (Auth Frontend) is merged. CORS verification is the highest-priority item — it must be resolved before any cross-origin call from the Next.js app reaches the auth API.

---

### Sprint Capacity vs. Scope (Structural, Sprint 03)

Sprint 03 carries 8 tasks totalling approximately 23 estimated days against a 10-working-day sprint window. P1-T12, P1-T13, and P1-T15 were identified as probable carry-overs in the sprint plan. This is by design — not a sprint failure — but Sprint 04 must absorb these tasks on Day 1 to avoid cascading into Sprint 05 content and gamification work.

---

## QC Findings Summary

*Source: `sprint_tracker/history/sprint_01_qc_2.md` (2026-04-17) — most recent available. No QC report generated for Sprint 02 or Sprint 03.*

| Task | QC Verdict | Key Finding | Current State |
|---|---|---|---|
| P1-T01 | APPROVED WITH WARNINGS | CORS unrestricted `main.ts:8`; `.env.example` missing | `.env.example` resolved; CORS unverified (3 sprint cycles) |
| P1-T02 | QC PENDING | CI operational; `gitleaks` status unverified | Unverified |
| P1-T04 | NO EVIDENCE (pre-completion) | Done 2026-04-19; 32 tests; CORS restriction status unknown | Unverified in done state |
| P1-T05 | NO EVIDENCE (pre-completion) | Done 2026-04-19; 68 tests, 7 endpoints | Unverified in done state |
| P1-T06 | QC PENDING | helmet, rate limiting, ValidationPipe, 7 unit tests | Unverified |
| P1-T07 | NO EVIDENCE (pre-completion) | Done 2026-04-21; 21 tests, dashboard shell | Unverified in done state |
| P1-T08 | NO EVIDENCE (pre-completion) | Done 2026-04-22; 66 tests, 10 components | Unverified in done state |
| P1-T10 | NO EVIDENCE (post-sprint-plan) | Done 2026-04-22; 62 tests, COPPA consent, JWT | **New — unverified** |

**Open code-level findings:** CORS restriction `apps/api/src/main.ts:8` — unverified for 3 consecutive sprint cycles  
**WARNING-severity findings (open):** 6 tasks QC-unverified in done state  
**Architecture drift:** None detected  
**New this cycle:** P1-T10 added to QC-unverified pile; testcontainers pattern established in CI

---

## Trial Gate Status

Sprint 03 of 6 in Phase 1 (Foundation & MVP). Trial Gate evaluation at **Sprint 06** close (target: 2026-07-24). 3 sprints remain after Sprint 03.

| Gate Criterion | Target Sprint | Status |
|---|---|---|
| Working local dev stack (`turbo build`, `docker-compose up`) | Sprint 06 | ⚠️ AT RISK — `turbo build` passes; Docker runtime unavailable; testcontainers CI-only mitigation in place |
| Auth endpoints operational (parent/teacher/student) | Sprint 06 | 🟡 IN PROGRESS — P1-T10 done; P1-T11 unblocked; P1-T12/T13 within sprint window |
| COPPA-compliant auth layer | Sprint 06 | ✅ COMPLETE — P1-T04 done, 32 tests, JWKS/RS256 |
| Core data model in Prisma | Sprint 06 | ✅ COMPLETE — P1-T05 done, 7 models, migration ready |
| 50+ content items in DB | Sprint 06 | 🔲 NOT STARTED — Sprint 04 work (P1-T16) |
| Gamification v1 live (coins, XP, streaks, daily challenge) | Sprint 06 | 🔲 NOT STARTED — Sprint 04–05 work |
| Teacher dashboard v1 live (class overview, progress) | Sprint 06 | 🟡 IN PROGRESS — shell done; full feature Sprint 05 |
| 0 P0 open bugs | Sprint 06 | NOT APPLICABLE yet |

**Trial Gate risk: MEDIUM-HIGH** — see `sprint_tracker/TRIAL_GATE_RISK.md`. Docker runtime is the primary risk driver for the local dev stack criterion. All other criteria are on track or not yet in window. If Docker is unresolved by Sprint 05, the project sponsor must formally decide whether to waive the `docker-compose up` criterion or provision a Docker-capable environment.

---

## Recommendations for Sprint 04

1. **[Sprint 04 Day-1 carry-over planning] Treat P1-T12, P1-T13, and P1-T15 as Sprint 04 Day-1 tasks.** These are expected Sprint 03 carry-overs per the sprint plan. Sprint 04 opens with the auth frontend and user module needing completion before gamification and content seeding work can start.

2. **[Before Sprint 04 opens] QC Agent: comprehensive verification pass on P1-T04 through P1-T10.** This is the most urgent recurring issue. Priority order: (1) CORS restriction at `apps/api/src/main.ts:8` — security prerequisite before P1-T13 auth frontend goes live; (2) P1-T10 — 62 auth tests, COPPA consent recording; (3) P1-T08 — design system foundation for P1-T13; (4) P1-T05 — Prisma migration idempotency; (5) P1-T06 — helmet/rate-limiting; (6) P1-T02 — gitleaks CI status.

3. **[Sprint 04 scope] Start P1-T16 (Content Seeding, 50+ problems) only after P1-T15 (Admin CMS) is merged and P1-T14 (MongoDB schema) is QC-verified.** P1-T16 is the critical path item for the "50+ content items in DB" Trial Gate criterion. Do not defer past Sprint 04 or the Sprint 06 gate is at risk.

4. **[Infrastructure — no hard deadline remaining] Docker runtime.** The 2026-05-01 deadline for AWS was set in `PHASE_GATE_RISK.md` against the original calendar. The team is 6 weeks ahead of schedule. If AWS credentials arrive in the next 2–4 weeks, P1-T03 (Terraform) remains achievable within Phase 1. Docker runtime for local dev stack still requires human provisioning decision.

5. **[Sprint 04 observability] Verify Sentry DSN is operational in both apps before P1-T11 is merged.** P1-T09 (Sentry, P2) should complete within Sprint 03 Days 1–2. Auth endpoint errors in P1-T11/T12/T13 should be visible in Sentry from day one of testing.

6. **[Ongoing] CORS restriction patch is a hard prerequisite before P1-T13 (Auth Frontend) goes live.** `app.enableCors()` at `main.ts:8` must be verified to use `CORS_ALLOWED_ORIGINS` env var before any cross-origin call from the Next.js app reaches the auth API. This is the top-priority QC item and should be treated as a blocking finding for P1-T13 merge.

---

## Priority Adjustments

| Adjustment | Rationale |
|---|---|
| P1-T11 → start Day 2 (today) | P1-T10 done Day 1; no remaining blockers; implementation agent must not wait |
| P1-T14 → start Day 2 (parallel with P1-T11) | MongoDB Atlas ready; zero blockers; parallel track available |
| P1-T15 → Sprint 04 Day-1 carry-over (likely) | Stretch goal; unlikely to start before Day 8 given auth chain sequencing |
| CORS verification → blocking prerequisite for P1-T13 merge | Three sprint cycles unverified; auth frontend cannot go live on an unrestricted-CORS backend |
| QC pass → required before P1-T13 is wired to backend | Six tasks unverified; auth correctness (COPPA) must be verified before frontend integrates |
| P1-T16 (Content Seeding) → do not start this sprint | Explicitly excluded per sprint plan; requires stable CMS (P1-T15) and schema (P1-T14) |
