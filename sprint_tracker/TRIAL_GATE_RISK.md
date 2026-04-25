# TRIAL GATE RISK ALERT — Phase 1 Trial Gate (Sprint 06)

**Filed:** 2026-04-25  
**Filed by:** PM Agent (Sprint 03 Retrospective — 2026-04-25)  
**Supersedes:** `PHASE_GATE_RISK.md` (2026-04-17, terminology update)  
**Phase:** 1 — Foundation & MVP  
**Trial Gate Sprint:** Sprint 06 (target close date: 2026-07-24)  
**Risk Level:** MEDIUM-HIGH  
**Trigger:** RECURRING BLOCKER — Docker runtime unavailable (3rd consecutive sprint) + QC debt accumulation + auth endpoint chain behind schedule

---

## Risk Summary

Phase 1 has 6 sprints (12 weeks) to deliver the full MVP foundation. With Sprint 03 at Day 4 and 3 sprints remaining after this one, two Trial Gate criteria are directly at risk and two more are not yet started.

| Gate Criterion | Risk Level | Primary Cause |
|---|---|---|
| Working local dev stack (`docker-compose up`) | **HIGH** | Docker runtime unavailable — 3rd consecutive sprint, RECURRING BLOCKER |
| Auth endpoints operational (all roles) | **MEDIUM** | P1-T11/T12/T13 behind schedule; no commit since P1-T10 (Day 1) |
| 50+ content items in DB | **MEDIUM** | P1-T14 (schema) pending; P1-T16 (seeding, 8 days) must start Sprint 04 Day 1 |
| Gamification v1 live | **LOW** | Sprint 04–05 scope; adequate runway if above risks resolve |
| Teacher dashboard v1 live | **LOW** | Shell done (P1-T07); full feature Sprint 05 |
| Auth layer COPPA-compliant | **LOW** | P1-T10 done; P1-T11 pending but unblocked |
| Core data model in Prisma | ✅ RESOLVED | P1-T05 done |
| 0 P0 open bugs | **LOW** | No confirmed bugs; QC debt monitoring required |

---

## Active Risk 1 — Docker Runtime Unavailable (RECURRING BLOCKER, 3rd Sprint)

**History:**
- Sprint 01 (2026-04-21): First flagged in `sprint_01_retro_6.md` — Docker Compose "not yet implemented"
- Sprint 02 (2026-04-22): Escalated in `sprint_02_retro.md` — Docker runtime confirmed unavailable at environment level
- Sprint 03 (2026-04-25): Third consecutive sprint — no resolution, confirmed still blocked

**Impact:** P1-T04 (Docker Compose local dev stack — PostgreSQL, MongoDB, Redis) cannot be completed. The Trial Gate criterion `docker-compose up` for the full local dev stack cannot be met in the current environment. Testcontainers mitigation unblocks auth endpoint development but does not satisfy this gate criterion.

**Required action:** Provision a Docker-capable environment for the Implementation Agent. Owner: Ops/Infrastructure. This is not resolvable by the Implementation Agent.

**Mitigation in place:** `@testcontainers/postgresql` adopted in Sprint 03 for auth integration tests. Auth backend development continues on schedule via testcontainers. MongoDB Atlas (cloud-hosted) used directly for P1-T14 — no local container required.

**Gate miss risk:** If Docker environment is not provisioned by Sprint 05, the `docker-compose up` Trial Gate criterion cannot be validated at Sprint 06 close. Sprint 05 is the last sprint in which the local dev stack can be wired and validated before the gate.

**Deadline:** Docker-capable environment must be available by **Sprint 05 open** (estimated 2026-06-29 per original calendar; actual sprint cadence running ~6 weeks ahead).

---

## Active Risk 2 — Auth Endpoint Chain Behind Schedule

**Impact:** P1-T11 (student login + RBAC), P1-T12 (parent-child linking), P1-T13 (auth frontend) together total 9 estimated days. As of Sprint 03 Day 4, none have a commit. The chain must start today (Day 4) to have any chance of completing within Sprint 03. P1-T12 and P1-T13 are likely Sprint 04 carry-overs.

**Gate dependency:** "Auth endpoints operational (parent/teacher/student)" is a Trial Gate criterion. If P1-T13 (auth frontend with Playwright E2E) slips to Sprint 05, the Dashboard and Gamification work planned for Sprint 05 will be competing for the same capacity.

**Required action:** Implementation Agent must start P1-T11 immediately (Sprint 03 Day 4). No further delay is acceptable.

---

## Active Risk 3 — Content Pipeline Not Started

**Impact:** "50+ content items in DB" is a Trial Gate criterion. P1-T14 (MongoDB problem schema) is pending as of Sprint 03 Day 4. P1-T16 (content seeding, 8-day estimate) is the Sprint 04 primary task that provides those items. If P1-T16 does not start Sprint 04 Day 1, there is no sprint available for a second attempt before Sprint 06.

**Required action:** P1-T16 must be the first task in Sprint 04. PM Agent must set it as P0 in the Sprint 04 plan.

---

## Resolution Tracking

| Check-in | Docker Env | Auth Chain | Content Pipeline | Risk Level |
|---|---|---|---|---|
| 2026-04-17 (filed PHASE_GATE_RISK) | ❌ Unavailable | ⚠️ Blocked (Docker) | 🔲 Not started | MEDIUM |
| 2026-04-22 (Sprint 02 retro) | ❌ Unavailable | ⚠️ Blocked (Docker) | 🔲 Not started | MEDIUM-HIGH |
| 2026-04-25 (Sprint 03 retro) | ❌ Unavailable | 🟡 P1-T10 done; P1-T11+ pending | 🔲 Not started (P1-T14 pending) | MEDIUM-HIGH |
| Sprint 04 open (TBD) | TBD | TBD | TBD | TBD |
| Sprint 05 open (TBD) — Docker deadline | TBD | TBD | TBD | TBD |
| Sprint 06 close (2026-07-24) — GATE | TBD | TBD | TBD | TBD |

---

## Escalation Path

| Risk | Owner | Escalation |
|---|---|---|
| Docker runtime provisioning | Ops/Infrastructure | Escalate to project sponsor immediately — 3rd consecutive sprint blocked |
| Auth endpoint velocity | Implementation Agent | PM Agent: enforce Day-4 start on P1-T11 per mid-sprint note |
| Content pipeline start | PM Agent | Set P1-T16 as Sprint 04 P0 in sprint plan |

---

**This file must be updated at each PM Agent check-in. Mark RESOLVED when all Trial Gate criteria have been met and verified by QC Agent at Sprint 06 close.**
