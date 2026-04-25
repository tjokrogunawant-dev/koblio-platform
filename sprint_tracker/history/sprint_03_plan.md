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

## Mid-Sprint Note — 2026-04-25 (Saturday, Day 4 Checkpoint)

*Written by PM Agent — Day 4 of 10 working days. 3 working days completed (Apr 22, 23, 24). 5 working days remain (Apr 27–May 1). Next implementation window opens Monday 2026-04-28.*

> **Note:** `koblio_mvp_roadmap.md` referenced in project instructions is not present in the repository. Assessment proceeds against `koobits_scheduled_task_plan.md` (acceptance criteria) and `koobits_development_plan.md` (phase gate criteria). No sprint scope changes result from this gap.

---

### Implementation Velocity Alert — ZERO COMMITS SINCE DAY 2

**git log shows no implementation commits after `acabf47` (2026-04-22, P1-T10).** The Day 2 mid-sprint note (2026-04-23) explicitly directed the Implementation Agent to start P1-T11, P1-T14, and P1-T09 immediately. None have been committed as of this checkpoint.

| Expected by End of Day 3 | Status | Assessment |
|---|---|---|
| P1-T11 (RBAC, est. 2 days) — start Day 2, complete Day 4 | **NOT STARTED** | 2 days behind |
| P1-T09 (Sentry, est. 1 day) — start Day 1 | **NOT STARTED** | 3 days behind |
| P1-T17 (KaTeX, est. 2 days) — start Day 1–2 | **NOT STARTED** | 2–3 days behind |
| P1-T14 (MongoDB schema, est. 3 days) — start Day 3 | **NOT STARTED** | On the edge; Day 5 is the latest viable start |

This is a velocity gap, not a blocker — no new environmental blockers are confirmed. The most likely cause is Implementation Agent inactivity over Days 2–3. If the agent resumes Monday (Day 4), the sprint is still recoverable for P0 tasks.

---

### Revised Task Status Snapshot

| Task ID | Title | Priority | Status | Updated Assessment |
|---|---|---|---|---|
| P1-T10 | Auth Module — Parent & Teacher Registration endpoints | P0 | ✅ done | Complete. Commit `acabf47`. |
| P1-T11 | Auth Module — Student Login & RBAC enforcement | P0 | pending | **BEHIND** — should have started Day 2. Must start Day 4 (Mon Apr 27). Latest viable completion: Day 6 (Apr 29). |
| P1-T14 | MongoDB Problem Document Schema & API | P0 | pending | **AT RISK** — start no later than Day 4. 3-day estimate means completion by Day 7 at best (Apr 30). |
| P1-T09 | Sentry Error Tracking Setup | P2 | pending | **OVERDUE start** — 1-day effort; absorb on Day 4 before P1-T11 work begins. No blockers. |
| P1-T17 | KaTeX Integration — Web Math Rendering | P1 | pending | **BEHIND** — 2-day effort, still feasible Days 4–5 if started Monday. |
| P1-T12 | User Module — Parent-Child Linking & School Association | P0 | pending | Blocked until P1-T11 done. If P1-T11 completes Day 6, P1-T12 must compress to 2 days (Days 6–7). |
| P1-T13 | Auth Frontend — Login & Registration Pages | P0 | pending | Blocked until P1-T11 done. Days 7–9 plan intact; compresses to Days 7–8. Sprint carry-over likely. |
| P1-T15 | Admin CMS for Problem Authoring | P1 | pending | Stretch goal. Carry to Sprint 04 confirmed — do not start this sprint. |
| P1-T04 | Docker Compose Local Dev Environment | P0 | HOLD/BLOCKED | No change. Docker runtime unavailable. |
| P1-T03 | Terraform + AWS ECS Fargate | P0 | HOLD/BLOCKED | **6 days to hard deadline (2026-05-01 = last working day of Sprint 03).** |

---

### Blocker Escalation — AWS Credentials: CRITICAL (6 Days to Deadline)

P1-T03 hard deadline is **2026-05-01**, which falls on the **last working day of Sprint 03**. Status unchanged from Day 2: AWS IAM credentials not provisioned.

- If credentials arrive by May 1: P1-T03 can be attempted as a last-day task (low confidence of completion within Sprint 03).
- If credentials do not arrive by May 1: P1-T03 carries to Sprint 04 and `PHASE_GATE_RISK.md` must be updated to **HIGH**.
- **Action required (human — PM/Sponsor):** Confirm AWS credential provisioning status before end of business Monday April 27.

---

### Recovery Plan for Remaining 5 Working Days

**Monday Apr 27 (Day 4):**
1. P1-T09 (Sentry) — complete in first half of day. 1-day effort, zero blockers. This has been deferred 3 days and must close today.
2. Start P1-T11 (RBAC) — second half of day. Use same `@testcontainers/postgresql` pattern as P1-T10.
3. Start P1-T17 (KaTeX) in parallel if second engineer capacity available — otherwise queue for Day 5.

**Tuesday Apr 28 (Day 5):**
1. P1-T11 complete — push and merge by end of day.
2. Start P1-T14 (MongoDB Atlas schema) — this is now the latest viable start date.
3. P1-T17 complete — `<MathExpression>` component merged.

**Wednesday Apr 29 (Day 6):**
1. P1-T12 start — depends on P1-T11 (done). 3-day estimate compresses to 2 days.
2. P1-T14 ongoing.

**Thursday Apr 30 (Day 7):**
1. P1-T12 complete.
2. P1-T14 complete — MongoDB Atlas CRUD API merged.

**Friday May 1 (Day 8 — Sprint End + AWS Deadline):**
1. P1-T13 start/compress — aim for partial auth frontend (registration flow at minimum).
2. Attempt P1-T03 only if AWS credentials arrive.
3. Sprint retro evidence collection.

**Expected Sprint 03 Outcomes (revised):**

| Task | Forecast | Notes |
|---|---|---|
| P1-T09 Sentry | ✅ Complete by Day 4 | 1-day, zero blockers |
| P1-T17 KaTeX | ✅ Complete by Day 5 | 2-day, zero blockers |
| P1-T10 Auth reg endpoints | ✅ Done | Complete |
| P1-T11 Student RBAC | ✅ Complete by Day 5 | Achievable if started Day 4 |
| P1-T14 MongoDB schema | ✅ Complete by Day 7 | Tight — no room for slippage |
| P1-T12 Parent-child linking | ⚠️ Complete by Day 7 — compressed | Depends on P1-T11 Day 5 |
| P1-T13 Auth frontend | ⚠️ Partial — carry to Sprint 04 | Days 8–9 insufficient for full flow |
| P1-T15 Admin CMS | ❌ Carry to Sprint 04 | Stretch goal, confirmed carry |
| P1-T03 Terraform | ❌ Carry to Sprint 04 | AWS credentials unprovisioned |

---

### Sprint Health Assessment

**Overall sprint health: AT RISK** (velocity gap Days 2–3; recoverable if implementation resumes Day 4 without further delay).

- P0 core tasks (P1-T11, P1-T14) remain achievable within the sprint window if work restarts Monday.
- P1-T12 (Parent-child linking) is at high risk of partial carry-over.
- P1-T13 (Auth frontend) will likely carry to Sprint 04 at minimum for E2E testing.
- AWS deadline pressure on May 1 has not yet been resolved — escalation remains urgent.
