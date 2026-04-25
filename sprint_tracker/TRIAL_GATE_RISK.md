# TRIAL GATE RISK ALERT — Phase 1 Trial Gate (Sprint 06)

**Filed:** 2026-04-17 (as PHASE_GATE_RISK.md)  
**Converted to TRIAL_GATE_RISK.md:** 2026-04-25 (PM Agent — Sprint 03 retrospective)  
**Last Updated:** 2026-04-25  
**Phase:** 1 — Foundation & MVP  
**Trial Gate Sprint:** Sprint 06 (target end date: 2026-07-24)  
**Risk Level:** HIGH *(escalated 2026-04-25 — 4 P0 tasks carrying out of Sprint 03; 3 sprints remaining)*  
**Trigger:** 4 Sprint 03 P0 carry-overs compressing Sprints 04–06 + RECURRING BLOCKERs (Docker, AWS) + QC debt on 6 completed tasks

---

## Risk Summary

Sprint 03 closes with only 1 of 8 planned tasks completed (P1-T10). Four P0 tasks (P1-T11, P1-T12, P1-T13, P1-T14) carry into Sprint 04. With only Sprints 04, 05, and 06 remaining in Phase 1, the cumulative carry-over significantly compresses the capacity available for Sprint 04–06 native work (content seeding, gamification v1, teacher dashboard v1) — all of which are required Trial Gate criteria.

Two RECURRING BLOCKERs (Docker runtime unavailable since Sprint 01 retro 6; AWS credentials outstanding since Sprint 01 retro) remain unresolved after three sprint cycles. The Trial Gate criterion for working local dev stack (`docker-compose up`) cannot be met without Docker resolution. The Trial Gate criterion for cloud infrastructure requires AWS credentials for P1-T03 (Terraform), which has a hard deadline of 2026-05-01.

---

## Trial Gate Criteria — Phase 1

| Gate Criterion | Target Sprint | Risk Level | Status as of 2026-04-25 |
|---|---|---|---|
| Working local dev stack (`turbo build`, `docker-compose up`) | Sprint 06 | **HIGH** | `turbo build` passes; Docker runtime unavailable (RECURRING BLOCKER, 3rd sprint) |
| Auth endpoints operational (parent/teacher/student) | Sprint 06 | **HIGH** | P1-T10 done; P1-T11/T12/T13 pending, carrying to Sprint 04 |
| Auth layer COPPA-compliant | Sprint 06 | ✅ LOW | P1-T04 done (JWKS/RS256, 32 tests); CORS restriction QC-pending |
| Core data model in Prisma | Sprint 06 | ✅ LOW | P1-T05 done (7 models, migration ready) |
| 50+ content items in DB | Sprint 06 | **HIGH** | P1-T14 not started; P1-T16 (Content Seeding) not yet scheduled; requires Atlas schema + CMS first |
| Gamification v1 live (coins, XP, streaks, daily challenge) | Sprint 06 | MEDIUM | Sprint 04–05 work; capacity risk if P0 carry-overs consume Sprint 04 |
| Teacher dashboard v1 live (class overview, student progress) | Sprint 06 | MEDIUM | P1-T07 shell done; full feature work Sprint 05; at risk if Sprint 04 overloaded |
| 0 P0 open bugs | Sprint 06 | MEDIUM | 6 tasks QC-unverified; CORS restriction open 9 days |

**Criteria at HIGH risk: 3 of 8** (local dev stack, auth endpoints chain, content pipeline)

---

## Blocker Registry

### RECURRING BLOCKER 1 — Docker Runtime Unavailable

| Attribute | Value |
|---|---|
| First raised | `sprint_01_retro_6.md` — 2026-04-21 |
| Sprint cycles affected | 3 (Sprint 01 retro 6, Sprint 02 retro, Sprint 03 retro) |
| Directly blocks | P1-T04 (Docker Compose Local Dev) |
| Transitively blocks | Trial Gate criterion: `docker-compose up` |
| Mitigation adopted | `@testcontainers/postgresql` for auth integration tests in CI — validated by P1-T10 ✅ |
| Mitigation gap | Testcontainers does not satisfy `docker-compose up` gate criterion; local dev stack gate remains unmet |
| Resolution owner | Ops / Project Sponsor — environment provisioning required |
| Resolution path | Provision Docker-capable environment for Implementation Agent, OR formally defer `docker-compose up` gate criterion and accept it as a Sprint 06 open item |

