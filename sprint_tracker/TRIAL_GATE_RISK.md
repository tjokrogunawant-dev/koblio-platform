# TRIAL GATE RISK ALERT — Phase 1 Trial Gate (Sprint 06)

**Filed:** 2026-04-26  
**Filed by:** PM Agent (Sprint 03 Retrospective)  
**Phase:** 1 — Foundation & MVP  
**Trial Gate Sprint:** Sprint 06 (target end date: 2026-07-24)  
**Risk Level:** HIGH  
**Trigger:** 4 P0 tasks stalled in Sprint 03 with no implementation commits for 3 days; auth endpoint chain and content pipeline both behind schedule; Trial Gate criteria for auth, content, and gamification now at risk of Sprint 05–06 compression

---

## Risk Description

Sprint 03 (2026-04-22 to 2026-05-02) is Day 5 of 10 with only 1 of 5 P0 tasks complete and no implementation commits since Day 2 (2026-04-23). The auth endpoint chain (P1-T11 → P1-T12 → P1-T13) and the MongoDB problem content pipeline (P1-T14) are both fully unblocked but stalled. At current pace:

- Sprint 03 will carry 4 P0 tasks into Sprint 04
- Sprint 04 capacity for content seeding (P1-T16, 8d) and gamification scaffolding will be severely compressed
- Trial Gate criteria for 50+ content items and gamification v1 will be left to Sprints 05–06 with no buffer

**Critical path analysis:**

| Task Chain | Estimated Days | Current State | Impact on Trial Gate |
|---|---|---|---|
| P1-T11 → P1-T12 → P1-T13 | 2 + 3 + 4 = 9d sequential | Stalled — no commits since Day 2 | Auth layer complete (gate criterion) |
| P1-T14 → P1-T16 (Content Seeding) | 3 + 8 = 11d sequential | Not started | 50+ content items in DB (gate criterion) |
| P1-T18 through P1-T22 (Gamification v1) | ~10d (Sprints 04–05) | Not started | Gamification v1 live (gate criterion) |
| P1-T23+ (Teacher dashboard v1) | ~8d (Sprint 05) | Shell done (P1-T07) | Teacher dashboard v1 live (gate criterion) |

With 3 sprints remaining after Sprint 03 (Sprints 04, 05, 06), the auth carry-over alone consumes roughly 1 full sprint of Sprint 04 capacity. This leaves two sprints (05–06, ~20 working days) to deliver content seeding, gamification v1, teacher dashboard v1, and all QA/bug-fix work — a schedule that requires parallel execution across all tracks with zero float.

---

## Trial Gate Criteria Status

| Gate Criterion | Status | Risk Level | Notes |
|---|---|---|---|
| Working local dev stack | DEFERRED — intentionally deferred per roadmap | LOW | `turbo build` passes; local stack deferral is per-plan |
| Auth layer operational — all roles (COPPA-compliant) | 🟡 IN PROGRESS | HIGH | Parent/teacher done (P1-T10); student login (P1-T11) stalled |
| Core data model in Prisma | ✅ COMPLETE | LOW | P1-T05 done; 7 models, migration SQL ready |
| MongoDB problem schema live | 🔲 NOT STARTED | HIGH | P1-T14 stalled; Atlas available; blocks content pipeline |
| 50+ content items in DB | 🔲 NOT STARTED | HIGH | Depends on P1-T14 + P1-T16 (8d); Sprint 04 work at risk |
| Gamification v1 live | 🔲 NOT STARTED | MEDIUM-HIGH | Sprint 04–05 work; compresses if Sprint 04 absorbs carry-over |
| Teacher dashboard v1 live | 🟡 IN PROGRESS (shell only) | MEDIUM | Sprint 05 work; not yet at risk |
| 0 P0 open bugs | NOT APPLICABLE | N/A | No production deploys yet |

---

## Root Cause

The primary risk driver is not environment or procurement: **it is implementation velocity**. As of Day 5, both P1-T11 (Student Login + RBAC) and P1-T14 (MongoDB Problem Schema) are fully unblocked with all dependencies satisfied. The stall between PM Agent direction (mid-sprint note, 2026-04-23) and Implementation Agent action is the single most impactful corrective lever available.

Secondary risk: QC debt. Seven completed tasks are unverified, including P1-T10 (auth registration endpoints handling COPPA-regulated data). The CORS restriction at `apps/api/src/main.ts:8` has been open 9 days. This restriction must be verified or patched before P1-T11 merges — adding a mandatory QC step to an already-compressed sprint window.

---

## Required Actions

| Action | Owner | Deadline | Blocks |
|---|---|---|---|
| Start P1-T11 (Student Login + RBAC) — commit skeleton within 24h | Implementation Agent | 2026-04-27 | P1-T12, P1-T13, auth gate criterion |
| Start P1-T14 (MongoDB Problem Schema) — commit skeleton within 24h | Implementation Agent | 2026-04-27 | P1-T14 AC, P1-T16, content gate criterion |
| Verify or patch CORS restriction at `apps/api/src/main.ts:8` | QC Agent | Before P1-T11 merge | Security prerequisite for COPPA auth endpoints |
| QC pass on P1-T04 through P1-T10 (7 unverified tasks) | QC Agent | Before Sprint 04 opens | Foundation integrity for auth + content work |
| Sprint 04 plan: ring-fence P1-T16 capacity (8d content seeding) | PM Agent | Sprint 04 start | 50+ content items Trial Gate criterion |

---

## Resolution Tracking

| Check-in Date | P1-T11 Status | P1-T14 Status | CORS Resolved | Risk Level |
|---|---|---|---|---|
| 2026-04-26 (Sprint 03, Day 5) | ⏳ pending (unblocked Day 1) | ⏳ pending (unblocked Day 1) | ❌ Unverified | **HIGH** |
| 2026-05-02 (Sprint 03 end) | — | — | — | TBD |
| Sprint 04 open | — | — | — | TBD |

---

**This file must be updated at each PM Agent cycle until all HIGH-risk Trial Gate criteria show IN PROGRESS or COMPLETE status. Downgrade risk level when P1-T11, P1-T14, and P1-T16 all have active implementation commits and a credible completion date within the Sprint 04–05 window.**
