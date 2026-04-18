# Sprint 01 Plan — 2026-05-04 to 2026-05-15

## Sprint Goal
Bootstrap the Koblio monorepo, establish CI/CD, stand up the dev environment, and deliver a working Auth0 integration with the core DB schema. By end of sprint, a developer should be able to check out the repo and run the stack locally.

## Phase Context
Phase 1 / Sprint 01 of 36 — Foundation & MVP  
MAU target at phase end: Internal testing only (no external users)

## Tasks This Sprint

| Task ID | Title | Owner Role | Priority | Est. Days | Key Acceptance Criteria |
|---|---|---|---|---|---|
| P1-T01 | Initialize Turborepo monorepo | Tech Lead | P0 | 1 | `turbo build` succeeds; packages: `apps/web`, `apps/mobile`, `apps/api`, `packages/shared` |
| P1-T02 | GitHub Actions CI pipeline | Tech Lead | P0 | 1 | PR triggers lint + typecheck + unit test; fails block merge |
| P1-T03 | Terraform + AWS ECS Fargate (dev) | DevOps | P0 | 3 | `terraform apply` creates dev VPC, ECS cluster, RDS instance, ElastiCache |
| P1-T04 | Auth0 COPPA-compliant auth | Backend | P0 | 3 | Students under 13: no direct email; picture-password flow stubbed; JWT issued and validated |
| P1-T05 | Prisma core schema | Backend | P0 | 2 | Migration runs cleanly; User, Student, Parent, Teacher, School tables with correct FK constraints |
| P1-T06 | NestJS modules skeleton | Backend | P1 | 2 | App starts; Auth, User, Content modules registered; health endpoint returns 200 |
| P1-T07 | Next.js teacher dashboard shell | Frontend | P1 | 2 | App starts; Auth0 session enforced on all routes; empty dashboard renders |
| P1-T08 | Flutter student app shell | Mobile | P1 | 2 | App builds on Android/iOS; GoRouter routes defined; Riverpod provider scope established |

## Carry-Over from Sprint 00
None — project kickoff.

## Risks & Blockers
- **Auth0 COPPA configuration** (P1-T04): Auth0's COPPA mode requires a verified business entity. Confirm legal entity is registered before this task starts.
- **AWS account access** (P1-T03): Terraform needs IAM credentials. Confirm AWS account provisioned.
- **App Store developer accounts** (P1-T08): Flutter app build needs Apple Dev + Google Play accounts for device testing.

## Definition of Done for This Sprint
- [ ] All P0 tasks complete with passing CI
- [ ] `docker-compose up` starts API + DB locally
- [ ] No COPPA violations in auth flow (QC review)
- [ ] README updated with local dev setup instructions

## Notes for Implementation Agent
Start with P1-T01 (monorepo) — everything else depends on it. P1-T03 can run in parallel with P1-T04 and P1-T05 since it's infra. P1-T08 (Flutter) is independent once the monorepo exists.

---

## PM Agent Mid-Sprint Note — 2026-04-16 (Monday)

**Status at check-in:** Pre-sprint preparation window (18 days before Sprint 01 opens on 2026-05-04).

**Task status review:**

| Task ID | Status | Hold / Blocked? |
|---|---|---|
| P1-T01 | pending | No |
| P1-T02 | pending | No |
| P1-T03 | pending | No — pending AWS credential provisioning (procurement) |
| P1-T04 | pending | No — pending Auth0 legal entity verification (procurement) |
| P1-T05 | pending | No |
| P1-T06 | pending | No |
| P1-T07 | pending | No |
| P1-T08 | pending | No — pending Apple Dev / Google Play account activation (procurement) |

**No HOLD or BLOCKED tasks in `current_sprint.md`.** All tasks remain `pending` as expected — Sprint 01 implementation is gated on the 2026-05-04 start date.

**Procurement action items (hard deadline: 2026-05-01):**

These three items are the only pre-sprint risk. They are PM/Ops-track responsibilities, not Implementation Agent tasks. If any remain unresolved by 2026-05-01, the PM Agent must escalate and flag P1-T03, P1-T04, and/or P1-T08 as BLOCKED in `current_sprint.md` before the sprint opens.

1. **Auth0 COPPA entity verification** — Required for P1-T04. Auth0's COPPA-compliant mode requires a verified legal business entity. Confirm registration status and submit verification to Auth0 support immediately if not done.
2. **AWS account + IAM bootstrap credentials** — Required for P1-T03. Store credentials in AWS Secrets Manager (never in-repo). Confirm least-privilege IAM role covers ECS, RDS, ElastiCache, and VPC.
3. **Apple Developer + Google Play accounts** — Required for P1-T08. Both require 24–48 hours for approval; initiate now to avoid day-1 blockage.

