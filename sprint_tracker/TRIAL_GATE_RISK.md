# TRIAL GATE RISK ALERT — Phase 1 Trial Gate (Sprint 06)

**Filed:** 2026-04-24  
**Filed by:** PM Agent (Sprint 03 Day-3 Retrospective)  
**Phase:** 1 — Foundation & MVP  
**Trial Gate Sprint:** Sprint 06 (target end date: 2026-07-24)  
**Risk Level:** MEDIUM-HIGH  
**Trigger:** RECURRING BLOCKER — Docker runtime unavailable (3rd sprint cycle) + AWS credentials outstanding (hard deadline 2026-05-01, **7 days**) + QC debt accumulating across 6 unverified tasks

> **Note:** `sprint_tracker/PHASE_GATE_RISK.md` (filed 2026-04-17) remains as historical record. This file supersedes it as the active risk tracker using the correct "Trial Gate" nomenclature. All new updates are recorded here.

---

## Risk Summary

Two RECURRING BLOCKERs have persisted for 3+ consecutive sprint cycles with no resolution. Together they put two Phase 1 Trial Gate criteria at HIGH risk:

1. **Docker runtime unavailable** — `docker-compose up` gate criterion cannot be met in the current implementation environment. The testcontainers mitigation preserves auth development velocity but does not satisfy the Trial Gate.
2. **AWS IAM credentials outstanding** — P1-T03 (Terraform + ECS Fargate) has been blocked since Sprint 01. Hard deadline 2026-05-01 expires in **7 days**. No cloud infrastructure (staging, preview, ECS) can be provisioned without credentials.

---

## Trial Gate Criteria at Risk

| Criterion | Target Sprint | Risk Level | Status as of 2026-04-24 |
|---|---|---|---|
| Working local dev stack (`turbo build`, `docker-compose up`) | Sprint 06 | **HIGH** | `turbo build` passes; Docker runtime unavailable (3rd sprint cycle) |
| Cloud infrastructure operational (ECS Fargate staging env) | Sprint 06 | **HIGH** | P1-T03 blocked; AWS credentials not provisioned; deadline 7 days |
| Auth endpoints operational (parent/teacher/student) | Sprint 06 | MEDIUM | P1-T10 done; P1-T11 pending (unblocked); on track |
| Auth layer COPPA-compliant | Sprint 06 | LOW | P1-T04 done; CORS restriction QC-pending (9 cycles open) |
| Core data model in Prisma | Sprint 06 | LOW | P1-T05 done; 7 models, migrations ready |
| 50+ content items in DB | Sprint 06 | MEDIUM | Not started — P1-T14 starts this sprint; 3 sprints remain |
| Teacher dashboard v1 live | Sprint 06 | LOW | P1-T07 shell done; full feature work Sprint 05 |
| Gamification v1 live | Sprint 06 | LOW | Sprint 04–05 work; not at risk yet |
| 0 P0 open bugs | Sprint 06 | NOT APPLICABLE | — |

---

## RECURRING BLOCKER 1 — Docker Runtime Unavailable

**First raised:** `sprint_01_retro_6.md` (2026-04-21)  
**Sprint cycles affected:** Sprint 01, Sprint 02, Sprint 03 (current) — **3 consecutive cycles**

Docker runtime (CLI/daemon) is unavailable in the implementation environment. P1-T04 (P0, Docker Compose Local Dev — PostgreSQL, MongoDB, Redis) has been on HOLD since Sprint 02 confirmation. The testcontainers workaround adopted in Sprint 03 unblocks auth endpoint CI testing but **does not satisfy the Trial Gate criterion** for a working local dev stack.

**Required action:** Provision a Docker-capable environment for the Implementation Agent. This is an Ops/Infrastructure action — cannot be resolved by the PM Agent or Implementation Agent.

**If Docker remains unavailable at Sprint 04 open:** The Trial Gate risk level must be elevated to HIGH and the project sponsor must commit to a resolution date or formally defer the `docker-compose up` gate criterion with an agreed alternative.

---

## RECURRING BLOCKER 2 — AWS IAM Credentials Outstanding

**First raised:** `sprint_01_retro.md` (2026-04-16)  
**Sprint cycles affected:** Sprint 01, Sprint 02, Sprint 03 (current) — **9 consecutive agent cycles**  
**Hard deadline:** **2026-05-01 (7 days from today)**

P1-T03 (P0, Terraform + ECS Fargate) requires AWS IAM bootstrap credentials to proceed. No credentials have been provisioned in 9 agent cycles since first flagging. This blocks all cloud infrastructure work: staging environment, ECS task definitions, VPC, RDS, ElastiCache.

**Required action (human — today):** Project sponsor must confirm IAM credential provisioning status with a named owner and target delivery date. The PM Agent cannot provision credentials.

**Deadline scenarios:**

| Date | Scenario | Impact |
|---|---|---|
| **2026-05-01** | Credentials arrive | P1-T03 attempted before Sprint 04 open or becomes Sprint 04 Day-1 task |
| **2026-05-01** | Credentials DO NOT arrive | Mark P1-T03 BLOCKED; elevate this file to **HIGH**; escalate to sponsor with named owner |
| Sprint 04 open (est. 2026-05-04) | Still blocked | Sprint 04 opens with P1-T03 as Day-1 unblock task; cloud gate criterion in jeopardy |
| Sprint 06 close (2026-07-24) | Still blocked | Trial Gate FAIL on cloud infrastructure criterion |

---

## Resolution Tracking

| Check-in Date | Docker Provisioned | AWS Provisioned | App Stores Active | Risk Level |
|---|---|---|---|---|
| 2026-04-16 | ❌ Unconfirmed | ❌ Unconfirmed | ❌ Unconfirmed | MEDIUM |
| 2026-04-17 | ❌ Unconfirmed | ❌ Unconfirmed | ❌ Unconfirmed | MEDIUM |
| 2026-04-18 | ❌ Unconfirmed | ❌ Unconfirmed | ❌ Unconfirmed | MEDIUM |
| 2026-04-19 | ❌ Unconfirmed | ❌ Unconfirmed | ❌ Unconfirmed | MEDIUM |
| 2026-04-20 | ❌ Unconfirmed | ❌ Unconfirmed | ❌ Unconfirmed | MEDIUM |
| 2026-04-21 | ❌ Unconfirmed | ❌ Unconfirmed | ❌ Unconfirmed | MEDIUM |
| 2026-04-22 | ❌ Confirmed unavailable | ❌ Unconfirmed | ❌ Unconfirmed | **MEDIUM-HIGH** *(Docker confirmed unavailable)* |
| 2026-04-23 | ❌ Confirmed unavailable | ❌ Unconfirmed | ❌ Unconfirmed | MEDIUM-HIGH |
| 2026-04-24 | ❌ Confirmed unavailable | ❌ Unconfirmed | ❌ Unconfirmed | **MEDIUM-HIGH** *(testcontainers mitigation in use; 7 days to AWS deadline)* |
| **2026-05-01** | — | — | — | **TBD — HARD DEADLINE** |
| Sprint 04 open | — | — | — | TBD |
| Sprint 06 close | — | — | — | TBD — Trial Gate evaluation |

---

**This file must be updated at each PM Agent check-in until all blockers are resolved. Mark RESOLVED when Docker is provisioned and AWS credentials are confirmed.**