### RECURRING BLOCKER 2 — AWS IAM Credentials Outstanding

| Attribute | Value |
|---|---|
| First raised | `sprint_01_retro.md` — 2026-04-16 |
| Sprint cycles affected | Every cycle since 2026-04-16 (9+ PM Agent cycles) |
| Directly blocks | P1-T03 (Terraform + ECS Fargate) |
| Transitively blocks | Staging/production environment; cloud deployment gate |
| Hard deadline | **2026-05-01 — 6 days from today** |
| Resolution owner | Project Sponsor — AWS account provisioning required |
| Post-deadline action | Mark P1-T03 `BLOCKED` in `current_sprint.md` before Sprint 04 Day 1 |

---

## Capacity Risk Analysis

**Remaining Phase 1 capacity:** 3 sprints × ~10 working days = ~30 working days.

**Confirmed carry-over into Sprint 04 (as of 2026-04-25):**

| Task | Est. Days | Dependency |
|---|---|---|
| P1-T11 Auth Module — Student Login & RBAC | 2 | P1-T10 ✅ |
| P1-T14 MongoDB Problem Document Schema & API | 3 | Atlas ready |
| P1-T12 User Module — Parent-Child Linking | 3 | P1-T11 |
| P1-T13 Auth Frontend — Login & Registration Pages | 4 | P1-T11 |
| P1-T09 Sentry Error Tracking | 1 | None |
| P1-T17 KaTeX Integration | 2 | None |
| **Total carry-over est.** | **~15 days** | |

Sprint 04 native tasks not yet planned include P1-T16 (Content Seeding, ~8 days), P1-T18 (Student UI shell), and P1-T15 (Admin CMS, stretch). At ~30 days remaining across 3 sprints, there is no margin for further P0 slippage or new blockers.

**Trial Gate outlook:**
- If Sprint 04 completes the auth chain (P1-T10 through P1-T13) + P1-T14: **ON TRACK**
- If any Sprint 04 P0 carries again: **Trial Gate MISS risk for content pipeline and gamification**
- If Docker and AWS remain blocked through Sprint 06: **Trial Gate FAIL on local dev stack criterion**

---

## Resolution Tracking

| Date | Docker | AWS Credentials | App Stores | Trial Gate Risk |
|---|---|---|---|---|
| 2026-04-16 | ❌ Not confirmed | ❌ Not confirmed | ❌ Not confirmed | MEDIUM |
| 2026-04-17 | ❌ Not confirmed | ❌ Not confirmed | ❌ Not confirmed | MEDIUM |
| 2026-04-19 | ❌ Not confirmed | ❌ Not confirmed | ❌ Not confirmed | MEDIUM |
| 2026-04-22 | ❌ Confirmed unavailable (runtime) | ❌ Not confirmed | ❌ Not confirmed | MEDIUM-HIGH |
| 2026-04-25 | ❌ Confirmed unavailable | ❌ Not confirmed | ❌ Not confirmed | **HIGH** *(4 P0 carry-overs; 3 sprints remain)* |
| 2026-05-01 | — | ⚠️ HARD DEADLINE | — | TBD |
| Sprint 04 close | — | — | — | TBD |
| Sprint 05 close | — | — | — | TBD |
| Sprint 06 close (Trial Gate) | — | — | — | **GATE EVALUATION** |

---

## Required Actions

| Priority | Action | Owner | Deadline |
|---|---|---|---|
| P0 | Provision AWS IAM credentials for Terraform bootstrap | Project Sponsor | **2026-05-01** |
| P0 | Provision Docker-capable environment for Implementation Agent | Ops | Before Sprint 05 open |
| P0 | Implementation Agent: start P1-T11 + P1-T14 today | Implementation Agent | 2026-04-25 |
| P1 | QC Agent: verify CORS restriction at `apps/api/src/main.ts:8` | QC Agent | Before P1-T11 CI tests run |
| P1 | QC Agent: comprehensive pass on P1-T04 through P1-T10 | QC Agent | Before Sprint 04 opens |
| P1 | Mark P1-T03 BLOCKED in `current_sprint.md` if AWS unresolved | PM Agent | 2026-05-02 |

---

**This file must be updated at each PM Agent check-in. Mark RESOLVED when all gate criteria show no HIGH-risk items and both RECURRING BLOCKERs are confirmed resolved.**
