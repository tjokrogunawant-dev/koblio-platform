# TRIAL GATE RISK ALERT — Phase 1 Trial Gate (Sprint 06)

**Filed:** 2026-04-23  
**Based on:** `sprint_tracker/PHASE_GATE_RISK.md` (filed 2026-04-17, last updated 2026-04-22) — supersedes for terminology  
**Filed by:** PM Agent (Sprint 03 Retrospective — 2026-04-23)  
**Phase:** 1 — Foundation & MVP  
**Trial Gate Sprint:** Sprint 06 (target end date: 2026-07-24)  
**Risk Level:** MEDIUM-HIGH  
**Trigger:** RECURRING BLOCKER — Docker runtime unavailable (3 consecutive sprint cycles)

---

## Risk Summary

Two environment-level constraints are preventing completion of Phase 1 Trial Gate criteria. The auth endpoint chain is now unblocked via testcontainers mitigation (Sprint 03), but the local dev stack criterion (`docker-compose up`) cannot be satisfied without Docker runtime.

---

## Trial Gate Criteria at Risk

| Gate Criterion | Status | Risk Level | Notes |
|---|---|---|---|
| Working local dev stack (`turbo build`, `docker-compose up`) | ⚠️ AT RISK | **HIGH** | `turbo build` passes; Docker runtime unavailable; testcontainers CI-only mitigation in place |
| Auth endpoints operational (parent/teacher/student) | 🟡 IN PROGRESS | MEDIUM | P1-T10 done; P1-T11 unblocked Day 2; P1-T12/T13 within sprint window |
| COPPA-compliant auth layer | ✅ COMPLETE | LOW | P1-T04 done, 32 tests, JWKS/RS256 |
| Core data model in Prisma | ✅ COMPLETE | LOW | P1-T05 done, 7 models, migration ready |
| 50+ content items in DB | 🔲 NOT STARTED | MEDIUM | Sprint 04 work (P1-T16); must not slip past Sprint 04 |
| Gamification v1 live | 🔲 NOT STARTED | LOW | Sprint 04–05 work; not yet at risk |
| Teacher dashboard v1 live | 🟡 IN PROGRESS | LOW | Shell done; full feature Sprint 05 |
| 0 P0 open bugs | NOT APPLICABLE | — | No production deployment yet |

---

## Active Risk Factors

### 1. RECURRING BLOCKER — Docker Runtime Unavailable (3 Sprint Cycles)

First raised `sprint_01_retro_6.md` (2026-04-21). Confirmed environment-level constraint `sprint_02_retro.md` (2026-04-22). Persisting into Sprint 03 (2026-04-23). The testcontainers mitigation in Sprint 03 resolves CI integration testing for auth endpoints, but does not satisfy the Trial Gate criterion for a working local dev stack.

**Impact on Trial Gate:** The Sprint 06 gate requires `docker-compose up` to bring up the full local dev environment (PostgreSQL, MongoDB, Redis, NestJS API). Without Docker runtime, this criterion cannot be verified in the current implementation environment.

**Resolution paths (in priority order):**
1. Provision Docker-capable environment for the Implementation Agent — resolves both the local dev stack gate criterion and the CI mitigation in one step.
2. If Docker cannot be provisioned: project sponsor must formally decide whether to waive or re-scope the `docker-compose up` gate criterion before Sprint 05. This decision must be recorded in `sprint_tracker/current_sprint.md`.

### 2. QC Verification Lag (Compounding Risk)

Six completed tasks remain QC-unverified since `sprint_01_qc_2.md` (2026-04-17). The CORS restriction at `apps/api/src/main.ts:8` is unverified across 3 consecutive sprint cycles. Auth endpoints (P1-T10, P1-T11, P1-T12, P1-T13) are being built on top of an unverified API security configuration. This does not block the Trial Gate directly, but increases the probability of a P0 bug finding at gate evaluation time.

---

## Criteria No Longer at Risk

| Item | Resolution |
|---|---|
| Auth0 COPPA entity verification | ✅ Resolved — P1-T04 done 2026-04-19 (JWKS/RS256, 32 tests) |
| MongoDB connection for content pipeline | ✅ Mitigated — MongoDB Atlas used directly; no local Docker required |

---

## Escalation Tracking

| Date | Docker Resolved | Trial Gate Risk | Action Taken |
|---|---|---|---|
| 2026-04-17 | ❌ Not applicable (not yet identified) | MEDIUM | PHASE_GATE_RISK.md filed |
| 2026-04-22 | ❌ Confirmed unavailable | MEDIUM-HIGH | PHASE_GATE_RISK.md updated |
| 2026-04-23 | ❌ No change | **MEDIUM-HIGH** | TRIAL_GATE_RISK.md filed; testcontainers mitigation active for CI |
| Sprint 05 open | TBD | TBD | If Docker still unresolved, project sponsor must decide on waiver |
| Sprint 06 close | TBD | TBD | Trial Gate evaluation |

---

## Required Actions

| Owner | Action | Deadline |
|---|---|---|
| Ops / Project Sponsor | Provision Docker-capable environment for Implementation Agent | Before Sprint 05 opens |
| Project Sponsor | If Docker unresolvable: formally waive or re-scope `docker-compose up` gate criterion | Before Sprint 05 opens |
| QC Agent | Comprehensive verification pass on P1-T04 through P1-T10 | Before Sprint 04 opens |
| QC Agent | Verify or confirm patch for CORS restriction `apps/api/src/main.ts:8` | Before P1-T13 merges |
| Implementation Agent | Do not start P1-T16 (Content Seeding) until P1-T15 (CMS) is merged | Sprint 04 |

---

**Update this file at each PM Agent check-in. Mark RESOLVED when Docker runtime is provisioned and all Trial Gate criteria are confirmed on track.**
