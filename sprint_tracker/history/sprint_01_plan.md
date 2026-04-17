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