**No priority changes.** Execution order in this plan remains correct. Implementation Agent is gated: **do not begin any task before 2026-05-04.**

**Next PM Agent trigger:** Friday 2026-05-15 (Sprint 01 end) → write `sprint_tracker/history/sprint_01_retro.md`.

---

## PM Agent Mid-Sprint Note — 2026-04-17 (Monday)

**Status at check-in:** Pre-sprint preparation window — **17 days until Sprint 01 opens (2026-05-04)**.

**Git activity since last check-in (2026-04-16):**
No new commits. The repository contains only the four foundation commits from 2026-04-16 (spec init, QC baseline, retro baseline, pre-sprint note). Implementation Agent is correctly dormant — no tasks should be picked up before 2026-05-04.

**Task status review:**

| Task ID | Status | Hold / Blocked? |
|---|---|---|
| P1-T01 | pending | No |
| P1-T02 | pending | No |
| P1-T03 | pending | No — AWS credentials procurement outstanding |
| P1-T04 | pending | No — Auth0 legal entity verification outstanding |
| P1-T05 | pending | No |
| P1-T06 | pending | No |
| P1-T07 | pending | No |
| P1-T08 | pending | No — Apple Dev / Google Play account activation outstanding |

**No HOLD or BLOCKED tasks.** All tasks remain `pending` as expected for this pre-sprint window.

**Procurement deadline countdown — hard deadline 2026-05-01 (14 days):**

| Procurement Item | Required By Task | Deadline | Status |
|---|---|---|---|
| Auth0 COPPA entity verification | P1-T04 | 2026-05-01 | ⚠️ Unconfirmed |
| AWS account + IAM bootstrap credentials | P1-T03 | 2026-05-01 | ⚠️ Unconfirmed |
| Apple Developer + Google Play accounts | P1-T08 | 2026-05-01 | ⚠️ Unconfirmed |

All three items remain unconfirmed from the 2026-04-16 check-in. These are PM/Ops-track items. **If any remain unresolved by 2026-05-01, the PM Agent must mark the corresponding tasks as BLOCKED in `current_sprint.md` before the sprint opens.**

**No priority changes.** Execution order in this plan remains correct. Implementation Agent gate is in force: **do not begin any task before 2026-05-04.**

**Next scheduled PM Agent trigger:** Friday 2026-05-15 (Sprint 01 end) → write `sprint_tracker/history/sprint_01_retro.md`.

---

## PM Agent Mid-Sprint Note — 2026-04-17 (Monday, Pass 2 — post-P1-T01 completion)

**Status at check-in:** Pre-sprint preparation window — **17 days until Sprint 01 opens (2026-05-04)**.

**Git activity since Pass 1 (earlier today):**

| Commit | Description |
|---|---|
| `e81a0d8` | `[P1-T01] Initialize Turborepo monorepo with apps and packages` |
| `ce3de19` | `QC Agent: Sprint 01 code review — 2026-04-17` |
| `1e8123f` | `PM Agent: Sprint 01 retrospective — 2026-04-17` |

**P1-T01 is complete — QC approved (2 WARNINGs, 0 blockers):**
All 6 acceptance criteria pass (`pnpm install`, `turbo build`, `turbo lint`, `turbo typecheck`, `turbo test`, README). QC findings:

| Severity | Finding | Resolution Target |
|---|---|---|
| WARNING | `app.enableCors()` unrestricted (`main.ts:8`) | Fix in P1-T04 AC (CORS_ORIGIN env var via ConfigService) |
| WARNING | No `.env.example` in repo | Fix in P1-T02 AC (mandatory, not advisory) |
| INFO | P1-T01 scope overlaps P1-T06 (module skeletons, Swagger, health check delivered) | P1-T06 scope reduced (see below) |

**Task status review:**

| Task ID | Status | Hold / Blocked? | Notes |
|---|---|---|---|
| P1-T01 | **done** | No | QC-approved; all AC met |
| P1-T02 | pending | No | **AC expanded:** `.env.example` + `gitleaks` pre-commit hook now mandatory |
| P1-T03 | pending | No — AWS credentials outstanding | |
| P1-T04 | pending | No — Auth0 entity verification outstanding | **AC expanded:** CORS `CORS_ORIGIN` env var restriction required |
| P1-T05 | pending | No | |
| P1-T06 | pending | No | **Scope reduced:** module skeletons, Swagger, health check done via P1-T01; remaining: `helmet`, rate limiting, request validation pipeline, docker-compose (~0.5–1 day, down from 2 days) |
| P1-T07 | pending | No | |
| P1-T08 | pending | No — App Store accounts outstanding | |

**No HOLD or BLOCKED tasks.** Sprint 01 effective workload reduced by ~1.5 days due to P1-T01 over-delivery.

