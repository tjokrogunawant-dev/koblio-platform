# Sprint 03 Plan — 2026-04-22 to 2026-05-02

## Sprint Goal
Unblock the auth endpoint chain via testcontainers-based CI integration testing, deliver KaTeX web math rendering, and initiate the MongoDB problem content pipeline via MongoDB Atlas — clearing all Sprint 02 carry-over P0 items or establishing durable mitigations.

## Phase Context
Phase 1 / Sprint 03 of 36 — Foundation & MVP  
MAU target at phase end: internal only (Phase 1 closes Sprint 06); Phase 2 gate target: 500 beta users

> **Calendar note:** The team is running approximately 6 weeks ahead of the original SPRINT_OVERVIEW calendar (planned Sprint 03 start: 2026-06-01; actual start: 2026-04-22). Sprint 01 delivered 7/8 foundation tasks 2026-04-16–21. Sprint 02 delivered P1-T08 (Design System) and P1-T08 Flutter shell; most Sprint 02 P0 auth tasks remain pending due to the confirmed Docker runtime blocker.

---

## Tasks This Sprint

| Task ID | Title | Owner Role | Priority | Est. Days | Acceptance Criteria |
|---|---|---|---|---|---|
| P1-T09 | Sentry Error Tracking Setup (web + API) | DevOps | P2 | 1 | Sentry SDK initialized in NestJS API and Next.js app; DSN from env var; test error captured in Sentry dashboard; source maps uploaded for both apps; `SENTRY_DSN` added to `.env.example` |
| P1-T17 | KaTeX Integration — Web Math Rendering | Frontend | P1 | 2 | `<MathExpression latex="..." />` renders inline and block math; graceful fallback on malformed LaTeX (shows raw text, no crash); renders in <50ms; tested with 20+ diverse LaTeX expressions from seed content |
| P1-T10 | Auth Module — Parent & Teacher Registration endpoints | Backend | P0 | 3 | `POST /auth/register/parent` and `POST /auth/register/teacher` operational; COPPA consent recorded with timestamp+IP; JWT issued (RS256); integration tests run against testcontainers PostgreSQL in GitHub Actions CI; all acceptance criteria in `koobits_scheduled_task_plan.md` met |
| P1-T11 | Auth Module — Student Login & RBAC enforcement | Backend | P0 | 2 | Student login with class code works; RBAC guards enforce role separation (parent / teacher / student / admin); refresh token rotation; tests pass against testcontainers |
| P1-T14 | MongoDB Problem Document Schema & API | Backend | P0 | 3 | Schema validated against tech stack spec (curriculum taxonomy, IRT params placeholder, question types, hints, solution, media references, tags, status); `GET /problems` filtered + paginated; `POST /problems` admin-only; `PATCH /problems/:id`; validation rejects malformed documents; OpenAPI spec updated; connects to MongoDB Atlas (no local Docker required) |
| P1-T12 | User Module — Parent-Child Linking & School Association | Backend | P0 | 3 | Parent creates child account via API; child linked to parent; teacher creates school + classroom; students enrolled in classroom; consent record stored with timestamp+IP; Prisma migrations run cleanly; FK constraints enforced; depends on P1-T10 + P1-T11 |
| P1-T13 | Auth Frontend — Login & Registration Pages | Frontend | P0 | 4 | Full registration → email verify → login flow works end-to-end; student class-code login works; error states handled (wrong password, duplicate email); responsive (desktop + tablet); Playwright E2E test for happy path; depends on P1-T08 (done) + P1-T10 + P1-T11 |
| P1-T15 | Admin CMS for Problem Authoring | Frontend | P1 | 5 | Admin creates problem with live KaTeX preview; image upload to S3 (pre-signed URLs); curriculum taxonomy selector (nested); hint editor; problem list with search/filter/sort; problems persist in MongoDB Atlas; depends on P1-T14 + P1-T08 (done) — **stretch goal** |

---

## Carry-Over from Sprint 02

