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

## Mid-Sprint Note — 2026-04-26 (Sunday, Day 5 of 10)

*Written by PM Agent — Sprint 03, end-of-week-1 check-in. Today is Day 5; Monday 2026-04-27 opens the final 5 working days of the sprint.*

### Implementation Progress Since Day 2

**Zero implementation commits since the Day 2 mid-sprint note (2026-04-23).** The last implementation commit (`acabf47`, P1-T10) was on sprint Day 1. Three working days (Wed–Fri, 2026-04-23 to 2026-04-25) passed without any code merged to `main-olWq8`. This is a **yellow flag**: four tasks (P1-T09, P1-T17, P1-T11, P1-T14) were unblocked as of Day 2 and should have started or completed by now. If P1-T11 and P1-T14 do not both start on Day 6 (Monday), P0 task completion becomes at risk.

### Task Status Snapshot (Day 5)

| Task ID | Title | Priority | Status | Assessment |
|---|---|---|---|---|
| P1-T10 | Auth Module — Parent & Teacher Registration endpoints | P0 | ✅ done | Complete since Day 1. No change. |
| P1-T11 | Auth Module — Student Login & RBAC enforcement | P0 | pending | **Unblocked since Day 1 (P1-T10 done). No commit yet — must start Day 6 (Monday) without delay.** |
| P1-T14 | MongoDB Problem Document Schema & API | P0 | pending | **No blocker. No commit yet — must start Day 6 in parallel with P1-T11.** |
| P1-T12 | User Module — Parent-Child Linking & School Association | P0 | pending | Blocked until P1-T11 done. Earliest start: Day 8 (Wed Apr 29). If P1-T11 slips, P1-T12 carries to Sprint 04. |
| P1-T13 | Auth Frontend — Login & Registration Pages | P0 | pending | Blocked until P1-T11 done. Est. 4 days → starting Day 8 puts finish at Day 12, beyond sprint boundary. **P1-T13 is Sprint 04 carry-over risk.** |
| P1-T09 | Sentry Error Tracking Setup | P2 | pending | No blocker. 1-day effort. Should have been Day 1. **Complete on Day 6 morning before starting P1-T11.** |
| P1-T17 | KaTeX Integration — Web Math Rendering | P1 | pending | No blocker. 2-day effort. Run in parallel with auth backend this week. |
| P1-T15 | Admin CMS for Problem Authoring | P1 | pending | Stretch goal. Blocked on P1-T14. Not feasible this sprint given P1-T14 not yet started. **Will carry to Sprint 04.** |
| P1-T04 | Docker Compose Local Dev Environment | P0 | HOLD | Docker runtime unavailable in implementation environment. No change since Sprint 02. |

### Revised Sprint Trajectory (5 Working Days Remain)

Assuming P1-T11 and P1-T14 both start on Monday 2026-04-27:

| Task | Days Remaining | Forecast Completion | Sprint Fit |
|---|---|---|---|
| P1-T09 (Sentry) | 1 | Day 6 (Mon Apr 27) | ✅ Yes |
| P1-T17 (KaTeX) | 2 | Day 7–8 (Tue–Wed) | ✅ Yes |
| P1-T11 (Student login + RBAC) | 2 | Day 7 (Tue Apr 28) | ✅ Yes |
| P1-T14 (MongoDB schema + API) | 3 | Day 8 (Wed Apr 29) | ✅ Yes |
| P1-T12 (Parent-child linking) | 3 | Day 10 (Fri May 1) | ⚠ Tight — P1-T11 must finish on time |
| P1-T13 (Auth frontend) | 4 | Day 12+ | ❌ Carries to Sprint 04 |
| P1-T15 (Admin CMS) | 5 | Not feasible | ❌ Carries to Sprint 04 |

**Realistic P0 completions this sprint:** P1-T10 ✅, P1-T11, P1-T14, P1-T12 (if P1-T11 finishes by Day 7). P1-T13 is a confirmed Sprint 04 carry-over at this point given 4 estimated days and a Day 8 earliest start.

### Unblocked Actions for Implementation Agent — Day 6 (Monday 2026-04-27)

1. **P1-T09 first thing Monday morning** — 1-day, zero blockers. Sentry SDK in NestJS API and Next.js app; DSN from `SENTRY_DSN` env var; source maps uploaded; test error captured. Target: merged before noon.
2. **P1-T11 starts Monday** — Student login with class code; RBAC guards on `parent / teacher / student / admin` roles; refresh token rotation; `@testcontainers/postgresql` for integration tests (same pattern as P1-T10). Wire `role` claim from Auth0 RS256 JWT to NestJS guards. Must be merged by end of Day 7 (Tuesday) to keep P1-T12 on schedule.
3. **P1-T14 starts Monday in parallel** — Set `MONGODB_URI` to Atlas connection string in `.env.example`. Use `@nestjs/mongoose`. Full schema per `koobits_tech_stack_and_timeline.md` (IRT param placeholders, question types, hints, solution, media refs, taxonomy tags, status). CRUD endpoints (`GET /problems`, `POST /problems` admin-only, `PATCH /problems/:id`). Validate against Mongoose schema. Target: merged by end of Day 8 (Wednesday).
4. **P1-T17 in parallel (Days 6–7)** — `<MathExpression latex="..." />` in `packages/ui`. Inline and block modes. Graceful fallback on malformed LaTeX. 20+ LaTeX expression test coverage.

### HOLD Task Status

| Task ID | Title | Hold Reason | Change |
|---|---|---|---|
| P1-T04 | Docker Compose Local Dev Environment | Docker runtime unavailable in implementation environment | No change. Intentionally deferred per roadmap until Docker-capable environment is provisioned. |

### Sprint Health Assessment

**Overall sprint health: YELLOW — AT RISK**

The zero-commit stretch from Day 2 to Day 5 must be recovered in the final 5 working days. All five achievable P0/P1 tasks (P1-T09, P1-T11, P1-T14, P1-T12, P1-T17) are unblocked or will be unblocked within 2 days. No new technical blockers have emerged. The sprint can still land at 5 of 8 planned task completions (matching the Day 2 trajectory assessment) if the Implementation Agent executes the Day 6 plan above without interruption. P1-T13 and P1-T15 are confirmed Sprint 04 carry-overs.