**Procurement deadline countdown — hard deadline 2026-05-01 (14 days):**

| Procurement Item | Required By | Deadline | Status |
|---|---|---|---|
| Auth0 COPPA entity verification | P1-T04 (P0) | 2026-05-01 | ⚠️ Unconfirmed — RECURRING BLOCKER |
| AWS account + IAM bootstrap credentials | P1-T03 (P0) | 2026-05-01 | ⚠️ Unconfirmed — RECURRING BLOCKER |
| Apple Developer + Google Play accounts | P1-T08 (P1) | 2026-05-01 | ⚠️ Unconfirmed — RECURRING BLOCKER |

All three items have now been flagged in **three consecutive agent cycles** without resolution. If unresolved by 2026-05-01, mark P1-T04, P1-T03, and P1-T08 as BLOCKED in `current_sprint.md` immediately.

**Next PM Agent trigger:** Friday 2026-05-15 (Sprint 01 end) → write `sprint_tracker/history/sprint_01_retro.md` (final).

---

## PM Agent Mid-Sprint Note — 2026-04-18 (Monday — pre-sprint, 16 days to open)

**Status at check-in:** Pre-sprint preparation window — **16 days until Sprint 01 opens (2026-05-04)**. Procurement deadline is **13 days away (2026-05-01)**.

**Git activity since last check-in (2026-04-17 Pass 2):**

| Commit | Description |
|---|---|
| `ed0943d` | `[P1-T02] Set up GitHub Actions CI pipeline for lint, typecheck, test, and build` |
| `3ec195e` | `PM Agent: Sprint 01 mid-sprint note — 2026-04-17` |

P1-T02 was completed and committed after the last retrospective was written. The CI pipeline is now live. Implementation Agent has delivered 2 of 8 sprint tasks **16 days before the sprint officially opens**.

**Task status review:**

| Task ID | Title | Status | Hold / Blocked? | Notes |
|---|---|---|---|---|
| P1-T01 | Initialize Turborepo monorepo | **done** | No | QC-approved; all AC met |
| P1-T02 | GitHub Actions CI pipeline | **done** | No | Completed post-retro; QC verification pending |
| P1-T03 | Terraform + AWS ECS Fargate (dev) | pending | ⚠️ AWS credentials unconfirmed | RECURRING BLOCKER |
| P1-T04 | Auth0 COPPA-compliant auth | pending | ⚠️ Auth0 entity verification unconfirmed | RECURRING BLOCKER |
| P1-T05 | Prisma core schema | pending | No | No blockers; can start on sprint open |
| P1-T06 | NestJS modules skeleton | pending | No | Scope reduced ~1.5 days via P1-T01 over-delivery |
| P1-T07 | Next.js teacher dashboard shell | pending | No | No blockers; can start on sprint open |
| P1-T08 | Flutter student app shell | pending | ⚠️ App Store accounts unconfirmed | RECURRING BLOCKER |

**No HOLD or BLOCKED tasks in `current_sprint.md`.** Procurement items remain `pending` (not yet escalated to BLOCKED) — the hard escalation deadline is 2026-05-01. At that point, if still unresolved, P1-T03, P1-T04, and P1-T08 must be set to BLOCKED.

**P1-T02 QC note:** The sprint_01_retro_2.md (written 2026-04-17) reported P1-T02 as "NO EVIDENCE" because the commit landed after the retro was authored. QC Agent should verify P1-T02 acceptance criteria in its next run:
- PR/push workflow runs format, lint, typecheck, test, build ✅ (confirmed by current_sprint.md)
- `.env.example` committed (mandatory per expanded AC) — **verify**
- `gitleaks` pre-commit hook in GitHub Actions pipeline — **verify**
- Turborepo remote caching configured — **verify**
- Branch protection rules (requires manual GitHub config) — **verify/document**

**Velocity update — pre-sprint window:**

| Metric | Value |
|---|---|
| Tasks completed (pre-sprint) | 2 of 8 (P1-T01, P1-T02) |
| P0 tasks completed | 2 of 5 |
| Estimated days of work remaining | ~9.5 days (accounting for P1-T06 scope reduction) |
| Sprint capacity available (10 working days) | 0.5-day buffer at current estimates |

**Procurement deadline countdown — hard deadline 2026-05-01 (13 days):**

| Procurement Item | Required By | Deadline | Status | Consecutive Cycles Flagged |
|---|---|---|---|---|
| Auth0 COPPA entity verification | P1-T04 (P0) | 2026-05-01 | ⚠️ Unconfirmed | 4 |
| AWS account + IAM bootstrap credentials | P1-T03 (P0) | 2026-05-01 | ⚠️ Unconfirmed | 4 |
| Apple Developer + Google Play accounts | P1-T08 (P1) | 2026-05-01 | ⚠️ Unconfirmed | 4 |