| Task ID | Reason Not Done | Decision |
|---|---|---|
| P1-T04 | Docker runtime confirmed unavailable in implementation environment | HOLD — downstream auth tasks unblocked via testcontainers mitigation; `docker-compose up` gate deferred until Docker-capable environment is provisioned |
| P1-T03 (S01) | AWS IAM credentials not provisioned; hard deadline 2026-05-01 | HOLD — escalated to project sponsor; if credentials arrive by 2026-05-01, attempt within Sprint 03; otherwise carry to Sprint 04 |
| P1-T09 | No blocker (deps satisfied); not started in Sprint 02 | RE-INCLUDED as Day-1 task |
| P1-T10 | Blocked by Docker/P1-T04 | RE-INCLUDED with testcontainers mitigation path |
| P1-T11 | Blocked by P1-T10 | RE-INCLUDED with testcontainers mitigation path |
| P1-T13 | Blocked by P1-T10 + P1-T11 | RE-INCLUDED; will complete once auth backend is done |

---

## Risks & Blockers

- **RECURRING BLOCKER — Docker runtime unavailable (escalated):** P1-T04 cannot be executed without Docker. Mitigation adopted for Sprint 03: use `@testcontainers/postgresql` (testcontainers-node) in GitHub Actions CI for PostgreSQL integration tests (P1-T10/T11/T12/T13). MongoDB Atlas (cloud-hosted) used directly for P1-T14/T15 — no local MongoDB container required. This is a mitigation, not a resolution; `docker-compose up` remains a Phase 1 gate criterion.
- **RECURRING BLOCKER — AWS credentials outstanding:** Hard deadline 2026-05-01 (9 days). If credentials do not arrive by this date, P1-T03 carries to Sprint 04 and PHASE_GATE_RISK.md risk level should be elevated to HIGH. Escalate to project sponsor immediately if owner is unconfirmed.
- **QC debt — 5 completed tasks QC-unverified:** P1-T04 (Auth0 JWT), P1-T05 (Prisma), P1-T06 (NestJS), P1-T07 (Next.js), P1-T08 (Design System) remain unverified since `sprint_01_qc_2.md` (2026-04-17). CORS restriction at `apps/api/src/main.ts:8` must be verified or patched before P1-T10 auth endpoints are exposed. QC Agent should run a comprehensive pass before P1-T10 is merged to main.
- **Sprint capacity vs scope:** 8 tasks totalling ~23 estimated days in a 10-working-day sprint. Implementation Agent should execute strictly in priority order (see Notes below). P1-T12, P1-T13, and P1-T15 are expected carry-overs to Sprint 04 if auth backend takes its full estimated time.
- **Phase 1 gate risk — MEDIUM-HIGH:** See `PHASE_GATE_RISK.md`. Working local dev stack and auth endpoints are both at risk if Docker and AWS blockers persist past Sprint 03.

---

## Definition of Done for This Sprint

- [ ] P1-T09 Sentry active in both API and web apps with DSN in `.env.example`
- [ ] P1-T17 `<MathExpression>` component exported from `@koblio/ui` with tests
- [ ] P1-T10 auth registration endpoints passing integration tests in GitHub Actions CI (testcontainers)
- [ ] P1-T11 student login + RBAC passing tests
- [ ] P1-T14 MongoDB problem schema live, connected to Atlas, CRUD API endpoints verified
- [ ] CORS restriction at `apps/api/src/main.ts:8` verified or patched
- [ ] No new P0 open bugs introduced
- [ ] All implemented tasks committed with passing CI

---

## Notes for Implementation Agent

**Execution order (strict priority):**

1. **P1-T09 (Sentry, Day 1):** No blockers. Start immediately Monday morning. Clears observability backlog and gives error visibility for all auth work ahead.

2. **P1-T17 (KaTeX, Days 1–2, parallel with auth backend ramp-up):** Only dependency is P1-T02 (done). Run in parallel with auth setup. The `<MathExpression>` component must be in `packages/ui` (not app-local) — it will be consumed by P1-T15 Admin CMS and P1-T18 Student UI.

3. **P1-T10 (Auth endpoints, Days 2–4):** Use `@testcontainers/postgresql` for integration tests. Add `testcontainers` as a dev dependency in `apps/api`. Tests should spin up a real PostgreSQL container in CI — do not mock the database for integration tests. Ensure `CORS_ALLOWED_ORIGINS` env var gates the CORS config at `main.ts:8` before this endpoint is tested.

