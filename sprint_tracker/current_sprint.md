# Current Sprint State

**Sprint:** 03  
**Phase:** 1 — Foundation & MVP  
**Start:** 2026-04-22  
**End:** 2026-05-02  
**Sprint Goal:** Complete auth for all user types and wire up the auth frontend. This closes Section 1 of the revised MVP roadmap (`koblio_mvp_roadmap.md`) and unblocks the content pipeline in Sprint 04.

---

## Roadmap Context

The project is now following `koblio_mvp_roadmap.md` (revised 2026-04-23). Key changes from the original plan:

- **Web-only until Trial Gate 2** — Flutter/Android resumes in Sprint 11+
- **PostgreSQL JSONB replaces MongoDB** for Sprint 04 content pipeline — no Atlas credentials needed
- **No Redis until Section 9** — streaks and leaderboards run on PostgreSQL for MVP
- **No AWS/Terraform until Section 9** — deploy to Railway at Trial Gate 1 (~Jun 27)
- **Credentials are never blockers** — see the credential map in `koblio_mvp_roadmap.md`

---

## Active Tasks

None — all Sprint 03 tasks complete. Section 1 closed.

---

## On Hold (Intentionally deferred — not blockers)

| Task ID | Title | Deferred To | Reason |
|---|---|---|---|
| P1-T14 (MongoDB) | MongoDB Problem Document Schema | Sprint 04 (as JSONB) | Replaced by PostgreSQL JSONB approach — no Atlas credentials needed for MVP |
| P1-T15 | Admin CMS for Problem Authoring | Section 6 (Sprint 10) | Seed problems via JSON files for MVP; CMS needed only when non-devs author content |
| P1-T04 | Docker Compose Local Dev Environment | Nice-to-have | Use Neon + Docker Desktop on Windows; not blocking any work |
| P1-T05 (AWS Terraform) | Provision AWS Staging Environment | Section 9 (Sprint 19+) | Deploy to Railway at Trial Gate 1; AWS needed only at 5K+ MAU |

---

## Completed (All Sprints)

| Task ID | Title | Sprint | Commit |
|---|---|---|---|
| P1-T01 | Initialize Turborepo Monorepo | S01 | `e81a0d8` |
| P1-T02 | GitHub Actions CI Pipeline | S01 | `ed0943d` |
| P1-T04* | Auth0 JWT + RBAC Guards + COPPA roles | S01 | `0e372b3` |
| P1-T05* | Prisma Schema + Core API Endpoints | S01 | `f536c19` |
| P1-T06* | NestJS API Bootstrap (helmet, rate limiting) | S01 | `a94b3e9` |
| P1-T07* | Next.js 15 Web App + Teacher Dashboard Shell | S01 | `e164ac6` |
| P1-T08 | Design System Foundations (10 components, @koblio/ui) | S02 | `b32e2bf` |
| P1-T08† | Flutter App Shell (GoRouter, Riverpod, Dio) | S02 | `a85d6fd` |
| P1-T10 | Auth Module — Parent & Teacher Registration | S03 | `acabf47` |
| P1-T11 | Auth Module — Student Login & RBAC enforcement | S03 | `d864978` |
| P1-T09 | Sentry Error Tracking Setup (web + API) | S03 | `9ce700e` |
| P1-T17 | KaTeX Integration — Web Math Rendering | S03 | `9ce700e` |
| P1-T12 | Parent-Child Linking & School Association | S03 | `4b2767d` |
| P1-T13 | Auth Frontend — Login & Registration Pages | S03 | `96bd921` |
| P1-T14r | Problem Schema (JSONB) in Prisma | S04 | `7b3a063` |
| P1-T14a | Problem API (GET /problems, filters, pagination) | S04 | `7b3a063` |
| P1-T14s | Seed 50 Math Problems (Grades 1-3) | S04 | `ff736f2` |

---

## Sprint Blockers

None. All active tasks are unblocked. Work continues regardless of external credentials.

---

## Up Next (Sprint 04 — May 5–16)

Section 2 of `koblio_mvp_roadmap.md`:

- Problem schema in Prisma (`problems` table with `content JSONB`)
- Seed 50 math problems (grades 1–3, US Common Core, MCQ + fill-in-blank)
- Problem API endpoints (`GET /problems`, `GET /problems/:id`)
- KaTeX rendering confirmed working end-to-end

No new external services required.

---

## Last Updated
2026-04-27 by PM — Sprint 04 complete. All Section 2 tasks done. Moving to Sprint 05 (Section 3) immediately.
