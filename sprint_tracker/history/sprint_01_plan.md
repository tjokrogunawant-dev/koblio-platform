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