4. **P1-T11 (RBAC, Days 4–5):** Directly sequential after P1-T10. Auth0 JWKS endpoint is operational (done in Sprint 01 task P1-T04). Wire RBAC NestJS guards using the `role` claim in the Auth0 JWT.

5. **P1-T14 (MongoDB schema, Days 3–5, parallel with auth backend):** Set `MONGODB_URI` to MongoDB Atlas connection string in `.env.example`. Use Mongoose or the native MongoDB driver (consistent with NestJS `@nestjs/mongoose` in the tech stack). Problem document schema must exactly match the spec in `koobits_tech_stack_and_timeline.md` — do not abbreviate or defer fields.

6. **P1-T12 (User module, Days 6–7):** Can start only after P1-T10 + P1-T11 are merged. The `parent_child_links` and `enrollments` tables extend the Prisma schema from P1-T05 — add new migration, do not modify existing migration.

7. **P1-T13 (Auth Frontend, Days 7–9):** Uses `@koblio/ui` design system (P1-T08, done). Integrate Auth0 React SDK (`@auth0/auth0-react`) for web. Playwright tests run in CI against the dev server; configure `playwright.config.ts` with base URL from env.

8. **P1-T15 (Admin CMS, Days 8–10, stretch):** Only start if P1-T14 is fully merged and verified. This is a stretch goal. If not complete by Sprint 03 end, carry to Sprint 04 as Day-1 task.

9. **Do NOT start P1-T16 (Content Seeding) this sprint.** 8-day task, requires CMS and schema both stable. Primary Sprint 04 work.

10. **Do NOT attempt P1-T03 (Terraform) or P1-T04 (Docker Compose) unless AWS credentials or Docker runtime become available.** Check environment at sprint start; if neither is available, mark both HOLD and proceed with the plan above.

---

## Mid-Sprint Note — 2026-04-23 (Monday, Day 2)

*Written by PM Agent — Sprint 03 is active (Day 2 of 10). This is not a sprint-start boundary; Sprint 03 started 2026-04-22. No new sprint plan is produced today.*

### Task Status Snapshot

| Task ID | Title | Priority | Status | Change Since Plan |
|---|---|---|---|---|
| P1-T10 | Auth Module — Parent & Teacher Registration endpoints | P0 | ✅ done | **Completed Day 1** — commit `acabf47`, 62 unit tests passing. All AC met. |
| P1-T11 | Auth Module — Student Login & RBAC enforcement | P0 | pending | **Now unblocked** — P1-T10 done. Implementation Agent should start P1-T11 today (Day 2). |
| P1-T14 | MongoDB Problem Document Schema & API | P0 | pending | No blocker — MongoDB Atlas ready. Parallel track with P1-T11. |
| P1-T09 | Sentry Error Tracking Setup | P2 | pending | No blocker. Should have started Day 1; start today if not begun. |
| P1-T17 | KaTeX Integration — Web Math Rendering | P1 | pending | No blocker. Parallel with auth backend. |
| P1-T12 | User Module — Parent-Child Linking & School Association | P0 | pending | Blocked until P1-T11 done. On track for Days 6–7. |
| P1-T13 | Auth Frontend — Login & Registration Pages | P0 | pending | Blocked until P1-T11 done. On track for Days 7–9. |
| P1-T15 | Admin CMS for Problem Authoring | P1 | pending | Stretch goal — blocked until P1-T14 done. |
| P1-T04 | Docker Compose Local Dev Environment | P0 | HOLD/BLOCKED | Docker runtime unavailable. No change. |
| P1-T03 | Terraform + AWS ECS Fargate | P0 | HOLD/BLOCKED | AWS credentials not provisioned. **8 days to hard deadline (2026-05-01).** |

### Unblocked Actions for Implementation Agent (Today — Day 2)

