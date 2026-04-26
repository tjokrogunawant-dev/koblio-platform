# TRIAL GATE RISK ALERT — Phase 1 Trial Gate (Sprint 06)

**Filed:** 2026-04-26  
**Filed by:** PM Agent (Sprint 03 Retrospective)  
**Phase:** 1 — Foundation & MVP  
**Trial Gate Sprint:** Sprint 06 (target close: approximately 2026-07-24)  
**Risk Level:** HIGH  
**Trigger:** Sprint 03 closed with 4 P0 tasks incomplete; auth endpoint chain 1 full sprint behind; MongoDB content pipeline not started; Docker RECURRING BLOCKER entering third consecutive sprint cycle.

---

## Risk Description

Sprint 03 ended with 1 of 5 P0 tasks completed (20% P0 velocity). Three Trial Gate criteria that require substantial implementation work remain at risk simultaneously with only 3 sprints remaining (Sprint 04, 05, 06).

### 1. Auth Endpoints Not Operational — AT RISK

The auth endpoint chain (P1-T10 → P1-T11 → P1-T12 → P1-T13) requires all four tasks to be complete before the Trial Gate criterion "auth endpoints operational (parent/teacher/student)" is met. One of four is done (P1-T10). Three tasks carry over from Sprint 03.

| Task | Priority | Status | Gate Dependency |
|---|---|---|---|
| P1-T10 Auth — Parent & Teacher Registration | P0 | ✅ done | Satisfied |
| P1-T11 Auth — Student Login & RBAC | P0 | ⚠️ carry-over | Direct gate requirement |
| P1-T12 User Module — Parent-Child Linking | P0 | ⚠️ carry-over | Gate: consent records stored |
| P1-T13 Auth Frontend — Login & Registration Pages | P0 | ⚠️ carry-over | Gate: end-to-end auth flow functional |

If Sprint 04 does not complete P1-T11, P1-T12, and P1-T13, these tasks will reach Sprint 05 — leaving only Sprint 06 for any remediation, which is unacceptable for P0 gate criteria.

---

### 2. MongoDB Content Pipeline Not Started — AT RISK

The Trial Gate criterion "50+ content items in DB" requires: P1-T14 (schema + API) → P1-T15 (Admin CMS) → P1-T16 (content seeding). None of these three tasks have started. P1-T14 has zero blockers (MongoDB Atlas is available) but did not start in Sprint 03.

| Task | Priority | Status | Note |
|---|---|---|---|
| P1-T14 MongoDB Problem Document Schema & API | P0 | ⚠️ not started | Zero blockers. Sprint 03 carry-over. |
| P1-T15 Admin CMS for Problem Authoring | P1 | ⚠️ not started | Depends on P1-T14. |
| P1-T16 Content Seeding (50+ items) | P0 | ⚠️ not started | Depends on P1-T14 + P1-T15. Sprint 04–05 work. |

Three sequential tasks must complete within 3 sprints (Sprint 04, 05, 06). With no slack, any slip in P1-T14 directly threatens the 50-item content gate criterion.

---

### 3. RECURRING BLOCKER — Docker Runtime / Local Dev Stack — AT RISK

The Trial Gate criterion "working local dev stack (`turbo build`, `docker-compose up`)" cannot be verified in the current implementation environment. Docker runtime is unavailable. This blocker has appeared in 3 consecutive sprint cycles without resolution.

| Sprint | Blocker Status |
|---|---|
| Sprint 01 | First noted (Docker Compose "not yet implemented") |
| Sprint 02 | Confirmed environment-level; escalated to RECURRING BLOCKER |
| Sprint 03 | Testcontainers mitigation adopted for auth dev; P1-T04 on HOLD; gate criterion unverifiable |
| Sprint 04 | Binary decision required from project sponsor |

The testcontainers mitigation successfully unblocks auth backend development but does NOT satisfy the gate criterion. `docker-compose up` must work for a developer to spin up the full local stack. If Docker is never provisioned, this gate criterion cannot be met and must be formally replaced with an equivalent.

---

## Trial Gate Criteria Summary

| Criterion | Target Sprint | Risk Level | Current Status |
|---|---|---|---|
| Working local dev stack (`turbo build`, `docker-compose up`) | Sprint 06 | 🔴 HIGH | `turbo build` ✅; Docker unavailable (RECURRING BLOCKER) |
| Auth layer COPPA-compliant | Sprint 06 | ✅ LOW | P1-T04 done; CORS restriction QC-pending |
| Core data model in Prisma | Sprint 06 | ✅ LOW | P1-T05 done; 7 models; migration ready |
| Auth endpoints operational (parent / teacher / student) | Sprint 06 | 🔴 HIGH | 1 of 4 tasks done; 3 carry over to Sprint 04 |
| MongoDB content pipeline (50+ items in DB) | Sprint 06 | 🔴 HIGH | P1-T14 not started; 3-task chain ahead |
| Gamification v1 live | Sprint 06 | 🟡 MEDIUM | Sprint 04–05 work; on schedule if auth clears Sprint 04 |
| Teacher dashboard v1 live | Sprint 06 | 🟡 MEDIUM | Shell done (P1-T07); full feature work Sprint 05 |
| 0 P0 open bugs | Sprint 06 | 🟡 MEDIUM | Not applicable yet; growing QC debt is precursor risk |

**Overall Trial Gate risk: HIGH** — Three of eight gate criteria simultaneously at HIGH risk with 3 sprints remaining.

---

## Required Actions

### Immediate (Sprint 04 Day 1)

1. **Implementation Agent:** Start P1-T11 immediately. Zero blockers. Testcontainers pattern established by P1-T10.
2. **Implementation Agent:** Start P1-T14 in parallel. MongoDB Atlas available. No local Docker required.
3. **QC Agent:** Run comprehensive pass on P1-T04 through P1-T10. CORS restriction at `apps/api/src/main.ts:8` must be verified or patched before P1-T11 is merged.

### Human Escalation Required

4. **Project Sponsor — Docker runtime decision (HARD DEADLINE: Sprint 04 mid-sprint, approximately 2026-05-08):**
   - Option A: Provision Docker-capable execution environment for Implementation Agent.
   - Option B: Formally replace `docker-compose up` Trial Gate criterion with a CI/CD-based equivalent (e.g., ECS task definition deployment verification). This requires a written decision logged in `sprint_tracker/current_sprint.md`.
   - No action is not an option — this must be decided before Sprint 04 closes.

---

## Resolution Tracking

| Date | Auth Chain | Content Pipeline | Docker Gate | Overall Risk |
|---|---|---|---|---|
| 2026-04-26 (Sprint 03 retro) | 1/4 done | Not started | Unresolvable in current env | 🔴 HIGH |
| Sprint 04 mid-sprint (TBD) | TBD | TBD | Decision due | TBD |
| Sprint 04 end (TBD) | TBD | TBD | TBD | TBD |
| Sprint 05 end (TBD) | TBD | TBD | TBD | TBD |
| Sprint 06 close (target 2026-07-24) | Gate evaluation | Gate evaluation | Gate evaluation | PASS / FAIL |

---

**This file must be updated at each PM Agent retrospective until all HIGH-risk criteria are resolved. Mark RESOLVED and archive when all Trial Gate criteria reach LOW risk or COMPLETE.**
