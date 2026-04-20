# Current Sprint State

**Sprint:** 01  
**Phase:** 1 — Foundation & MVP  
**Start:** 2026-05-04  
**End:** 2026-05-15  
**Sprint Goal:** Bootstrap monorepo, CI/CD, auth scaffolding, and core DB schema

---

## Active Tasks

| Task ID | Title | Owner Role | Priority | Status | Progress / Blocker |
|---|---|---|---|---|---|
| P1-T01 | Initialize Turborepo monorepo (web, mobile, backend, shared) | Tech Lead | P0 | done | All AC met: pnpm install, turbo build/lint/typecheck pass |
| P1-T02 | Set up GitHub Actions CI pipeline (lint, type-check, test) | Tech Lead | P0 | done | All AC met: PR/push workflow runs format, lint, typecheck, test, build; Turborepo remote caching configured; concurrency control enabled. Branch protection requires manual GitHub config. |
| P1-T03 | Configure Terraform + AWS ECS Fargate baseline (dev env) | DevOps | P0 | blocked | Blocker: Docker Compose local dev environment (plan P1-T04) not yet implemented; requires AWS credentials and access not available in this environment |
| P1-T04 | Auth0 integration — COPPA-compliant student/teacher/parent roles | Backend | P0 | done | All AC met: Auth0 JWT strategy (JWKS/RS256), global JwtAuthGuard + RolesGuard, @Public/@Roles/@CurrentUser decorators, COPPA-compliant DTOs (no email for students, class-code login for K-2), .env.example with Auth0 config, 32 tests passing, typecheck + lint clean |
| P1-T05 | Prisma schema — core tables (users, students, parents, teachers, schools) | Backend | P0 | done | All AC met: Prisma schema with 7 models (User, School, SchoolTeacher, Classroom, Enrollment, ParentChildLink, ParentalConsent), FK constraints enforced, migration SQL created; API endpoints: POST /parents/me/children (create child + consent), GET /parents/me/children, POST /schools, POST /teachers/me/classrooms, POST /classrooms/:id/students, GET /classrooms/:id/students; COPPA-compliant (no email on student accounts, consent with timestamp+IP); 68 tests passing, typecheck + lint clean |
| P1-T06 | NestJS app bootstrap — Auth, User, Content modules skeleton | Backend | P1 | done | All AC met: helmet, rate limiting, ValidationPipe configured; 6 modules with placeholder controllers, services, @ApiTags/@ApiOperation decorators; /health returns 200; Swagger UI at /api/docs; 7 unit tests passing; typecheck clean |
| P1-T07 | Next.js 15 app bootstrap — teacher dashboard shell | Frontend | P1 | done | All AC met: Tailwind CSS v4 + shadcn/ui Button/Input/Card components, pages (/, /login, /dashboard with sidebar shell), TypeScript strict zero errors, env config with .env.example, Vitest setup with 21 tests passing, lint + typecheck + build clean |
| P1-T08 | Flutter app bootstrap — student app shell (GoRouter, Riverpod, Rive) | Mobile | P1 | pending | |

---

## Carry-Over from Previous Sprint
None — first sprint.

---

## Sprint Blockers
None currently.

---

## Last Updated
2026-04-20 by Implementation Agent (P1-T07 completed)
