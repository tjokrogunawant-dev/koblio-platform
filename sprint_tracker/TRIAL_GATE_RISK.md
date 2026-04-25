# TRIAL GATE RISK ALERT — Phase 1 Trial Gate (Sprint 06)

**Filed:** 2026-04-25
**Filed by:** PM Agent (Sprint 03 Retrospective — 2026-04-25)
**Phase:** 1 — Foundation & MVP
**Gate Sprint:** Sprint 06 (target end date: 2026-07-24)
**Risk Level:** MEDIUM
**Trigger:** 4 P0 tasks pending at Sprint 03 Day 4 with no implementation blockers on the top two; RECURRING BLOCKER — QC verification debt (3 consecutive sprint cycles); auth endpoints and MongoDB pipeline not yet started

> **Note:** This file supersedes the risk tracking previously captured in `PHASE_GATE_RISK.md`. Infrastructure items (Docker Compose, AWS/ECS Fargate) are intentionally deferred per roadmap and are not treated as blockers. Risk levels below reflect only implementation and QC risk.

---

## Risk Summary

Sprint 03 is 40% complete (Day 4 of 10) with only 1 of 5 P0 tasks delivered. P1-T11 (Student Login & RBAC) and P1-T14 (MongoDB Problem Schema & API) have been unblocked since sprint open but have not been started. If P1-T11 does not close by Day 6, the downstream P0 chain (P1-T12 Parent-Child Linking, P1-T13 Auth Frontend) will carry into Sprint 04. A two-sprint carry-over of auth + content tasks places unacceptable pressure on Sprint 04–05, where content seeding and gamification must also begin.

Six completed tasks are QC-unverified. The CORS restriction at `apps/api/src/main.ts:8` has not been confirmed resolved across 8 consecutive PM Agent and QC Agent cycles. This is a security prerequisite for all auth endpoint delivery.

---

## Phase 1 Trial Gate Criteria — Status as of 2026-04-25

| Gate Criterion | Status | Risk | Owner |
|---|---|---|---|
| `turbo build` passing | ✅ PASSING | LOW | CI |
| Auth layer COPPA-compliant (Auth0, JWKS/RS256) | ✅ COMPLETE — P1-T04 done | LOW | Backend |
| Core data model in Prisma | ✅ COMPLETE — P1-T05 done | LOW | Backend |
| Auth endpoints — parent/teacher/student login | 🟡 IN PROGRESS — parent/teacher done (P1-T10); student pending (P1-T11) | **MEDIUM** | Backend |
| MongoDB problem content pipeline | 🔲 NOT STARTED — P1-T14 pending (Day 4, no blocker) | **MEDIUM** | Backend |
| 50+ content items in DB | 🔲 NOT STARTED — Sprint 04–05 work | LOW (runway remains) | Content |
| Teacher dashboard v1 live | 🟡 IN PROGRESS — shell done; full feature Sprint 05 | MEDIUM | Frontend |
| Gamification v1 live (coins, XP, streaks, daily challenge) | 🔲 NOT STARTED — Sprint 03–04 work | LOW (runway remains) | Frontend/Backend |
| 0 P0 open bugs | N/A | N/A | All |
| QC verification — all shipped features | 🔴 RECURRING GAP — 6 tasks unverified; CORS open 8 cycles | **MEDIUM-HIGH** | QC Agent |

---

## Risk Scenarios

### Scenario A — Sprint 03 P0s Close on Time (Target)
P1-T11 and P1-T14 both close by Day 7 (2026-04-29). P1-T12 and P1-T13 start Days 6–8 and either close in Sprint 03 or carry into Sprint 04 as Day-1 tasks (acceptable per Sprint 03 plan). Sprint 04 opens with content seeding (P1-T16) and gamification start as primary new work. **Trial Gate risk: LOW by Sprint 04 midpoint.**

### Scenario B — P1-T11 or P1-T14 Carry Into Sprint 04 (Elevated Risk)
P1-T11 or P1-T14 are not merged by Sprint 03 close (2026-05-02). Sprint 04 inherits 2–4 auth/content carry-overs alongside new P1-T16 and gamification work. Sprint 04 capacity is insufficient to absorb all items. Content seeding slips to Sprint 05. **Trial Gate risk escalates to HIGH.** Update this file if Scenario B is confirmed at Sprint 03 close.

### Scenario C — QC Debt Triggers Security Block (Elevated Risk)
CORS restriction at `main.ts:8` is confirmed unrestricted when auth endpoints are tested in Sprint 03/04. Implementation Agent must halt endpoint delivery to patch. Estimated 0.5–1 day delay. **Trial Gate impact: LOW individually, but adds to Scenario B pressure.**

---

## Required Actions to Maintain MEDIUM Risk

| Action | Owner | Deadline | Status |
|---|---|---|---|
| Start P1-T11 (Student Login & RBAC) | Implementation Agent | Day 5 (2026-04-27) | 🔲 Not started |
| Start P1-T14 (MongoDB Problem Schema) | Implementation Agent | Day 5 (2026-04-27) | 🔲 Not started |
| Complete P1-T09 (Sentry) | Implementation Agent | Day 5 (2026-04-27) | 🔲 Not started |
| QC pass: P1-T04 through P1-T10 | QC Agent | Before Sprint 04 opens | 🔲 Not scheduled |
| Confirm/patch CORS restriction `main.ts:8` | QC Agent / Backend | Before P1-T11 merges | 🔲 Open for 8 cycles |
| Start gamification module planning | PM Agent + Implementation Agent | Sprint 04 Day 1 | 🔲 Not started |
| Content seeding (P1-T16, 50+ problems) | Implementation Agent | Sprint 04 (no later) | 🔲 Not started |

---

## Resolution Tracking

| Check-in Date | Auth Endpoints | MongoDB Pipeline | QC Debt | Gamification Start | Risk Level |
|---|---|---|---|---|---|
| 2026-04-25 (Sprint 03 Day 4) | 🟡 P1-T10 done; P1-T11 pending | 🔲 Not started | 🔴 6 tasks unverified; CORS open 8 cycles | 🔲 Not started | **MEDIUM** |
| 2026-05-02 (Sprint 03 close) | TBD | TBD | TBD | TBD | TBD |
| Sprint 04 open | TBD | TBD | TBD | TBD | TBD |
| Sprint 04 close | TBD | TBD | TBD | TBD | TBD |
| Sprint 06 close (gate) | Required: COMPLETE | Required: COMPLETE | Required: 0 unverified | Required: COMPLETE | — |

**This file must be updated at each PM Agent sprint-end cycle until all gate criteria are confirmed COMPLETE.**