1. **Start P1-T11 now** — P1-T10 is done, all dependencies satisfied. Use `@testcontainers/postgresql` for integration tests (same pattern as P1-T10). Wire Auth0 RBAC guards using the `role` claim from the JWT. Target: complete by Day 4.
2. **Start P1-T14 in parallel** — MongoDB Atlas connection string must be set in `.env.example`. Use `@nestjs/mongoose`. Problem document schema must match the full spec in `koobits_tech_stack_and_timeline.md`. Target: complete by Day 5.
3. **Start P1-T09 today if not started** — 1-day effort with no blockers. Sentry DSN via env var in both NestJS API and Next.js app.
4. **Continue P1-T17 in parallel** — KaTeX component in `packages/ui`, not app-local.

### Blocker Alert — AWS Credentials (CRITICAL)

**Deadline: 2026-05-01 — 8 days remaining.**

P1-T03 (Terraform + ECS Fargate) has been blocked since Sprint 01 (first flagged 2026-04-16). The hard deadline established in `PHASE_GATE_RISK.md` is 8 days away. If credentials do not arrive by 2026-05-01:

- P1-T03 will carry into Sprint 04 (planned start: 2026-06-15 in original calendar, but actual execution is running 6 weeks ahead).
- The Phase 1 gate criterion "working local dev stack" will be jeopardized — ECS Fargate is required for any cloud-hosted preview or staging environment.
- **Action required from project sponsor:** Confirm IAM credential provisioning status immediately. PM Agent cannot unblock this — human escalation required.

### Sprint Trajectory Assessment

With P1-T10 done on Day 1, the auth backend chain (P1-T11 → P1-T12 → P1-T13) is running roughly on schedule. Completing all 5 P0 tasks (P1-T10, P1-T11, P1-T12, P1-T13, P1-T14) remains achievable within the 10-day sprint if no new blockers emerge. P1-T15 (CMS) remains a stretch goal and is likely to carry into Sprint 04. Sentry (P1-T09) and KaTeX (P1-T17) should complete within Days 1–3 given their minimal effort estimates.

**Overall sprint health: ON TRACK** (conditional on P1-T11 starting today).

---

## Mid-Sprint Note — 2026-04-26 (Sunday, Day 5)

*Written by PM Agent — Sprint 03, Day 5 of 11 calendar days. 5 working days remain (2026-04-27 through 2026-05-01). This is not a sprint-start boundary; the next sprint starts 2026-05-04.*

### Implementation Stall — No Commits Since Day 2

**No implementation commits have landed since 2026-04-23 (`acabf47` / `fc6cb37`).** The Day-2 mid-sprint note directed the Implementation Agent to begin P1-T11 (Student Login & RBAC), P1-T14 (MongoDB Schema), P1-T09 (Sentry), and P1-T17 (KaTeX) immediately. None of these tasks has a commit as of today. Three working days (April 23 Thu, April 24 Fri, and today Sunday Apr 26 rest day) have elapsed without progress on 4 unblocked tasks.

This stall is the primary sprint risk. The auth backend chain cannot advance until P1-T11 is delivered, which directly gates P1-T12 (Parent-Child Linking) and P1-T13 (Auth Frontend). With 5 working days remaining, the original plan estimated:
- P1-T11 complete by Day 4 (now already Day 5 — it has not started)
- P1-T14 complete by Day 5 (not started)
- P1-T09 + P1-T17 complete by Day 3 (not started; these are 1–2 day tasks)

### Revised Task Status Snapshot