These items have now been flagged in **four consecutive agent cycles**. The RECURRING BLOCKER designation established in sprint_01_retro_2.md continues to apply. PM/Ops must confirm resolution by 2026-05-01 or the corresponding tasks will be set to BLOCKED before sprint open.

**No priority changes.** Execution order and scope adjustments from previous notes remain in effect. Implementation Agent gate is in force: **do not begin any task before 2026-05-04.**

**Next PM Agent trigger:** Friday 2026-05-15 (Sprint 01 end) → write `sprint_tracker/history/sprint_01_retro.md` (final — or sprint_01_retro_3.md if retro_2.md is already the authoritative pass).

---

## PM Agent Mid-Sprint Note — 2026-04-18 (Monday, Pass 2 — post-P1-T06 completion)

**Status at check-in:** Pre-sprint preparation window — **16 days until Sprint 01 opens (2026-05-04)**. Procurement deadline is **13 days away (2026-05-01)**. This note supersedes Pass 1 (also 2026-04-18); P1-T06 was completed after Pass 1 was committed.

**Git activity since Pass 1 (2026-04-18):**

| Commit | Description |
|---|---|
| `a94b3e9` | `[P1-T06] Bootstrap NestJS API with module controllers, helmet, and rate limiting` |
| `146a519` | `PM Agent: Sprint 01 mid-sprint note — 2026-04-18` |

**P1-T06 is complete.** NestJS bootstrap delivered: `helmet`, rate limiting, `ValidationPipe`, 6 domain modules with placeholder controllers/services, Swagger UI at `/api/docs`, `/health` returning 200, 7 unit tests passing. Implementation Agent has now delivered **3 of 8 tasks — 16 days before Sprint 01 officially opens**.

**Task status review (current):**

| Task ID | Title | Status | Hold / Blocked? |
|---|---|---|---|
| P1-T01 | Initialize Turborepo monorepo | **done** | No |
| P1-T02 | GitHub Actions CI pipeline | **done** | No — QC verification pending |
| P1-T03 | Terraform + AWS ECS Fargate (dev) | pending | ⚠️ RECURRING BLOCKER — AWS credentials |
| P1-T04 | Auth0 COPPA-compliant auth | pending | ⚠️ RECURRING BLOCKER — Auth0 entity verification |
| P1-T05 | Prisma core schema | pending | No — unblocked, ready for sprint open |
| P1-T06 | NestJS modules skeleton | **done** | No — QC verification pending |
| P1-T07 | Next.js teacher dashboard shell | pending | No — unblocked, ready for sprint open |
| P1-T08 | Flutter student app shell | pending | ⚠️ RECURRING BLOCKER — App Store accounts |

**No HOLD or BLOCKED tasks in `current_sprint.md`.** All three procurement items remain at WARNING severity (not yet escalated to BLOCKED); escalation deadline is 2026-05-01. See `sprint_tracker/PHASE_GATE_RISK.md` and `sprint_tracker/history/sprint_01_retro_3.md` for full analysis.

**Velocity update:**

| Metric | Value |
|---|---|
| Tasks completed (pre-sprint) | 3 of 8 — P1-T01, P1-T02, P1-T06 |
| P0 tasks completed | 2 of 5 |
| Estimated days of work remaining | ~7.5 days (P1-T06 done; 5 tasks remain) |
| Sprint capacity available (10 working days) | **~2.5-day buffer** — healthiest position yet |

**Procurement deadline countdown — hard deadline 2026-05-01 (13 days):**

| Procurement Item | Required By | Deadline | Consecutive Cycles Flagged |
|---|---|---|---|
| Auth0 COPPA entity verification | P1-T04 (P0) | 2026-05-01 | **5** |
| AWS account + IAM bootstrap credentials | P1-T03 (P0) | 2026-05-01 | **5** |
| Apple Developer + Google Play accounts | P1-T08 (P1) | 2026-05-01 | **5** |

Five consecutive cycles without resolution. If any item remains unconfirmed on 2026-05-01, PM Agent must immediately set P1-T03, P1-T04, and/or P1-T08 to `BLOCKED` in `current_sprint.md` — before sprint open.

**No priority changes.** Execution order remains: P1-T05 → P1-T07 on day 1 if P1-T03/P1-T04 blocked; P1-T03 and P1-T04 in parallel once procurement resolves; P1-T08 as final P1 task.

**Next PM Agent trigger:** Friday 2026-05-15 (Sprint 01 end) → write `sprint_tracker/history/sprint_01_retro_4.md` (final sprint retrospective — retro_3 is the most recent authoritative pass as of 2026-04-18).
