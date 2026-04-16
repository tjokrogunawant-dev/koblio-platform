# Scheduled Task Plan: Gamified Math Learning Platform (KooBits-Style)

**Version:** 1.0
**Date:** 2026-04-16
**Timeline:** May 5, 2026 — October 1, 2027 (18 months)
**Sprint cadence:** 2-week sprints (S1 = May 5-16, S2 = May 19-30, etc.)
**Status:** Ready for ticket creation

---

## Table of Contents

1. [Phase 1 Tasks — Foundation & MVP Core](#phase-1--foundation--mvp-core-may-5--jul-25-2026)
2. [Phase 2 Tasks — Adaptive Learning, Mobile & Subscriptions](#phase-2--adaptive-learning-mobile--subscriptions-jul-28--oct-17-2026)
3. [Phase 3 Tasks — Analytics, Content Depth & B2B](#phase-3--analytics-content-depth--b2b-oct-20-2026--jan-9-2027)
4. [Phase 4 Tasks — ML Adaptive, Social & Hardening](#phase-4--ml-adaptive-social--hardening-jan-12--apr-3-2027)
5. [Phase 5 Tasks — Growth, AI & Scale](#phase-5--growth-ai--scale-apr-7--oct-1-2027)
6. [Dependency Graph](#dependency-graph)
7. [Critical Path Analysis](#critical-path-analysis)
8. [Sprint Mapping](#sprint-mapping)
9. [Milestone Checkpoints](#milestone-checkpoints)
10. [Automation Hooks](#automation-hooks)
11. [Risk Flags & Buffer Recommendations](#risk-flags--buffer-recommendations)
12. [Infrastructure Budget Per Phase](#infrastructure-budget-per-phase)

---

## Phase 1 — Foundation & MVP Core (May 5 — Jul 25, 2026)

**Sprints:** S1-S6 | **Team:** 8 FTE | **Infra budget:** ~$576/mo

---

### P1-T01: Initialize Monorepo & Project Structure

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Initialize Turborepo monorepo with `apps/web` (Next.js 15), `apps/api` (NestJS), `packages/shared` (types, constants, validation), `packages/ui` (shared UI components). Configure TypeScript project references, ESLint, Prettier, .editorconfig. Create README with local dev setup instructions. |
| **Prerequisites** | None (first task) |
| **Duration** | 2 days |
| **Priority** | Critical |
| **Role** | Tech Lead |
| **Sprint** | S1 (May 5-16) |
| **Schedule Trigger** | Day 1 of project |
| **Acceptance Criteria** | `pnpm install` succeeds; `turbo build` compiles all packages; `turbo lint` passes; `turbo typecheck` passes; monorepo README documents local setup; all team members can clone and run locally |
| **Automation** | Template repo or `create-turbo` scaffold |

---

### P1-T02: Scaffold Next.js Web Application

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Scaffold Next.js 15 app in `apps/web/` with App Router, TypeScript strict mode, Tailwind CSS, shadcn/ui base components. Configure path aliases, environment variables (.env.local template). Set up initial pages: `/` (landing), `/login`, `/dashboard` (placeholder). |
| **Prerequisites** | P1-T01 |
| **Duration** | 2 days |
| **Priority** | Critical |
| **Role** | Frontend |
| **Sprint** | S1 |
| **Schedule Trigger** | After P1-T01 completes |
| **Acceptance Criteria** | `pnpm dev` serves web app on localhost:3000; Tailwind classes render correctly; shadcn/ui Button, Input, Card components available; TypeScript strict mode with zero errors; environment variable loading confirmed |
| **Automation** | `create-next-app` + shadcn CLI init |

---

### P1-T03: Scaffold NestJS Backend API

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Scaffold NestJS application in `apps/api/` with module structure: AuthModule, UserModule, ContentModule, GamificationModule, ClassroomModule, NotificationModule. Configure Swagger/OpenAPI auto-generation, CORS, helmet, rate limiting. Set up health check endpoint. |
| **Prerequisites** | P1-T01 |
| **Duration** | 2 days |
| **Priority** | Critical |
| **Role** | Backend (Tech Lead) |
| **Sprint** | S1 |
| **Schedule Trigger** | Parallel with P1-T02 |
| **Acceptance Criteria** | `pnpm dev` serves API on localhost:3001; `/health` returns 200; Swagger UI at `/api/docs`; all 6 modules scaffolded with placeholder controllers; OpenAPI spec exports cleanly |
| **Automation** | Nest CLI scaffolding |

---

### P1-T04: Docker Compose Local Dev Environment

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Create `docker-compose.yml` with PostgreSQL 16, MongoDB 7, Redis 7. Configure named volumes for data persistence. Include adminer/pgAdmin for DB inspection. Create seed scripts. Document startup in README. |
| **Prerequisites** | P1-T01 |
| **Duration** | 1 day |
| **Priority** | Critical |
| **Role** | DevOps |
| **Sprint** | S1 |
| **Schedule Trigger** | Parallel with P1-T02, P1-T03 |
| **Acceptance Criteria** | `docker compose up -d` starts all 3 databases; API can connect to all three; data persists across restarts; `docker compose down -v` cleanly tears down |
| **Automation** | Docker Compose file (declarative) |

---

### P1-T05: Provision AWS Staging Environment (Terraform)

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Write Terraform modules for: VPC + subnets, ECS Fargate cluster (2x t3.medium), RDS PostgreSQL (db.t3.medium, 50GB), ElastiCache Redis (cache.t3.micro), S3 bucket (content assets), CloudFront distribution, Route 53 DNS, ACM SSL certificate, Secrets Manager for credentials. Create staging workspace. Apply and verify. |
| **Prerequisites** | P1-T04 |
| **Duration** | 4 days |
| **Priority** | Critical |
| **Role** | DevOps |
| **Sprint** | S1 |
| **Schedule Trigger** | After P1-T04 (needs understanding of DB config) |
| **Acceptance Criteria** | `terraform apply` succeeds with no errors; ECS tasks running; RDS accessible from ECS; Redis accessible from ECS; S3 bucket created with CloudFront distribution; SSL cert validated; all secrets in Secrets Manager; cost estimate confirmed < $576/mo |
| **Automation** | Terraform IaC — fully automated provisioning; store state in S3+DynamoDB backend |

---

### P1-T06: Configure CI/CD Pipeline (GitHub Actions)

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Set up GitHub Actions workflows: (1) PR workflow — lint, typecheck, unit tests, build; (2) main merge — auto-deploy to staging via ECS; (3) release tag — deploy to production (blue-green). Configure Turborepo remote caching. Set up PR preview deployments (Vercel or ECS staging). |
| **Prerequisites** | P1-T01, P1-T05 |
| **Duration** | 3 days |
| **Priority** | Critical |
| **Role** | DevOps |
| **Sprint** | S1-S2 |
| **Schedule Trigger** | After P1-T05 (needs AWS targets) |
| **Acceptance Criteria** | PR opens → Actions run lint+typecheck+test in < 5min; merge to main → staging auto-deploys in < 10min; PR preview URL generated; Turborepo cache hits on unchanged packages; failed checks block PR merge |
| **Automation** | GitHub Actions YAML (fully automated); Turborepo remote cache |

---

### P1-T07: Auth0 Tenant Setup & COPPA Configuration

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Create Auth0 tenant. Configure: custom domain, application (SPA for web, native for future mobile), API. Set up COPPA-compliant flows: no child email collection, parental consent gate, age-gating rules. Configure social connections (Google for parents/teachers only). Create test users for each role. |
| **Prerequisites** | None |
| **Duration** | 2 days |
| **Priority** | Critical |
| **Role** | Backend |
| **Sprint** | S1 |
| **Schedule Trigger** | Parallel with P1-T01 through P1-T05 |
| **Acceptance Criteria** | Auth0 dashboard configured; test login works for parent, teacher, student roles; parental consent flow verified; no email required for child accounts; COPPA compliance checklist reviewed with legal counsel |
| **Automation** | Auth0 Terraform provider for reproducible config |

---

### P1-T08: Design System Foundations (Figma + Code)

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Establish design system in Figma: color palette (child-friendly, high contrast, accessible), typography scale (readable for ages 6-12), spacing system, border radii (rounded/bubbly), icon set. Build 10 core components in `packages/ui`: Button, Input, Card, Badge, ProgressBar, Avatar, Modal, Toast, Dropdown, Tooltip — customized from shadcn/ui with child-friendly styling. |
| **Prerequisites** | P1-T02 |
| **Duration** | 5 days |
| **Priority** | High |
| **Role** | Design + Frontend |
| **Sprint** | S1-S2 |
| **Schedule Trigger** | After P1-T02 (needs web app to test components) |
| **Acceptance Criteria** | Figma file with complete style guide; 10 components exported to `packages/ui`; Storybook (or similar) for component preview; components pass WCAG AA contrast checks; components render well at 48x48dp minimum touch targets |
| **Automation** | Storybook auto-deploy to PR previews |

---

### P1-T09: Sentry Error Tracking Setup

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Create Sentry project for web (Next.js) and API (NestJS). Integrate Sentry SDK into both apps. Configure source maps upload in CI/CD. Set up alert rules: error spike > 10/min → Slack notification. Create Sentry team with appropriate access. |
| **Prerequisites** | P1-T02, P1-T03, P1-T06 |
| **Duration** | 1 day |
| **Priority** | Medium |
| **Role** | DevOps |
| **Sprint** | S2 |
| **Schedule Trigger** | After CI/CD is running |
| **Acceptance Criteria** | Intentional test error in web + API both appear in Sentry dashboard; source maps resolve to readable stack traces; Slack alert fires on error threshold; free tier confirmed sufficient |
| **Automation** | Sentry SDK auto-init; source map upload in CI |

---

### P1-T10: Auth Module — Parent & Teacher Registration

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Implement Auth module in NestJS: parent registration (email/password via Auth0), teacher registration, email verification flow. JWT access tokens (15min TTL) + refresh tokens (httpOnly cookie, 7d TTL) with Redis-backed revocation list. Login endpoint, logout endpoint, token refresh endpoint. |
| **Prerequisites** | P1-T03, P1-T04, P1-T07 |
| **Duration** | 3 days |
| **Priority** | Critical |
| **Role** | Backend |
| **Sprint** | S2 |
| **Schedule Trigger** | After backend + Auth0 + Docker ready |
| **Acceptance Criteria** | POST `/auth/register` creates parent/teacher account; POST `/auth/login` returns JWT + sets refresh cookie; POST `/auth/refresh` rotates tokens; POST `/auth/logout` revokes refresh token in Redis; Auth0 consent recorded; unit tests for all endpoints; 401 returned on expired/invalid tokens |

---

### P1-T11: Auth Module — Student Login & RBAC

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Student login: username + password (set by parent/teacher) — no email. Class code entry for young students (K-2). RBAC middleware with NestJS guards: Student, Parent, Teacher, Admin roles. Decorator-based permission checks on all endpoints. |
| **Prerequisites** | P1-T10 |
| **Duration** | 3 days |
| **Priority** | Critical |
| **Role** | Backend |
| **Sprint** | S2 |
| **Schedule Trigger** | After P1-T10 |
| **Acceptance Criteria** | Student login with username/password works; class code entry resolves to correct classroom; RBAC guards enforce role restrictions (student can't access teacher endpoints); 403 returned on unauthorized access; integration tests covering each role |

---

### P1-T12: User Module — Parent-Child Linking & School Association

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Prisma schema for `users`, `schools`, `classrooms`, `enrollments`, `parent_child_links`. Parent creates child profile (name, grade, sets login credentials). Teacher creates school, creates classrooms, invites other teachers. Parental consent recorded with timestamp and IP (COPPA audit trail). |
| **Prerequisites** | P1-T10, P1-T11 |
| **Duration** | 3 days |
| **Priority** | Critical |
| **Role** | Backend |
| **Sprint** | S2-S3 |
| **Schedule Trigger** | After P1-T11 |
| **Acceptance Criteria** | Parent can create child account via API; child account linked to parent; teacher can create school + classroom; students can be enrolled in classroom; consent record stored with timestamp+IP; Prisma migrations run cleanly; relational integrity enforced (FK constraints) |

---

### P1-T13: Auth Frontend — Login & Registration Pages

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Build web UI for: parent registration form, teacher registration form, login page (role selector → appropriate login flow), student class code entry, parent child-account creation flow (within parent dashboard). Integrate with Auth0 SDK and backend auth endpoints. |
| **Prerequisites** | P1-T08, P1-T10, P1-T11 |
| **Duration** | 4 days |
| **Priority** | Critical |
| **Role** | Frontend |
| **Sprint** | S2-S3 |
| **Schedule Trigger** | After design system + auth backend ready |
| **Acceptance Criteria** | Full registration → email verify → login flow works end-to-end; student login with class code works; error states handled (wrong password, duplicate email); responsive design (desktop + tablet); Playwright E2E test for happy path |

---

### P1-T14: MongoDB Problem Document Schema & API

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Define MongoDB problem document schema per tech stack spec: curriculum taxonomy (country → grade → strand → topic → subtopic → skill), difficulty metadata (IRT params placeholder, level_label), question types (MCQ, fill-in, true/false), hints array, solution with steps, media references (S3 URLs), tags, status (draft/published/deprecated). Build CRUD API endpoints: `GET /problems` (filtered), `GET /problems/:id`, `POST /problems` (admin), `PATCH /problems/:id`. |
| **Prerequisites** | P1-T03, P1-T04 |
| **Duration** | 3 days |
| **Priority** | Critical |
| **Role** | Backend |
| **Sprint** | S3 |
| **Schedule Trigger** | Week 5 start |
| **Acceptance Criteria** | Schema validated against tech stack doc spec; filter by grade, topic, difficulty, status works; pagination implemented; API returns consistent response format; validation rejects malformed documents; OpenAPI spec updated |

---

### P1-T15: Admin CMS for Problem Authoring

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Build admin CMS pages in Next.js: rich editor for creating math problems with live KaTeX preview, image upload to S3 (with pre-signed URLs), metadata tagging (curriculum taxonomy selector), hint editor (ordered list), solution step editor. Problem list view with search/filter/sort. |
| **Prerequisites** | P1-T14, P1-T08 |
| **Duration** | 5 days |
| **Priority** | High |
| **Role** | Frontend |
| **Sprint** | S3 |
| **Schedule Trigger** | After P1-T14 (needs API) |
| **Acceptance Criteria** | Admin can create a problem with all fields populated; KaTeX preview renders math expressions in real-time; image upload works (appears in S3, URL stored in document); curriculum taxonomy selector shows nested country→grade→topic; problem list view with filtering; problems persist correctly in MongoDB |

---

### P1-T16: Content Seeding — 500+ Problems

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Seed 500+ math problems across grades 1-6 for primary curriculum market (Singapore MOE or US Common Core). Build CSV/JSON bulk import tool. Source problems from: (1) manual authoring by content advisor, (2) open-source banks (OpenStax, Khan Academy CC content), (3) template-based arithmetic generation. Tag all problems with curriculum taxonomy, difficulty level, question type. |
| **Prerequisites** | P1-T14, P1-T15 |
| **Duration** | 8 days |
| **Priority** | Critical |
| **Role** | Content + Backend (import tool) |
| **Sprint** | S3-S4 |
| **Schedule Trigger** | After CMS is functional |
| **Acceptance Criteria** | 500+ problems in MongoDB with complete metadata; every problem has: curriculum tags, difficulty level, at least one hint, full solution; bulk import tool processes CSV/JSON without errors; content reviewed by curriculum advisor for accuracy; KaTeX rendering verified for all math expressions |
| **Risk Flag** | HIGH RISK — content seeding is a common bottleneck. Start sourcing problems immediately, don't wait for CMS polish. |

---

### P1-T17: KaTeX Integration — Web Math Rendering

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Integrate KaTeX into web frontend for rendering LaTeX math expressions in problems, solutions, and hints. Create reusable `<MathExpression>` component that handles inline and block math. Test with all problem types in seed content. Handle edge cases (malformed LaTeX, missing expressions). |
| **Prerequisites** | P1-T02 |
| **Duration** | 2 days |
| **Priority** | High |
| **Role** | Frontend |
| **Sprint** | S3 |
| **Schedule Trigger** | Parallel with P1-T14, P1-T15 |
| **Acceptance Criteria** | `<MathExpression latex="\\frac{3}{4}" />` renders correctly; inline and block modes supported; graceful fallback on malformed LaTeX (shows raw text, not crash); renders in < 50ms for typical expressions; tested with 20+ diverse LaTeX expressions from seed content |

---

### P1-T18: Student Problem-Solving UI

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Build student-facing web UI: topic browser (grade → strand → topic), problem display with KaTeX rendering, answer input (MCQ radio buttons, fill-in-the-blank text field, true/false toggle), submit button, immediate correct/incorrect feedback with animation, full worked solution reveal, "Next Problem" flow. |
| **Prerequisites** | P1-T14, P1-T17, P1-T08, P1-T13 (student must be able to login) |
| **Duration** | 5 days |
| **Priority** | Critical |
| **Role** | Frontend |
| **Sprint** | S4 |
| **Schedule Trigger** | Week 7 start |
| **Acceptance Criteria** | Student can browse curriculum tree and select a topic; problem renders correctly (text + math + images); all 3 question types work (MCQ, fill-in, T/F); correct answer shows green success + solution; incorrect answer shows red + hints + solution; Next Problem advances to next in set; responsive on desktop + tablet; audio feedback plays on correct/incorrect |

---

### P1-T19: Attempt Recording API

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Create `student_problem_attempts` table in PostgreSQL (student_id, problem_id, answer_given, is_correct, time_spent_ms, hints_used, timestamp). API endpoint `POST /attempts` records each attempt. `GET /attempts` (student's own history, filtered by topic/date). Ensure idempotency (no duplicate recording on retry). |
| **Prerequisites** | P1-T12, P1-T14 |
| **Duration** | 2 days |
| **Priority** | Critical |
| **Role** | Backend |
| **Sprint** | S4 |
| **Schedule Trigger** | Parallel with P1-T18 |
| **Acceptance Criteria** | POST `/attempts` records attempt with all fields; GET `/attempts` returns student's history with pagination; duplicate submissions rejected (idempotency key); time_spent_ms accurately recorded; Prisma migration creates table with proper indexes (student_id + problem_id, timestamp) |

---

### P1-T20: Hint System — Progressive Reveal

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Implement progressive hint system: hints stored as ordered array in problem document. UI shows "Get Hint" button; each click reveals next hint. Track hints_used in attempt record. After all hints exhausted, show "Show Solution" button. Hints render with KaTeX support. |
| **Prerequisites** | P1-T18, P1-T14 |
| **Duration** | 2 days |
| **Priority** | High |
| **Role** | Frontend + Backend |
| **Sprint** | S4 |
| **Schedule Trigger** | After P1-T18 |
| **Acceptance Criteria** | "Get Hint" button appears for problems with hints; each click reveals one hint (in order); hint count tracked and sent with attempt; KaTeX renders in hints; after all hints, solution reveal button appears; hints_used persisted in attempt record |

---

### P1-T21: Basic Difficulty Buckets

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Tag all seed problems with difficulty levels: easy (1), medium (2), hard (3). Add difficulty filter to problem selection API. Student topic view shows difficulty selector. Pre-adaptive engine: serve problems in order of increasing difficulty within a topic. |
| **Prerequisites** | P1-T16, P1-T14 |
| **Duration** | 1 day |
| **Priority** | Medium |
| **Role** | Backend |
| **Sprint** | S4 |
| **Schedule Trigger** | After content seeded |
| **Acceptance Criteria** | All 500+ problems tagged with difficulty 1/2/3; API filters by difficulty; problems served in ascending difficulty order within a topic; UI shows difficulty indicator (stars or label) |

---

### P1-T22: Points & Coins System

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Create `points_ledger` table (append-only: student_id, amount, reason, problem_id, timestamp). Points awarded per correct answer: easy=1, medium=3, hard=5 coins. Create `GET /students/:id/points` (total balance) and `GET /students/:id/points/history` endpoints. Frontend: display coin count in student header, animated coin increment on correct answer. |
| **Prerequisites** | P1-T19 |
| **Duration** | 3 days |
| **Priority** | High |
| **Role** | Backend + Frontend |
| **Sprint** | S5 |
| **Schedule Trigger** | Week 9 start |
| **Acceptance Criteria** | Correct answer awards coins (scaled by difficulty); points_ledger is append-only (no balance mutation); GET total balance returns correct sum; coin animation plays on award; points display in student UI header; ledger entries have reason field for auditability |

---

### P1-T23: XP & Level System

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Add XP accumulation separate from coins. Level thresholds: L1=0, L2=100, L3=300, L4=600, L5=1000, etc. (geometric progression). Store current XP and level in user profile. Frontend: level badge + XP progress bar toward next level. Level-up animation (Framer Motion). |
| **Prerequisites** | P1-T22 |
| **Duration** | 2 days |
| **Priority** | High |
| **Role** | Backend + Frontend |
| **Sprint** | S5 |
| **Schedule Trigger** | After P1-T22 |
| **Acceptance Criteria** | XP increments on correct answers; level calculated from XP thresholds; level badge and progress bar displayed; level-up triggers animation; API returns current level + XP + XP needed for next level |

---

### P1-T24: Daily Streak Tracking

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Redis-backed daily streak: track consecutive days with at least 1 problem solved. `HASH` per student with `current_streak`, `longest_streak`, `last_active_date`. Streak bonus: 7-day=2x coins, 30-day=3x. Frontend: flame/counter icon in student header. Streak-at-risk notification when approaching midnight without activity. |
| **Prerequisites** | P1-T19 (needs attempt recording) |
| **Duration** | 2 days |
| **Priority** | High |
| **Role** | Backend + Frontend |
| **Sprint** | S5 |
| **Schedule Trigger** | Parallel with P1-T22, P1-T23 |
| **Acceptance Criteria** | Streak increments daily on first problem solved; streak resets to 0 on missed day; 7-day bonus multiplier applied; streak counter displayed with visual (flame icon); Redis HASH stores streak data correctly; timezone handling tested (student's local date) |

---

### P1-T25: Class Leaderboard

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Redis ZSET leaderboard per classroom, weekly reset (Sunday midnight). Score = weighted-correct problems this week (difficulty-weighted). API: `GET /classrooms/:id/leaderboard` returns top 10 + requesting student's rank. Frontend: leaderboard UI showing ranks, avatars, scores. Weekly reset cron job. |
| **Prerequisites** | P1-T19, P1-T12 |
| **Duration** | 3 days |
| **Priority** | High |
| **Role** | Backend + Frontend |
| **Sprint** | S5 |
| **Schedule Trigger** | Parallel with P1-T22 |
| **Acceptance Criteria** | Leaderboard updates on each correct answer; ZSET ranking returns O(log N); top 10 + student rank displayed; weekly reset cron runs correctly; empty classroom handled gracefully; tied scores ordered by name |
| **Automation** | Cron job for weekly reset (AWS EventBridge or BullMQ scheduled job) |

---

### P1-T26: Basic Avatar Selection

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Create 6-8 pre-made character avatar images (diverse, child-friendly). Store in S3. Add `avatar_id` to user profile. UI: avatar picker during onboarding and in profile settings. Display avatar on leaderboard and student dashboard. No shop yet (all avatars free). |
| **Prerequisites** | P1-T08, P1-T12 |
| **Duration** | 3 days (2 design + 1 dev) |
| **Priority** | Medium |
| **Role** | Design + Frontend |
| **Sprint** | S5 |
| **Schedule Trigger** | Parallel with gamification tasks |
| **Acceptance Criteria** | 6-8 diverse avatar options available; student can select during onboarding; avatar displayed on leaderboard, dashboard, profile; avatar persisted in user profile; avatars render well at small sizes (32x32px) and large (128x128px) |

---

### P1-T27: Daily Challenge

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | One curated problem per grade per day. Content admin selects or auto-picks from highest-rated problems. Bonus coins (10) for completing daily challenge. Redis cache for today's challenge per grade. Frontend: featured "Daily Challenge" card on student dashboard. Track completion per student per day. |
| **Prerequisites** | P1-T16, P1-T22 |
| **Duration** | 2 days |
| **Priority** | Medium |
| **Role** | Backend + Frontend |
| **Sprint** | S5 |
| **Schedule Trigger** | After content seeded + points system working |
| **Acceptance Criteria** | Daily challenge appears on student dashboard; one per grade per day; bonus coins awarded on completion; can only complete once per day; challenge rotates at midnight (configurable timezone); cached in Redis for fast serving |
| **Automation** | Daily cron job to select/rotate challenge (AWS EventBridge) |

---

### P1-T28: Gamification Event Bus (BullMQ)

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Set up BullMQ job queue (Redis-backed) for asynchronous gamification event processing. On correct answer → enqueue job that: awards points, updates leaderboard ZSET, updates streak, checks daily challenge completion. Ensures gamification processing doesn't block problem-solving UX (< 200ms API response). |
| **Prerequisites** | P1-T22, P1-T24, P1-T25 |
| **Duration** | 2 days |
| **Priority** | High |
| **Role** | Backend |
| **Sprint** | S5 |
| **Schedule Trigger** | After all gamification components exist |
| **Acceptance Criteria** | Attempt recording returns < 200ms (gamification processing is async); BullMQ dashboard shows job processing; failed jobs are retried 3x with backoff; dead letter queue captures permanently failed jobs; all gamification updates happen within 2s of attempt |
| **Automation** | BullMQ dashboard auto-deployed to staging |

---

### P1-T29: Teacher Dashboard v1 — Class Management

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Teacher web UI: create class (name, grade, subject), add students (manual form + CSV upload with name/grade → auto-generate credentials), view roster with student list and statuses. Download credentials sheet (PDF) after bulk import for distributing to students. |
| **Prerequisites** | P1-T12, P1-T13 |
| **Duration** | 4 days |
| **Priority** | High |
| **Role** | Frontend + Backend |
| **Sprint** | S6 |
| **Schedule Trigger** | Week 11 start |
| **Acceptance Criteria** | Teacher can create a class; add students manually (one at a time); CSV upload creates multiple students with auto-generated usernames/passwords; credentials sheet downloadable as PDF; roster view shows all students with enrollment status; teacher can remove a student from class |

---

### P1-T30: Teacher Dashboard v1 — Assignments

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Assignment creation flow: teacher selects topic, difficulty range, number of problems, deadline → system auto-generates problem set. Assignment tracking: view per-student submission status (not started / in progress / completed), auto-graded results. |
| **Prerequisites** | P1-T29, P1-T14, P1-T19 |
| **Duration** | 4 days |
| **Priority** | High |
| **Role** | Frontend + Backend |
| **Sprint** | S6 |
| **Schedule Trigger** | After P1-T29 |
| **Acceptance Criteria** | Teacher can create assignment with topic/difficulty/count/deadline; system selects appropriate problems; students see assigned problems in their dashboard; submission status tracked per student; auto-grading shows correct/incorrect per problem; teacher sees class-level completion summary |

---

### P1-T31: Teacher Dashboard v1 — Basic Progress View

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Student progress view for teachers: problems attempted, % correct by topic, recent activity timeline, streak status. Class-level summary: average scores by topic (bar chart using Recharts). |
| **Prerequisites** | P1-T19, P1-T29 |
| **Duration** | 3 days |
| **Priority** | High |
| **Role** | Frontend |
| **Sprint** | S6 |
| **Schedule Trigger** | Parallel with P1-T30 |
| **Acceptance Criteria** | Teacher can click on a student to see their progress; topics show % correct with attempt count; recent activity timeline shows last 20 actions; class-level bar chart renders with Recharts; data matches what's in the database (verified manually) |

---

### P1-T32: Parent Dashboard v1 — Basic Child View

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Parent web UI: view linked child's basic activity (problems done today/week, current streak, level, recent topic performance). Minimal — no analytics yet, just a summary view. |
| **Prerequisites** | P1-T12, P1-T13, P1-T19 |
| **Duration** | 2 days |
| **Priority** | Medium |
| **Role** | Frontend |
| **Sprint** | S6 |
| **Schedule Trigger** | Parallel with teacher dashboard tasks |
| **Acceptance Criteria** | Parent can see linked child's dashboard; shows problems solved today, current streak, level, recent scores by topic; data is read-only (parent can't modify); UI matches design system |

---

### P1-T33: End-to-End Integration Testing

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Write Playwright E2E tests covering full user flows: (1) Parent registers → creates child → child logs in → solves problems → earns points → sees leaderboard; (2) Teacher registers → creates class → adds students → creates assignment → views progress; (3) Edge cases: wrong password, expired session, offline problem. Set up test runner in CI/CD. |
| **Prerequisites** | All P1 functional tasks (P1-T10 through P1-T32) |
| **Duration** | 4 days |
| **Priority** | Critical |
| **Role** | QA |
| **Sprint** | S6 |
| **Schedule Trigger** | After all functional tasks are code-complete |
| **Acceptance Criteria** | 3+ E2E test suites passing in CI; tests run against staging environment; test execution time < 5min; no critical bugs found; flaky test rate < 5%; test report generated per run |
| **Automation** | Playwright tests run in GitHub Actions on every PR and nightly |

---

### P1-T34: Staging Deployment & Performance Baseline

| Field | Detail |
|-------|--------|
| **Phase** | 1 |
| **Description** | Full deployment to AWS staging. Verify all services running. Run performance baseline: API response times (p50, p95, p99), page load times, database query times. Document current performance. Fix any deployment issues. Onboard full team for internal testing. |
| **Prerequisites** | P1-T33, P1-T05, P1-T06 |
| **Duration** | 2 days |
| **Priority** | Critical |
| **Role** | DevOps + Tech Lead |
| **Sprint** | S6 |
| **Schedule Trigger** | Final 2 days of Phase 1 |
| **Acceptance Criteria** | All services running on staging; API p95 < 500ms; page load < 3s; no 5xx errors in logs; team has tested full student + teacher + parent flows; zero critical bugs; < 5 high-severity bugs documented |

---

## Phase 2 — Adaptive Learning, Mobile & Subscriptions (Jul 28 — Oct 17, 2026)

**Sprints:** S7-S12 | **Team:** 10 FTE | **Infra budget:** ~$770/mo

---

### P2-T01: Rules-Based Adaptive Difficulty Engine

| Field | Detail |
|-------|--------|
| **Phase** | 2 |
| **Description** | Implement adaptive difficulty in NestJS Adaptive Learning module: 3 consecutive wrong → step down difficulty band; 5 consecutive correct → step up. Per-student difficulty state stored in PostgreSQL. Engine replaces static difficulty buckets from Phase 1 for problem selection. |
| **Prerequisites** | P1-T19, P1-T21 |
| **Duration** | 4 days |
| **Priority** | Critical |
| **Role** | ML Engineer + Backend |
| **Sprint** | S7 |
| **Schedule Trigger** | Day 1 of Phase 2 |
| **Acceptance Criteria** | Difficulty adjusts based on streak; student's current difficulty band persisted per topic; problem selection uses adaptive difficulty; internal testing shows reasonable targeting (not too easy/hard); teacher can override per student |

---

### P2-T02: Bayesian Knowledge Tracing (BKT) with Mood-Scoped Modifiers

| Field | Detail |
|-------|--------|
| **Phase** | 2 |
| **Description** | Implement BKT model with mood-aware session-scoped parameter modifiers. Track P(known) per curriculum skill per student. **Data model:** (1) `skills` table stores base parameters per skill (`base_P_L0`, `base_P_T`, `base_P_G`, `base_P_S`) — populated from population defaults at seed time, only updated via recalibration jobs. (2) `student_sessions` table stores ephemeral `mood_modifiers` as jsonb `{P_T_delta, P_G_delta, P_S_delta}` — no P_L0_delta (initial knowledge is not affected by mood). (3) `student_skill_states` table stores P(known) per (student, skill) — this is the latent knowledge trace. At read time, BKT service computes `effective_P_X = base_P_X + session.mood_modifiers.P_X_delta`, clamps effective values to [0.01, 0.99] to avoid posterior discontinuities, applies standard BKT update equations, and writes back only P(known) — never the effective params. Separate append-only `mood_classification_events` table logs per-attempt mood classifications for trajectory analytics (hot-path reads stay on the single-row session record for performance). Session lifecycle: 60-minute inactivity timeout resets `mood_modifiers` to zero. |
| **Prerequisites** | P2-T01, P1-T19 |
| **Duration** | 6 days (+1 day vs plain BKT for the schema separation, session lifecycle, and clamping) |
| **Priority** | Critical |
| **Role** | ML Engineer + Backend |
| **Sprint** | S7-S8 |
| **Schedule Trigger** | After P2-T01 |
| **Acceptance Criteria** | (1) `skills` table schema with four base parameters deployed via Prisma migration; (2) `student_sessions` table with jsonb `mood_modifiers` column; (3) `student_skill_states` table for per-(student,skill) P(known); (4) `mood_classification_events` append-only events table; (5) P(known) updates after each response using effective params (base + modifier); (6) skills with low P(known) prioritized in problem selection; (7) BKT state queryable per student per skill via API; (8) default parameters seeded for all 500+ curriculum skills; (9) clamp [0.01, 0.99] applied inside BKT service (not at scheduler or classifier layer); (10) 60-min inactivity timeout verified to reset mood_modifiers; (11) unit tests verify `skills.base_P_X` is NEVER mutated by an attempt — only `student_skill_states.P_known` is written back; (12) internal validation: P(known) converges toward 1 for mastered skills, stays low for unlearned skills, unaffected by sessions flagged as frustrated/confused/bored |
| **Spec References** | `/home/tjokro/general_purpose/ai_office/workers/data/worker_3/workspace/mood_detection_spec.md` (authoritative); Thursday integration doc at `adaptive_engine_interface.md` |

---

### P2-T03: Spaced Repetition (FSRS-4.5)

| Field | Detail |
|-------|--------|
| **Phase** | 2 |
| **Description** | Implement FSRS-4.5 spaced repetition using open-spaced-repetition's algorithm (MIT/BSD licensed — NOT AGPL; Anki the app is AGPL but the FSRS algorithm repos are permissive). Use pretrained default parameters for cold-start. Schedule reviews based on FSRS difficulty/stability/retrievability per card per student. Per-user parameter optimization kicks in once that student has ~1,000 reviews. Track next_review_date and FSRS state per student per problem. Mix review problems into daily practice (~20% review, 80% new/weak skills). Chosen over SM-2 based on 20-30% fewer reviews at 90% retention target and RMSE 0.04-0.05 vs 0.10+ on retention prediction. |
| **Prerequisites** | P2-T02 |
| **Duration** | 4 days (+1 day vs SM-2 for FSRS integration — encapsulated complexity, ~500 LOC for the algorithm) |
| **Priority** | High |
| **Role** | ML Engineer |
| **Sprint** | S8 |
| **Schedule Trigger** | After P2-T02 |
| **Acceptance Criteria** | FSRS library integrated (py-fsrs or equivalent, pinned to specific version); review schedule follows FSRS intervals (not fixed SM-2 1d/3d/7d); 20% of served problems are reviews; FSRS state (difficulty/stability/retrievability) persisted per student-problem pair; overdue reviews prioritized by retrievability; student sees "Review" badge on review problems; cold-start verified with default parameters (no per-user calibration needed for first 1K reviews) |
| **Automation Note** | Per-user FSRS parameter optimization runs as offline batch job once a student hits the 1K-review threshold — does not block serving |

---

### P2-T04: Next-Problem Selection Algorithm

| Field | Detail |
|-------|--------|
| **Phase** | 2 |
| **Description** | Combine rules-based difficulty, BKT skill priorities, and spaced repetition into a unified next-problem selector. Algorithm: (1) check overdue reviews, (2) prioritize weakest skills (lowest P(known)), (3) target difficulty near student ability, (4) respect curriculum sequence constraints. Return selected problem via API. |
| **Prerequisites** | P2-T01, P2-T02, P2-T03 |
| **Duration** | 3 days |
| **Priority** | Critical |
| **Role** | ML Engineer + Backend |
| **Sprint** | S8 |
| **Schedule Trigger** | After all adaptive components exist |
| **Acceptance Criteria** | Single `GET /problems/next?student_id=X&topic=Y` endpoint returns adaptively-selected problem; reviews mixed in at 20%; weak skills prioritized; difficulty appropriate; curriculum order respected; response time < 100ms; A/B tracking hooks collect data for future IRT |

---

### P2-T05: Difficulty Parameter Seeding

| Field | Detail |
|-------|--------|
| **Phase** | 2 |
| **Description** | Tag all 500+ existing problems with initial difficulty parameter estimates. Content team reviews each problem and assigns estimated difficulty (b parameter), discrimination (a parameter set to default 1.0). Bulk update via CSV. These are placeholder values for Phase 4 IRT calibration. |
| **Prerequisites** | P1-T16 |
| **Duration** | 5 days |
| **Priority** | High |
| **Role** | Content + ML Engineer |
| **Sprint** | S7-S8 |
| **Schedule Trigger** | Parallel with P2-T01 through P2-T04 |
| **Acceptance Criteria** | All 500+ problems have difficulty and discrimination parameters; parameters reviewed by content team for reasonableness; CSV import tool processes updates; IRT parameter fields populated in MongoDB |

---

### P2-T06: Content Expansion to 2,000+ Problems

| Field | Detail |
|-------|--------|
| **Phase** | 2 |
| **Description** | Expand content library from 500 to 2,000+ problems covering grades 1-6. Add new problem types: drag-and-drop ordering, matching, multi-step word problems. Enhance hint system with visual aids. Create step-by-step animated solutions for key topics (fractions, word problems). Verify curriculum alignment. |
| **Prerequisites** | P1-T15, P1-T16 |
| **Duration** | 15 days (ongoing through phase) |
| **Priority** | Critical |
| **Role** | Content (1-2 creators) + Design (animated solutions) |
| **Sprint** | S8-S10 |
| **Schedule Trigger** | After content team ramp (week 16) |
| **Acceptance Criteria** | 2,000+ problems in library; all grades 1-6 covered with minimum 200 problems per grade; new problem types functional; hints with visual aids for 50+ problems; animated solutions for top 20 topics; curriculum alignment verified by math educator |
| **Risk Flag** | HIGH RISK — content creation is the most common project bottleneck. Hire content creators by start of Phase 2; don't wait. |

---

### P2-T07: Flutter Project Setup & Core Architecture

| Field | Detail |
|-------|--------|
| **Phase** | 2 |
| **Description** | Initialize Flutter project in `apps/mobile/`. Configure GoRouter (routing), Riverpod (state management), Dio (HTTP client), Drift (SQLite for offline). Set up OpenAPI codegen to generate Dart API client from NestJS Swagger spec. Configure Firebase project for push notifications and analytics. |
| **Prerequisites** | P1-T03 (needs backend API spec) |
| **Duration** | 3 days |
| **Priority** | Critical |
| **Role** | Mobile |
| **Sprint** | S9 |
| **Schedule Trigger** | Week 18 start |
| **Acceptance Criteria** | Flutter project builds for iOS and Android; GoRouter navigation works; Riverpod state management wired up; Dio configured with base URL and auth interceptor; OpenAPI-generated Dart client compiles and matches backend spec; Firebase project created |
| **Automation** | OpenAPI codegen runs in CI on backend spec changes |

---

### P2-T08: Flutter Core Screens — Login & Problem Solving

| Field | Detail |
|-------|--------|
| **Phase** | 2 |
| **Description** | Build Flutter screens: login (username/password + class code), grade/topic selection browser, problem-solving flow (display problem with flutter_math_fork → answer → feedback → solution → next). Match web UX but optimize for touch (large targets, swipe navigation). |
| **Prerequisites** | P2-T07 |
| **Duration** | 5 days |
| **Priority** | Critical |
| **Role** | Mobile |
| **Sprint** | S9-S10 |
| **Schedule Trigger** | After P2-T07 |
| **Acceptance Criteria** | Student can login on mobile; browse curriculum; solve problems with math rendering; correct/incorrect feedback with animation; touch targets ≥ 48dp; works on iPhone SE (smallest) through iPad; works on Android mid-range |

---

### P2-T09: Flutter Gamification UI

| Field | Detail |
|-------|--------|
| **Phase** | 2 |
| **Description** | Implement gamification UI in Flutter: points/coins display, streak counter with flame animation, daily challenge card, class leaderboard view, avatar selection, level badge + XP progress bar. Rive animations for correct/incorrect answer character reactions. |
| **Prerequisites** | P2-T08 |
| **Duration** | 4 days |
| **Priority** | High |
| **Role** | Mobile + Design (Rive animations) |
| **Sprint** | S10 |
| **Schedule Trigger** | After core screens |
| **Acceptance Criteria** | All gamification elements visible and functional on mobile; Rive animations play on correct/incorrect; coins animate on award; leaderboard renders correctly; streak flame animates; consistent with web UX |

---

### P2-T10: Flutter Offline Support (Drift/SQLite)

| Field | Detail |
|-------|--------|
| **Phase** | 2 |
| **Description** | Implement offline-first problem solving: cache problem sets in Drift/SQLite. Student can solve cached problems without internet. Answers queued locally and synced when connection restored. Show offline indicator. Handle conflict resolution (offline attempts uploaded with timestamps). |
| **Prerequisites** | P2-T07 |
| **Duration** | 4 days |
| **Priority** | High |
| **Role** | Mobile |
| **Sprint** | S10 |
| **Schedule Trigger** | Parallel with P2-T09 |
| **Acceptance Criteria** | 50+ problems cached per student; airplane mode → student can still solve; answers stored locally with timestamps; reconnection triggers sync; no duplicate attempts after sync; offline indicator visible |

---

### P2-T11: Flutter Flame Prototype — Interactive Manipulative

| Field | Detail |
|-------|--------|
| **Phase** | 2 |
| **Description** | Build one interactive math manipulative using Flame engine: fraction bar drag-and-drop (student drags fraction pieces to compose a target fraction). Serves as proof-of-concept for Phase 3 interactive content. |
| **Prerequisites** | P2-T07 |
| **Duration** | 4 days |
| **Priority** | Medium |
| **Role** | Mobile |
| **Sprint** | S10 |
| **Schedule Trigger** | Parallel with P2-T09, P2-T10 |
| **Acceptance Criteria** | Fraction bar renders with draggable pieces; student can compose fractions by dragging; correct composition detected; animated success feedback; runs at 60fps on mid-range devices; touch input responsive |

---

### P2-T12: App Store & Play Store Submission

| Field | Detail |
|-------|--------|
| **Phase** | 2 |
| **Description** | Prepare store listings: screenshots (6+ per platform), app descriptions, age ratings (COPPA), privacy policy URL, app review notes explaining kids' app compliance. Submit to Apple App Store and Google Play Store. Budget 2-4 weeks for review cycle. |
| **Prerequisites** | P2-T08, P2-T09, P2-T10 |
| **Duration** | 3 days prep + 14-28 days review |
| **Priority** | Critical |
| **Role** | Mobile + PM |
| **Sprint** | S10 (submit), S11-S12 (review period) |
| **Schedule Trigger** | As soon as app is feature-complete for v1 |
| **Acceptance Criteria** | App submitted to both stores; screenshots uploaded; age rating set correctly; privacy policy links to COPPA-compliant page; app approved on both platforms |
| **Risk Flag** | HIGH RISK — Apple rejection is common for kids' apps. Submit 2+ weeks before beta launch target. Study common rejection reasons. |

---

### P2-T13: Badge System (20+ Types)

| Field | Detail |
|-------|--------|
| **Phase** | 2 |
| **Description** | Implement event-driven badge system: 20+ badge types (e.g., "First Perfect Score", "7-Day Streak", "100 Problems Solved", "Fraction Master", "Speed Demon"). Badge conditions checked via BullMQ on each attempt. Badge `badges_earned` table in PostgreSQL. Badge collection UI for students. Lottie animations for badge unlock. |
| **Prerequisites** | P1-T28, P1-T19 |
| **Duration** | 4 days |
| **Priority** | High |
| **Role** | Backend + Frontend |
| **Sprint** | S11 |
| **Schedule Trigger** | Week 20 start |
| **Acceptance Criteria** | 20+ badge types defined with conditions; badges awarded automatically on meeting conditions; badge collection page shows earned + locked badges; Lottie animation plays on unlock; no duplicate badge awards; badge earned notification displayed |

---

### P2-T14: Missions & Quests System

| Field | Detail |
|-------|--------|
| **Phase** | 2 |
| **Description** | Weekly missions: "Solve 20 geometry problems", "Maintain 5-day streak", "Complete 3 daily challenges". Multi-step progress tracking. Mission rewards (bonus coins). Mission reset weekly. Admin can create custom missions. |
| **Prerequisites** | P2-T13 |
| **Duration** | 3 days |
| **Priority** | High |
| **Role** | Backend + Frontend |
| **Sprint** | S11 |
| **Schedule Trigger** | After P2-T13 |
| **Acceptance Criteria** | 5+ default missions available; progress tracks automatically; rewards awarded on completion; weekly reset via cron; admin can create/edit missions; mission progress visible on student dashboard |
| **Automation** | Weekly mission reset cron (AWS EventBridge) |

---

### P2-T15: Avatar Shop

| Field | Detail |
|-------|--------|
| **Phase** | 2 |
| **Description** | Avatar customization shop: 50+ cosmetic items (hats, outfits, backgrounds, pets) purchasable with coins. Item catalog in MongoDB. Purchase flow with coin deduction. Equipped items displayed on student avatar. Items are cosmetic only (no gameplay advantage). |
| **Prerequisites** | P1-T22, P1-T26, P2-T06 (design assets) |
| **Duration** | 4 days |
| **Priority** | Medium |
| **Role** | Frontend + Design + Backend |
| **Sprint** | S11 |
| **Schedule Trigger** | Parallel with P2-T13, P2-T14 |
| **Acceptance Criteria** | 50+ items in shop; items purchasable with coins; equipped items render on avatar; insufficient coins shows "not enough" message; purchase history tracked; items render on leaderboard avatar |

---

### P2-T16: Anti-Gaming Measures

| Field | Detail |
|-------|--------|
| **Phase** | 2 |
| **Description** | Prevent gaming the system: rate-limit problem attempts (max 1 attempt per 3 seconds), scale points strictly by difficulty (trivial problems give minimal reward), flag accounts with statistically impossible accuracy patterns (100% on hard problems, < 2s per answer), leaderboard uses weighted-correct (not raw volume). |
| **Prerequisites** | P1-T28, P1-T25 |
| **Duration** | 2 days |
| **Priority** | High |
| **Role** | Backend |
| **Sprint** | S11 |
| **Schedule Trigger** | Before beta launch |
| **Acceptance Criteria** | Rate limiter blocks rapid submissions; suspicious patterns flagged in admin dashboard; leaderboard immune to brute-force gaming; points scale correctly by difficulty; automated tests verify anti-gaming rules |

---

### P2-T17: Parent Dashboard — Skill Mastery & Progress

| Field | Detail |
|-------|--------|
| **Phase** | 2 |
| **Description** | Enhance parent dashboard: child's skill mastery visualization (heat map or radar chart by topic), time-spent tracking (daily/weekly), streak history chart, detailed activity log (last 50 actions). Link from parent view to explain what each skill means. |
| **Prerequisites** | P1-T32, P2-T02 |
| **Duration** | 4 days |
| **Priority** | High |
| **Role** | Frontend |
| **Sprint** | S12 |
| **Schedule Trigger** | Week 22 start |
| **Acceptance Criteria** | Skill mastery heat map renders with BKT P(known) data; time tracking shows daily/weekly usage; streak history shows calendar view; activity log paginated; charts use Recharts/Nivo; responsive on tablet |

---

### P2-T18: Parent Weekly Email Digest

| Field | Detail |
|-------|--------|
| **Phase** | 2 |
| **Description** | Automated weekly email to parents summarizing child's activity: problems solved, topics practiced, streak status, skill improvements, comparison to previous week. Use SendGrid + MJML templates. Scheduled Sunday evening. Unsubscribe link. |
| **Prerequisites** | P2-T17, P1-T19 |
| **Duration** | 3 days |
| **Priority** | Medium |
| **Role** | Backend + Frontend (email template) |
| **Sprint** | S12 |
| **Schedule Trigger** | After parent dashboard data available |
| **Acceptance Criteria** | Weekly email sends Sunday 6 PM (configurable); MJML template renders correctly in Gmail, Outlook, Apple Mail; data accurately reflects child's week; unsubscribe link works; SendGrid delivery rate > 95% |
| **Automation** | Weekly cron job (AWS EventBridge → Lambda → SendGrid) |

---

### P2-T19: Stripe Subscription Integration

| Field | Detail |
|-------|--------|
| **Phase** | 2 |
| **Description** | Integrate Stripe: create products (monthly plan, annual plan), 7-day free trial, subscription management (upgrade/downgrade/cancel), webhook handlers for payment events (payment_succeeded, subscription_canceled, invoice.payment_failed), dunning for failed payments. Parent payment portal. Coupon code support. |
| **Prerequisites** | P1-T12 |
| **Duration** | 5 days |
| **Priority** | Critical |
| **Role** | Backend + Frontend |
| **Sprint** | S12 |
| **Schedule Trigger** | Week 22-23 |
| **Acceptance Criteria** | Parent can subscribe (monthly/annual); 7-day trial works; card charge successful; webhook processes payment events; subscription status reflected in user access; cancel flow works; dunning retries failed payments; Stripe dashboard shows correct data |

---

### P2-T20: Paywall Enforcement

| Field | Detail |
|-------|--------|
| **Phase** | 2 |
| **Description** | Implement free tier (3 problems/day, no adaptive engine, no badges) vs. premium (unlimited, full features). Middleware checks subscription status on protected endpoints. Upgrade prompts in UI when free user hits limit. |
| **Prerequisites** | P2-T19 |
| **Duration** | 2 days |
| **Priority** | Critical |
| **Role** | Backend + Frontend |
| **Sprint** | S12 |
| **Schedule Trigger** | After P2-T19 |
| **Acceptance Criteria** | Free users limited to 3 problems/day; premium users unlimited; paywall shows when limit hit; upgrade button links to subscription page; subscription status checked server-side (not just client) |

---

### P2-T21: Device Testing & QA Pass

| Field | Detail |
|-------|--------|
| **Phase** | 2 |
| **Description** | Comprehensive QA pass across all platforms: web (Chrome, Safari, Firefox, Edge), iOS (iPhone SE through 15, iPad), Android (mid-range through flagship, tablets). Test all user flows for each role. Performance verification: animations > 55fps, app startup < 3s, API p95 < 300ms. |
| **Prerequisites** | All P2 functional tasks |
| **Duration** | 5 days |
| **Priority** | Critical |
| **Role** | QA |
| **Sprint** | S12 |
| **Schedule Trigger** | Final week of Phase 2 |
| **Acceptance Criteria** | Zero critical bugs; < 5 high-severity bugs; crash rate < 1% on mobile; animation frame rate > 55fps on mid-range Android; App Store rating target > 4.0 validated by team; all E2E tests passing |

---

### P2-T22: Beta Launch — Pilot Schools + Individual Testers

| Field | Detail |
|-------|--------|
| **Phase** | 2 |
| **Description** | Onboard 3-5 pilot schools + 100 individual beta testers. Provide onboarding guide for teachers. Set up feedback collection (in-app feedback form + weekly check-in calls with pilot teachers). Monitor analytics for engagement and bugs. |
| **Prerequisites** | P2-T12 (app approved), P2-T19 (payments), P2-T21 (QA passed) |
| **Duration** | 5 days (onboarding) + ongoing monitoring |
| **Priority** | Critical |
| **Role** | PM + entire team |
| **Sprint** | S12 |
| **Schedule Trigger** | Final days of Phase 2 |
| **Acceptance Criteria** | 3+ pilot schools onboarded with teachers trained; 100+ individual beta users registered; feedback form functional; first week analytics show > 50% DAU/WAU ratio; no critical production bugs in first 48 hours |

---

## Phase 3 — Analytics, Content Depth & B2B (Oct 20, 2026 — Jan 9, 2027)

**Sprints:** S13-S18 | **Team:** 11 FTE | **Infra budget:** ~$1,919/mo

---

### P3-T01: Skill Gap Heat Map

| Field | Detail |
|-------|--------|
| **Phase** | 3 |
| **Description** | Teacher dashboard visualization: matrix showing class mastery by topic. Rows = students, columns = curriculum topics. Cells colored red/yellow/green based on BKT P(known). Sortable by worst-performing topic. Clickable cells drill into student-topic detail. |
| **Prerequisites** | P2-T02 (BKT data), P1-T31 |
| **Duration** | 4 days |
| **Priority** | High |
| **Role** | Frontend |
| **Sprint** | S13 |
| **Schedule Trigger** | Day 1 of Phase 3 |
| **Acceptance Criteria** | Heat map renders with real BKT data; red/yellow/green thresholds configurable; sort by weakest topic works; click-through to student detail; handles 30+ students without performance issues; responsive on laptop screens |

---

### P3-T02: At-Risk Student Alerts

| Field | Detail |
|-------|--------|
| **Phase** | 3 |
| **Description** | Flag students below performance thresholds: P(known) < 0.3 on 3+ skills, declining engagement (fewer sessions per week), streak broken after 7+ days. Alert appears in teacher dashboard with recommended intervention topics. Email notification to teacher. |
| **Prerequisites** | P3-T01, P2-T02 |
| **Duration** | 3 days |
| **Priority** | High |
| **Role** | Backend + Frontend |
| **Sprint** | S13 |
| **Schedule Trigger** | Parallel with P3-T01 |
| **Acceptance Criteria** | At-risk students flagged automatically; alert shown in teacher dashboard; intervention topics suggested; teacher email notification configurable; false positive rate tested (not flagging students who just started) |
| **Automation** | Daily cron job to compute at-risk students |

---

### P3-T03: Assignment Builder v2

| Field | Detail |
|-------|--------|
| **Phase** | 3 |
| **Description** | Enhanced assignment creation: pick specific instructional objectives (not just topics), set difficulty range (min/max), set deadline, preview generated problem set before assigning, add custom instructions. Support differentiated assignments (different difficulty for different student groups). |
| **Prerequisites** | P1-T30 |
| **Duration** | 4 days |
| **Priority** | High |
| **Role** | Frontend + Backend |
| **Sprint** | S13-S14 |
| **Schedule Trigger** | Week 25-26 |
| **Acceptance Criteria** | Instructional objective picker with curriculum tree; difficulty range slider; preview shows actual problems before assigning; differentiated assignment creates multiple variants; deadline enforcement works |

---

### P3-T04: Class Comparison Reports & Item Analysis

| Field | Detail |
|-------|--------|
| **Phase** | 3 |
| **Description** | Teacher reports: compare class performance to school average and national benchmarks. Item analysis: per-question breakdown (% correct, common wrong answers, average time spent). Grouping of mistakes: cluster students by error pattern. Cross-teacher visibility: browse colleagues' assignments. |
| **Prerequisites** | P3-T01, P1-T30 |
| **Duration** | 5 days |
| **Priority** | High |
| **Role** | Frontend + Backend |
| **Sprint** | S14 |
| **Schedule Trigger** | After P3-T01 |
| **Acceptance Criteria** | Class comparison chart renders with benchmark lines; item analysis shows per-question stats; error clustering identifies 3+ pattern groups; cross-teacher assignment browsing works within same school |

---

### P3-T05: GraphQL API Layer for Dashboards

| Field | Detail |
|-------|--------|
| **Phase** | 3 |
| **Description** | Add Apollo Server GraphQL layer to NestJS for complex dashboard queries. Schema covers: student progress, class analytics, skill mastery, leaderboards, assignment results. Replaces rigid REST endpoints for analytics views. Implement DataLoader for N+1 prevention. |
| **Prerequisites** | P3-T01, P3-T04 |
| **Duration** | 4 days |
| **Priority** | High |
| **Role** | Backend |
| **Sprint** | S14 |
| **Schedule Trigger** | After dashboard data needs are clear |
| **Acceptance Criteria** | GraphQL playground functional at `/graphql`; teacher dashboard queries 50%+ faster than REST equivalent; DataLoader prevents N+1; schema documented; existing REST endpoints still work (backward compatible) |

---

### P3-T06: Event Tracking SDK & Pipeline

| Field | Detail |
|-------|--------|
| **Phase** | 3 |
| **Description** | Instrument web and mobile clients with structured event logging: `problem_attempted`, `badge_earned`, `session_started`, `session_ended`, `leaderboard_viewed`, `assignment_started`, etc. Events → API → BullMQ → PostgreSQL event tables + precomputed aggregation tables. |
| **Prerequisites** | P1-T28 |
| **Duration** | 5 days |
| **Priority** | High |
| **Role** | Backend + Frontend + Mobile |
| **Sprint** | S15 |
| **Schedule Trigger** | Week 28 start |
| **Acceptance Criteria** | 10+ event types tracked; events flow from client → API → queue → storage; aggregation tables precompute DAU/WAU/MAU, topic performance, engagement metrics; event schema documented; batch processing handles 100K events/day |
| **Automation** | Aggregation jobs run hourly via BullMQ scheduled jobs |

---

### P3-T07: Metabase Deployment & Internal Dashboards

| Field | Detail |
|-------|--------|
| **Phase** | 3 |
| **Description** | Deploy Metabase (self-hosted on ECS) connected to PostgreSQL read replica. Create dashboards: DAU/WAU/MAU trends, license utilization, content effectiveness (problem discrimination index), revenue metrics, top/bottom performing content. |
| **Prerequisites** | P3-T06, P1-T05 (infrastructure) |
| **Duration** | 3 days |
| **Priority** | Medium |
| **Role** | DevOps + Backend |
| **Sprint** | S15 |
| **Schedule Trigger** | After event pipeline operational |
| **Acceptance Criteria** | Metabase running on ECS; connected to read replica (not primary); 5+ dashboards created; team can self-serve analytics; page load < 5s for standard dashboards |
| **Automation** | Terraform provisioning for Metabase ECS task |

---

### P3-T08: Automated PDF Reports

| Field | Detail |
|-------|--------|
| **Phase** | 3 |
| **Description** | Weekly student progress report PDF for parents (auto-generated via Puppeteer server-side rendering). Teacher class report: exportable topic mastery matrix PDF. Reports emailed automatically and downloadable from dashboards. |
| **Prerequisites** | P3-T06, P2-T17, P2-T18 |
| **Duration** | 4 days |
| **Priority** | Medium |
| **Role** | Backend + Frontend |
| **Sprint** | S15-S16 |
| **Schedule Trigger** | After event pipeline |
| **Acceptance Criteria** | PDF renders with student data, charts, and progress summary; emailed weekly to parents; teacher can download class report PDF; PDF renders correctly (no layout issues); Lambda function handles PDF generation |
| **Automation** | Weekly cron → Lambda → Puppeteer → S3 → Email |

---

### P3-T09: Content Expansion to 5,000+ Problems

| Field | Detail |
|-------|--------|
| **Phase** | 3 |
| **Description** | Expand to 5,000+ problems with full grade 1-6 coverage. Create video solutions for top 100 most-attempted problem types. Build interactive manipulatives: fraction bars, number lines, geometry shape builder, place value blocks (PixiJS on web, Flame on mobile). Template-based word problem generator. |
| **Prerequisites** | P2-T06 |
| **Duration** | 25 days (ongoing through phase) |
| **Priority** | Critical |
| **Role** | Content (2-3 creators) + Frontend (manipulatives) + Mobile (Flame) |
| **Sprint** | S16-S18 |
| **Schedule Trigger** | Continuous from week 31 |
| **Acceptance Criteria** | 5,000+ problems total; every grade has 600+ problems; 100 video solutions created; 4 interactive manipulative types functional on web + mobile; word problem generator produces valid problems from templates; content quality peer-reviewed |
| **Risk Flag** | HIGH RISK — largest content milestone. Track weekly progress. If behind by week 33, reduce manipulative scope. |

---

### P3-T10: Printable Worksheet Export

| Field | Detail |
|-------|--------|
| **Phase** | 3 |
| **Description** | Teacher can select problems and export as printable PDF worksheet. Include: problem text with math, answer spaces, QR code linking to online version. Student-facing: downloadable practice worksheets by topic. |
| **Prerequisites** | P3-T09, P3-T08 (PDF infrastructure) |
| **Duration** | 3 days |
| **Priority** | Medium |
| **Role** | Backend + Frontend |
| **Sprint** | S17 |
| **Schedule Trigger** | After PDF report infrastructure exists |
| **Acceptance Criteria** | Teacher selects 10-20 problems → PDF generates with math rendering; answer key on separate page; QR codes link to online problems; prints correctly on A4/Letter paper |

---

### P3-T11: School Admin Portal

| Field | Detail |
|-------|--------|
| **Phase** | 3 |
| **Description** | School admin web UI: manage teachers (invite, remove, assign to classes), view school-wide analytics (cross-class comparison, adoption metrics, engagement trends), manage student licenses. Bulk student provisioning: CSV upload (name, class, grade → auto-create accounts + credentials sheet PDF). |
| **Prerequisites** | P1-T29, P1-T12 |
| **Duration** | 5 days |
| **Priority** | Critical |
| **Role** | Frontend + Backend |
| **Sprint** | S17-S18 |
| **Schedule Trigger** | Week 34 start |
| **Acceptance Criteria** | School admin role in RBAC; teacher management CRUD; CSV bulk upload creates 100+ students in < 30s; credentials sheet PDF generated; school-wide analytics dashboard with 5+ metrics; license count tracked and enforced |

---

### P3-T12: Google Classroom Integration

| Field | Detail |
|-------|--------|
| **Phase** | 3 |
| **Description** | OAuth2 integration with Google Classroom API. Import class rosters (students + teachers). Sync assignment grades back to Google Classroom. Teacher can link existing class to Google Classroom with one click. |
| **Prerequisites** | P3-T11, P1-T30 |
| **Duration** | 5 days |
| **Priority** | High |
| **Role** | Backend |
| **Sprint** | S18 |
| **Schedule Trigger** | Week 34-35 |
| **Acceptance Criteria** | OAuth2 flow works with Google; class roster imported correctly; grade sync pushes scores to Google Classroom; link/unlink functionality; handles Google API rate limits gracefully |

---

### P3-T13: Clever SSO Integration

| Field | Detail |
|-------|--------|
| **Phase** | 3 |
| **Description** | Integrate Clever SSO for US school districts. Students and teachers can log in via Clever. Automatic account provisioning from Clever directory. Roster sync. |
| **Prerequisites** | P3-T11 |
| **Duration** | 4 days |
| **Priority** | High |
| **Role** | Backend |
| **Sprint** | S18 |
| **Schedule Trigger** | Parallel with P3-T12 |
| **Acceptance Criteria** | Clever SSO login works; automatic account creation from Clever directory; roster sync matches students to classes; tested with Clever sandbox; handles edge cases (student in multiple schools) |

---

### P3-T14: Site Licensing (Stripe B2B)

| Field | Detail |
|-------|--------|
| **Phase** | 3 |
| **Description** | School-level subscription via Stripe: per-student pricing with volume discounts (100+ students = 20% off, 500+ = 30% off). Invoice generation. School onboarding wizard: step-by-step setup (create school → import teachers → import students → activate licenses). |
| **Prerequisites** | P2-T19, P3-T11 |
| **Duration** | 4 days |
| **Priority** | Critical |
| **Role** | Backend + Frontend |
| **Sprint** | S18 |
| **Schedule Trigger** | After school admin portal |
| **Acceptance Criteria** | School admin can purchase site license; per-student pricing applied; volume discounts calculated correctly; invoice generated; onboarding wizard completes full setup in < 10 minutes; Stripe dashboard reflects school subscriptions |

---

## Phase 4 — ML Adaptive, Social & Hardening (Jan 12 — Apr 3, 2027)

**Sprints:** S19-S24 | **Team:** 11 FTE | **Infra budget:** ~$3,094/mo

*Phase 4 tasks follow the same format. Key task IDs for reference:*

| Task ID | Name | Duration | Role | Sprint | Priority |
|---------|------|----------|------|--------|----------|
| P4-T01 | IRT Data Export & Preprocessing | 3 days | ML Engineer | S19 | Critical |
| P4-T02 | 2PL IRT Model Training (Python) | 5 days | ML Engineer | S19-S20 | Critical |
| P4-T03 | IRT-Based Problem Selection Deployment | 4 days | ML Engineer + Backend | S20 | Critical |
| P4-T04 | A/B Test: IRT vs Rules-Based | 5 days | ML Engineer + Frontend | S20-S21 | Critical |
| P4-T05 | IRT Monitoring Dashboard | 2 days | ML Engineer | S21 | High |
| P4-T06 | Offline Model Retraining Pipeline | 3 days | ML Engineer + DevOps | S21 | High |
| P4-T07 | Peer Challenge (1v1 Math Battles) | 5 days | Backend + Frontend + Mobile | S21-S22 | High |
| P4-T08 | Class Challenges (Teacher-Initiated) | 4 days | Backend + Frontend | S22 | High |
| P4-T09 | Friend System | 3 days | Backend + Frontend + Mobile | S22 | Medium |
| P4-T10 | Collaborative Missions | 3 days | Backend + Frontend | S22 | Medium |
| P4-T11 | Flame "Math Arena" Mini-Game | 5 days | Mobile | S22 | Medium |
| P4-T12 | i18n Framework Setup | 3 days | Frontend + Mobile + Backend | S23 | High |
| P4-T13 | Second Curriculum Market Content | 15 days | Content + ML Engineer | S23-S24 | Critical |
| P4-T14 | Currency/Pricing Localization | 2 days | Backend | S23 | Medium |
| P4-T15 | Load Testing (50K Concurrent) | 4 days | DevOps + Backend | S23 | Critical |
| P4-T16 | Database Optimization & Read Replicas | 3 days | DevOps + Backend | S23-S24 | High |
| P4-T17 | Mobile Performance Audit | 3 days | Mobile + QA | S24 | High |
| P4-T18 | Third-Party Penetration Test | 10 days (outsourced) | Security firm + DevOps | S24 | Critical |
| P4-T19 | COPPA/PDPA Compliance Audit | 5 days | Legal + PM | S24 | Critical |
| P4-T20 | Accessibility Audit (WCAG 2.1 AA) | 4 days | QA + Frontend | S24 | High |
| P4-T21 | Incident Response Plan | 2 days | Tech Lead + DevOps | S24 | High |

---

## Phase 5 — Growth, AI & Scale (Apr 7 — Oct 1, 2027)

**Sprints:** S25-S36 | **Team:** 11-13 FTE | **Infra budget:** ~$3,059→$11,080/mo

| Task ID | Name | Duration | Role | Sprint | Priority |
|---------|------|----------|------|--------|----------|
| P5-T01 | Content Expansion to 15,000+ | 40 days | Content (3 creators) | S25-S36 | Critical |
| P5-T02 | AI-Generated Hints (LLM) | 5 days | ML Engineer + Backend | S25-S26 | High |
| P5-T03 | Automated Problem Generation (LLM) | 5 days | ML Engineer + Backend | S26-S27 | High |
| P5-T04 | Natural Language Problem Input | 5 days | ML Engineer + Mobile | S27-S28 | Medium |
| P5-T05 | Predictive At-Risk Model | 5 days | ML Engineer | S28-S29 | High |
| P5-T06 | Learning Path Recommendations | 4 days | ML Engineer + Frontend | S29 | Medium |
| P5-T07 | Seasonal Events System ("Math Olympics") | 5 days | Backend + Frontend + Mobile | S30-S31 | High |
| P5-T08 | School Tournament System | 5 days | Backend + Frontend | S31-S32 | High |
| P5-T09 | KooClasses-Style Lesson Progression | 4 days | Backend + Frontend + Mobile | S32 | Medium |
| P5-T10 | Expanded Avatar Shop (200+ items) | 3 days | Design + Frontend + Mobile | S33 | Low |
| P5-T11 | Tablet/Chromebook Optimization | 4 days | Frontend | S33-S34 | High |
| P5-T12 | LTI Integration (Canvas, Schoology) | 5 days | Backend | S34 | High |
| P5-T13 | Third Curriculum Market | 15 days | Content + Backend | S34-S36 | High |
| P5-T14 | Multi-Region Deployment | 5 days | DevOps | S35 | Critical |
| P5-T15 | ECS → EKS Migration (if needed) | 5 days | DevOps | S35-S36 | Medium |
| P5-T16 | Database Sharding Evaluation | 3 days | Backend + DevOps | S36 | Medium |
| P5-T17 | Cost Optimization (RI, CDN tuning) | 3 days | DevOps | S36 | Medium |

---

## Dependency Graph

### Phase 1 Critical Dependencies

```
P1-T01 (Monorepo)
  ├── P1-T02 (Next.js) ──── P1-T08 (Design System) ──── P1-T13 (Auth UI) ──── P1-T18 (Problem Solving UI)
  ├── P1-T03 (NestJS) ────── P1-T10 (Auth Backend) ──── P1-T11 (RBAC) ──── P1-T12 (Users)
  ├── P1-T04 (Docker) ────── P1-T05 (AWS Terraform) ──── P1-T06 (CI/CD) ──── P1-T09 (Sentry)
  └── P1-T07 (Auth0) ──────────────────────────────────── P1-T10 (Auth Backend)

P1-T14 (MongoDB Schema) ── P1-T15 (Admin CMS) ── P1-T16 (Content Seed)
                       └── P1-T17 (KaTeX)

P1-T18 + P1-T19 ──── P1-T20 (Hints) + P1-T21 (Difficulty)
                └──── P1-T22 (Points) ── P1-T23 (XP) ── P1-T24 (Streaks) ── P1-T25 (Leaderboard) ── P1-T28 (Event Bus)

P1-T29 (Teacher Class) ── P1-T30 (Assignments) ── P1-T31 (Progress View)

ALL ──── P1-T33 (E2E Tests) ──── P1-T34 (Staging Deploy)
```

### Parallel Tracks (Phase 1)

| Track | Tasks | Owner |
|-------|-------|-------|
| **Infrastructure** | T01 → T04 → T05 → T06 → T09 | DevOps |
| **Auth & Users** | T07 → T10 → T11 → T12 → T13 | Backend + Frontend |
| **Content Engine** | T14 → T15 → T16 → T17 | Backend + Frontend + Content |
| **Student Experience** | T18 → T19 → T20 → T21 | Frontend + Backend |
| **Gamification** | T22 → T23 → T24 → T25 → T26 → T27 → T28 | Backend + Frontend |
| **Teacher Dashboard** | T29 → T30 → T31 | Frontend + Backend |
| **Design System** | T08 (feeds into T13, T15, T18, T26) | Design + Frontend |

---

## Critical Path Analysis

The **critical path** (longest chain determining minimum project duration):

### Phase 1 Critical Path (12 weeks)
```
P1-T01 (2d) → P1-T03 (2d) → P1-T10 (3d) → P1-T11 (3d) → P1-T12 (3d) → P1-T14 (3d) →
P1-T16 (8d) → P1-T18 (5d) → P1-T19 (2d) → P1-T22 (3d) → P1-T28 (2d) →
P1-T33 (4d) → P1-T34 (2d)
Total: ~42 working days = 8.4 weeks + buffer = 12 weeks ✓
```

**Critical path bottleneck:** P1-T16 (Content Seeding, 8 days) is the longest single task and sits on the critical path. Mitigation: start sourcing content in parallel with CMS development; don't wait for CMS polish.

### Phase 2 Critical Path (12 weeks)
```
P2-T01 (4d) → P2-T02 (5d) → P2-T03 (3d) → P2-T04 (3d) [adaptive engine track]
P2-T07 (3d) → P2-T08 (5d) → P2-T12 (3d + 14-28d review) [mobile track]
P2-T19 (5d) → P2-T20 (2d) → P2-T22 (5d) [payments + beta track]
```
**Mobile app store review (14-28 days)** is the gating bottleneck for Phase 2. Submit early.

---

## Sprint Mapping

### Phase 1 Sprints (S1-S6)

| Sprint | Dates | Tasks | Focus |
|--------|-------|-------|-------|
| **S1** | May 5-16 | P1-T01, T02, T03, T04, T05, T07, T08 (start) | Project scaffolding, infrastructure |
| **S2** | May 19-30 | P1-T05 (finish), T06, T08 (finish), T09, T10, T11 | CI/CD, auth backend, design system |
| **S3** | Jun 2-13 | P1-T12, T13, T14, T15, T16 (start), T17 | Users, content engine, auth UI |
| **S4** | Jun 16-27 | P1-T16 (finish), T18, T19, T20, T21 | Content seeding, problem-solving UX |
| **S5** | Jun 30-Jul 11 | P1-T22, T23, T24, T25, T26, T27, T28 | Gamification |
| **S6** | Jul 14-25 | P1-T29, T30, T31, T32, T33, T34 | Teacher dashboard, testing, deployment |

### Phase 2 Sprints (S7-S12)

| Sprint | Dates | Tasks | Focus |
|--------|-------|-------|-------|
| **S7** | Jul 28-Aug 8 | P2-T01, T05 | Adaptive engine, difficulty seeding |
| **S8** | Aug 11-22 | P2-T02, T03, T04, T05 (finish), T06 (start) | BKT, spaced repetition, content expansion |
| **S9** | Aug 25-Sep 5 | P2-T06 (continue), T07, T08 (start) | Flutter setup, core mobile screens |
| **S10** | Sep 8-19 | P2-T08 (finish), T09, T10, T11, T12 | Mobile gamification, offline, Flame, store submit |
| **S11** | Sep 22-Oct 3 | P2-T13, T14, T15, T16 | Badges, missions, avatar shop, anti-gaming |
| **S12** | Oct 6-17 | P2-T17, T18, T19, T20, T21, T22 | Parent dashboard, payments, QA, beta launch |

### Phase 3 Sprints (S13-S18)

| Sprint | Dates | Tasks | Focus |
|--------|-------|-------|-------|
| **S13** | Oct 20-31 | P3-T01, T02, T03 (start) | Teacher analytics v2 |
| **S14** | Nov 3-14 | P3-T03 (finish), T04, T05 | Reports, GraphQL |
| **S15** | Nov 17-28 | P3-T06, T07, T08 (start) | Event pipeline, Metabase |
| **S16** | Dec 1-12 | P3-T08 (finish), T09 (start), T10 | PDF reports, content expansion, worksheets |
| **S17** | Dec 15-26 | P3-T09 (continue), T11 (start) | Content depth, school admin portal |
| **S18** | Dec 29-Jan 9 | P3-T11 (finish), T12, T13, T14 | SSO integrations, site licensing |

---

## Milestone Checkpoints

| ID | Date | Phase | Milestone | Review Type |
|----|------|-------|-----------|-------------|
| M1.1 | May 16, 2026 | 1 | Infrastructure live, CI/CD green | Tech Lead review |
| M1.2 | May 30, 2026 | 1 | Auth working end-to-end | Tech Lead + PM demo |
| M1.3 | Jun 13, 2026 | 1 | Content pipeline + 500 problems | PM + Content review |
| M1.4 | Jun 27, 2026 | 1 | Student can solve problems E2E | Full team demo |
| M1.5 | Jul 11, 2026 | 1 | Gamification live | Full team demo |
| **M1.6** | **Jul 25, 2026** | **1** | **MVP complete — Phase Gate** | **Tech Lead + PM + stakeholder** |
| M2.1 | Aug 15, 2026 | 2 | Adaptive engine functional | ML + Tech Lead review |
| M2.2 | Aug 29, 2026 | 2 | 2K problems | Content review |
| M2.3 | Sep 12, 2026 | 2 | Mobile app submitted to stores | PM + Mobile review |
| M2.4 | Sep 26, 2026 | 2 | Gamification v2 complete | Full team demo |
| **M2.5** | **Oct 17, 2026** | **2** | **Beta launch — Phase Gate** | **Full team + pilot school feedback** |
| M3.1 | Nov 7, 2026 | 3 | Teacher analytics v2 live | Teacher feedback session |
| M3.2 | Nov 28, 2026 | 3 | Analytics pipeline operational | Tech Lead review |
| M3.3 | Dec 19, 2026 | 3 | 5K problems + manipulatives | Content + PM review |
| **M3.4** | **Jan 9, 2027** | **3** | **B2B ready — Phase Gate** | **First school contract signed** |
| M4.1 | Jan 30, 2027 | 4 | IRT engine deployed + A/B test | ML + Tech Lead review |
| M4.2 | Feb 20, 2027 | 4 | Social features live | Full team demo |
| M4.3 | Mar 7, 2027 | 4 | Second curriculum market | Content + PM review |
| **M4.4** | **Apr 3, 2027** | **4** | **Production hardened — Phase Gate** | **Security audit + load test passed** |
| M5.1 | May 30, 2027 | 5 | 15K problems | Content milestone |
| M5.2 | Jun 27, 2027 | 5 | AI features live | ML + PM review |
| M5.3 | Jul 25, 2027 | 5 | First school tournament | PM + school feedback |
| M5.4 | Sep 5, 2027 | 5 | 50K MAU | Growth review |
| **M5.5** | **Oct 1, 2027** | **5** | **Mature platform — Project complete** | **Full stakeholder review** |

---

## Automation Hooks

| Task | Automation Type | Tool | Trigger |
|------|----------------|------|---------|
| P1-T05 | Infrastructure provisioning | Terraform | Manual apply (first time); `terraform plan` in CI on PR |
| P1-T06 | CI/CD pipeline | GitHub Actions | Every PR (lint/test), merge to main (deploy staging), release tag (deploy prod) |
| P1-T09 | Error tracking | Sentry SDK | Automatic on every exception |
| P1-T25 | Leaderboard weekly reset | BullMQ scheduled / EventBridge | Sunday midnight cron |
| P1-T27 | Daily challenge rotation | EventBridge → Lambda | Daily midnight cron |
| P1-T28 | Gamification event processing | BullMQ | Triggered on every attempt |
| P2-T07 | API client codegen (Dart) | OpenAPI Generator | CI runs on backend spec change |
| P2-T18 | Parent weekly digest email | EventBridge → Lambda → SendGrid | Sunday 6 PM cron |
| P3-T02 | At-risk student computation | BullMQ scheduled | Daily 2 AM cron |
| P3-T06 | Analytics aggregation | BullMQ scheduled | Hourly cron |
| P3-T07 | Metabase deployment | Terraform | IaC provisioning |
| P3-T08 | PDF report generation | EventBridge → Lambda → Puppeteer | Weekly cron + on-demand |
| P4-T06 | IRT model retraining | AWS Step Functions / Airflow | Weekly cron (Python pipeline) |
| P4-T15 | Load testing | k6 / Artillery | Triggered manually + nightly in staging |
| P5-T14 | Multi-region deployment | Terraform | IaC with multi-region modules |
| P5-T17 | Cost optimization alerts | AWS Budgets | Monthly budget threshold alerts |

---

## Risk Flags & Buffer Recommendations

| Task | Risk | Likelihood | Buffer |
|------|------|-----------|--------|
| **P1-T16** | Content seeding is the #1 bottleneck — 500 problems is ambitious in 8 days | HIGH | +5 days; start sourcing open-source content on Day 1 of project, not Week 5 |
| **P2-T06** | Expanding to 2,000 problems requires 1-2 dedicated content creators hired and productive | HIGH | +10 days; begin recruiting content creators in Phase 1 Week 4 |
| **P2-T12** | App Store rejection for kids' apps (COPPA, IAP rules) | MEDIUM | +14 days; submit 2 weeks before target; study Apple's kids' app guidelines |
| **P2-T19** | Stripe + App Store IAP dual billing complexity | MEDIUM | +3 days; steer web signups to avoid IAP initially |
| **P3-T09** | 5,000 problems is a massive content effort | HIGH | +15 days; track weekly content velocity; reduce scope to 3,500 if behind by S17 |
| **P3-T12, T13** | Google Classroom / Clever API integration complexity | MEDIUM | +5 days; start with sandbox testing in S17, not S18 |
| **P4-T13** | Second curriculum market content needs local educator review | MEDIUM | +10 days; engage local educator consultant by start of Phase 4 |
| **P4-T18** | Penetration test findings may require significant remediation | MEDIUM | +10 days; don't ship new features in final 2 weeks of Phase 4 |
| **P5-T02, T03** | LLM costs may be prohibitive at scale | HIGH | Set per-student daily AI caps; cache common responses; budget $200-1000/mo initially |

### Recommended Phase Buffers

| Phase | Working Days | Buffer Days | Total | Buffer % |
|-------|-------------|-------------|-------|----------|
| Phase 1 | 60 | 0 (tight, but all critical) | 60 | 0% — offset by parallel tracks |
| Phase 2 | 60 | 5 (App Store review uncertainty) | 65 | 8% |
| Phase 3 | 60 | 8 (content + integration risk) | 68 | 13% |
| Phase 4 | 60 | 10 (pentest + localization) | 70 | 17% |
| Phase 5 | 120 | 15 (AI cost + scaling unknowns) | 135 | 12% |

---

## Infrastructure Budget Per Phase

| Phase | Duration | Monthly Ops Cost | Phase Total | Key Cost Drivers |
|-------|----------|-----------------|-------------|------------------|
| **1** | 3 mo | $576 | $1,728 | AWS (Fargate, RDS, Redis), COPPA legal, GitHub |
| **2** | 3 mo | $770 | $2,311 | + MongoDB Atlas upgrade, SendGrid, Apple Developer, Stripe fees |
| **3** | 3 mo | $1,919 | $5,757 | + RDS read replica, Redis upgrade, Metabase, Sentry paid, WAF, Snyk |
| **4** | 3 mo | $3,094 | $9,282 | + Datadog APM, penetration test, larger compute, increased Stripe fees |
| **5** | 6 mo | $3,059→$11,080 | $42,417 | + LLM API costs, multi-region, scale-up across all services |
| **Total** | **18 mo** | | **$61,495** | Server/platform ops only (excludes salaries) |

---

## Task Count Summary

| Phase | Critical | High | Medium | Low | Total |
|-------|----------|------|--------|-----|-------|
| Phase 1 | 14 | 13 | 7 | 0 | 34 |
| Phase 2 | 7 | 9 | 4 | 2 | 22 |
| Phase 3 | 3 | 7 | 3 | 1 | 14 |
| Phase 4 | 6 | 9 | 5 | 1 | 21 |
| Phase 5 | 3 | 7 | 5 | 2 | 17 |
| **Total** | **33** | **45** | **24** | **6** | **108** |

---

*This document is designed to be directly importable into project management tools (Jira, Linear, Asana). Each task includes all fields needed for a ticket: ID, title, description, acceptance criteria, priority, assignee role, dependencies, sprint assignment, and estimated duration.*