| Task ID | Title | Priority | Status | Assessment |
|---|---|---|---|---|
| P1-T10 | Auth Module — Parent & Teacher Registration endpoints | P0 | ✅ done | Complete. Commit `acabf47`. |
| P1-T11 | Auth Module — Student Login & RBAC enforcement | P0 | pending | **NOT STARTED** — was due by Day 4. Must begin Day 6 (2026-04-27) first thing. |
| P1-T14 | MongoDB Problem Document Schema & API | P0 | pending | **NOT STARTED** — no blocker. Must run in parallel with P1-T11 starting Day 6. |
| P1-T09 | Sentry Error Tracking Setup | P2 | pending | **NOT STARTED** — 1-day task with no blockers. Start Day 6 in parallel. |
| P1-T17 | KaTeX Integration — Web Math Rendering | P1 | pending | **NOT STARTED** — 2-day task with no blockers. Start Day 6 in parallel. |
| P1-T12 | User Module — Parent-Child Linking & School Association | P0 | pending | Blocked until P1-T11 done. Slipping — now targeting Days 7–8 at best. |
| P1-T13 | Auth Frontend — Login & Registration Pages | P0 | pending | Blocked until P1-T11 done. Now a stretch goal risk alongside P1-T15. |
| P1-T15 | Admin CMS for Problem Authoring | P1 | pending | Stretch goal — blocked until P1-T14 done. Carry to Sprint 04 is likely. |
| P1-T04 | Docker Compose Local Dev Environment | P0 | HOLD/BLOCKED | No change. Docker runtime unavailable. |
| P1-T03 | Terraform + AWS ECS Fargate | P0 | HOLD/BLOCKED | No change. **5 days to hard deadline (2026-05-01).** |

### Priority Order for Implementation Agent — Day 6 (2026-04-27, Monday)

The 5 remaining working days must be used at maximum throughput. Execute strictly in this order:

1. **P1-T09 (Sentry) — Day 6 morning, ~4 hours.** 1-day task, zero blockers. Complete it first to clear the backlog and establish observability before auth work creates complexity.
2. **P1-T11 (Student Login + RBAC) — Days 6–7.** Highest P0 priority. Pattern identical to P1-T10: `@testcontainers/postgresql`, Auth0 RBAC guards using the `role` claim. Refresh token rotation. Target: merged by end of Day 7 (2026-04-28).
3. **P1-T14 (MongoDB Schema) — Days 6–7, parallel with P1-T11.** Connect to MongoDB Atlas. Use `@nestjs/mongoose`. Full problem document schema from `koobits_tech_stack_and_timeline.md` — no field deferral. Target: merged by end of Day 7.
4. **P1-T17 (KaTeX) — Day 6, afternoon parallel.** 2-day effort. `<MathExpression>` in `packages/ui`. Target: merged Day 7.
5. **P1-T12 (Parent-Child Linking) — Day 8 (2026-04-29).** Can start only after P1-T11 merged. New Prisma migration — do not modify existing migrations. Target: merged Day 9.
6. **P1-T13 (Auth Frontend) — Days 9–10 (2026-04-30, 2026-05-01).** Auth0 React SDK (`@auth0/auth0-react`). Playwright E2E tests in CI. Target: merged Day 10 — this is now a compressed timeline.
7. **P1-T15 (Admin CMS) — stretch, do not start unless P1-T14 merged by Day 7.** Carry to Sprint 04 if not started by Day 8.

### Blocker Alert — AWS Credentials (CRITICAL — 5 Days to Deadline)

**Hard deadline: 2026-05-01. 5 days remaining.**

P1-T03 (Terraform + ECS Fargate) has been HOLD/BLOCKED since Sprint 01 (first flagged 2026-04-16). This deadline has been in `PHASE_GATE_RISK.md` for 9 days with no resolution recorded. If credentials are not confirmed by 2026-05-01:

- P1-T03 must be marked BLOCKED and carried to Sprint 04 (projected actual start: 2026-05-04).
- The Phase 1 Trial Gate criterion for a cloud-hosted staging environment will be deferred to Sprint 04 at earliest.
- **Immediate action required from project sponsor:** Confirm AWS IAM credential provisioning status. PM Agent cannot unblock this — human escalation is the only path to resolution.

### Sprint Health Re-Assessment

The implementation stall (no commits Apr 23–26) has shifted the sprint from ON TRACK to **AT RISK**:

- P1-T11 is 1–2 days behind schedule (was target Day 4, now Day 5 has passed with no start)
- Completing P1-T12 and P1-T13 within the sprint is now a compressed but feasible scenario contingent on P1-T11 merging by Day 7
- P1-T13 (Auth Frontend, 4-day estimate) is the highest carry-over risk — if P1-T11 doesn't merge by Day 7, P1-T13 is guaranteed to carry to Sprint 04

**Overall sprint health: AT RISK** — no implementation commits in 3 days; immediate ramp-up required on Day 6 (2026-04-27).
