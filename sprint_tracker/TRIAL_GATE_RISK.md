# TRIAL GATE RISK ALERT — Phase 1 Trial Gate (Sprint 06)

**Filed:** 2026-04-26
**Filed by:** PM Agent (Sprint 03 Retrospective — 2026-04-26)
**Supersedes:** `PHASE_GATE_RISK.md` for terminology; underlying risk data carried forward and updated.
**Phase:** 1 — Foundation & MVP
**Trial Gate Sprint:** Sprint 06 (target close: 2026-07-25)
**Risk Level:** HIGH *(two RECURRING BLOCKERs; 4 P0 tasks not started at Sprint 03 Day 5; M1.1 at acute risk)*

---

## Risk Summary

Two RECURRING BLOCKERs have persisted across three consecutive sprint cycles with no resolution. Four P0 tasks are unstarted at Sprint 03 mid-point. The M1.1 milestone (staging deployment by 2026-05-16) is at acute risk due to a hard credential deadline in 5 days.

---

## Active Risk Items

### 1. AWS Credentials Not Provisioned (RECURRING BLOCKER)

| Field | Detail |
|---|---|
| First flagged | `sprint_01_retro.md` — 2026-04-16 |
| Current sprint | Sprint 03 (third consecutive cycle blocked) |
| Blocks | P1-T03 (Terraform + ECS Fargate) |
| Hard deadline | **2026-05-01** |
| Consequence if missed | P1-T03 carries to Sprint 04; M1.1 (staging live) cannot be met by 2026-05-16; Trial Gate criterion "working local dev stack" at HIGH risk |
| Owner action | Project sponsor must confirm IAM credential provisioning status immediately |

**Escalation trigger:** If credentials are not confirmed provisioned by 2026-05-01, update this file's risk level to **CRITICAL** and mark P1-T03 BLOCKED in `sprint_tracker/current_sprint.md`.

---

### 2. Docker Runtime Unavailable (RECURRING BLOCKER)

| Field | Detail |
|---|---|
| First flagged | `sprint_01_retro_6.md` — 2026-04-21 |
| Current sprint | Sprint 03 (third consecutive cycle) |
| Blocks | P1-T04 (Docker Compose Local Dev) — HOLD |
| Mitigation in place | Testcontainers (PostgreSQL) for auth backend tests in CI; MongoDB Atlas for content pipeline — both confirmed working as of `acabf47` (P1-T10) |
| Residual gate risk | Phase 1 Trial Gate criterion `docker-compose up` cannot be met without Docker runtime |
| Owner action | Environment provisioning required — not a code problem |

**Note:** The testcontainers mitigation is sufficient for all in-flight implementation tasks. The Docker runtime is only required to close the `docker-compose up` Trial Gate criterion itself.

---

### 3. Four P0 Tasks Unstarted at Sprint 03 Day 5

| Task | Status | Unblocked Since | Risk |
|---|---|---|---|
| P1-T11 Auth Module — Student Login & RBAC | pending | Sprint Day 1 (P1-T10 done) | Blocks P1-T12 + P1-T13 if not done this sprint |
| P1-T14 MongoDB Problem Document Schema & API | pending | Sprint Day 1 (Atlas available) | Blocks content pipeline; M1.3 at risk |
| P1-T12 User Module — Parent-Child Linking | pending | After P1-T11 | Required for M1.2 auth milestone |
| P1-T13 Auth Frontend — Login & Registration Pages | pending | After P1-T11 | Required for M1.2 auth milestone |

If P1-T11 does not commit before Sprint 03 Day 7, P1-T12 and P1-T13 are mathematically unlikely to close within Sprint 03, carrying three P0s into Sprint 04.

---

## Trial Gate Criteria Status

*Reference: `koobits_development_plan.md` Phase 1 Milestones. Trial Gate evaluated at Sprint 06 close (target 2026-07-25).*

| Gate Criterion / Milestone | Target Date | Risk Level | Status |
|---|---|---|---|
| M1.1 — Infrastructure live (staging deployed, CI/CD green on every PR) | 2026-05-16 | **HIGH** | CI/CD green; staging blocked on AWS credentials (deadline 2026-05-01) and Docker unavailability |
| M1.2 — Auth working (parent registers, child logs in, RBAC enforced) | 2026-05-30 | **MEDIUM-HIGH** | P1-T10 done; P1-T11/T12/T13 pending; 5 sprint days remain |
| M1.3 — Content pipeline (500+ problems, admin CMS, KaTeX rendering) | 2026-06-13 | **MEDIUM** | P1-T14/T15/T17 all pending; capacity risk if P0 jam extends into Sprint 04 |
| M1.4 — Student can solve (end-to-end: login → problem → feedback) | 2026-06-27 | LOW | Sprints 04–05 work; no current risk if auth resolves |
| M1.5 — Gamification live (coins, streaks, leaderboard, daily challenge) | 2026-07-11 | LOW | Sprints 04–05 work |
| M1.6 — MVP complete (teacher dashboard v1, full internal test, staging) | 2026-07-25 | LOW | Sprint 06 delivery; currently on track at macro level |
| COPPA compliance (consent recorded + auditable) | Sprint 06 | LOW | P1-T04 Auth0 done; P1-T10 records consent with timestamp+IP |
| Core Prisma schema (users, schools, classrooms, enrollments, links) | Sprint 06 | ✅ LOW | P1-T05 done (7 models, migration ready) |
| 0 P0 open bugs | Sprint 06 | MEDIUM | CORS restriction unverified; 8 tasks QC-pending |

**Overall Trial Gate risk level: HIGH**

---

## Escalation Path

| Trigger | Action |
|---|---|
| AWS credentials not provisioned by 2026-05-01 | Elevate risk level to CRITICAL; mark P1-T03 BLOCKED in current_sprint.md; notify project sponsor |
| P1-T11 not committed by Sprint 03 Day 7 (2026-04-29) | Flag in Sprint 04 plan as Day-1 priority; M1.2 target (2026-05-30) moves to HIGH risk |
| Docker runtime unresolved by Sprint 04 end | Elevate Docker blocker to CRITICAL; escalate infrastructure provisioning independently of AWS credentials |
| QC Agent finds CORS unrestricted in P1-T10 endpoints | Treat as P0 security bug; block P1-T11 merge until patched |

---

## Resolution Tracking

| Date | AWS Provisioned | Docker Available | P1-T11 Status | Risk Level |
|---|---|---|---|---|
| 2026-04-16 | ❌ No | ❌ Not checked | Not started | MEDIUM |
| 2026-04-22 | ❌ No | ❌ Confirmed unavailable | Not started | MEDIUM-HIGH |
| 2026-04-26 | ❌ No | ❌ Unavailable | Not started | **HIGH** |
| 2026-05-01 *(hard deadline)* | TBD | TBD | TBD | TBD |

*Update this table at each PM Agent check-in. Mark RESOLVED when all items are confirmed closed.*
