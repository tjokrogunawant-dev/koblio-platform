# Koblio Platform — Project Context for Claude Agents

## What Is This Project

Koblio is a gamified adaptive math learning platform for K-6 students (US Common Core, Grades 1-3 MVP). It combines:
- **FSRS-4.5** spaced repetition for card scheduling
- **BKT** (Bayesian Knowledge Tracing) per-skill mastery tracking
- **Mood-gated weight shifts** (FLOW / FRUSTRATED / CONFUSED / BORED) that tune the scheduler in real-time
- Full gamification layer: coins, XP, badges, missions, leaderboards, avatar shop

Target: 10K MAU by month 12, architecture supports 100K+.

---

## Document Index

| Document | Purpose |
|---|---|
| **`PLAN.md`** | **Active plan — phases to 10K MAU. Source of truth for what to build next.** |
| `koblio_openapi.yaml` | REST API spec |
| `doc/` | Archived reference docs (curriculum, legal, original roadmap, scheduler design, etc.) |

---

## Tech Stack

- **Web:** Next.js 15 + React 19 + TypeScript + Tailwind + shadcn/ui
- **Backend:** NestJS (modular monolith) + TypeScript
- **DB:** PostgreSQL 16 (Prisma) — problems stored as JSONB
- **Auth:** Internal bcrypt + HS256 JWT (Auth0 removed in Sprint 19)
- **Queue:** BullMQ (gamification events)
- **CI/CD:** GitHub Actions + Turborepo → Railway auto-deploy on push to `main`
- **Mobile:** Flutter (Dart) — parked until Phase 5 (1K MAU proven)

## Key Decisions

- No payments until 10K MAU — see PLAN.md
- No AWS until 5K+ MAU — Railway is sufficient
- No Redis cluster — single Railway Redis instance is fine
- No CMS — seed problems via JSON files
- No automated agent crons — solo dev + Claude Code implement directly from PLAN.md

## Environment Constraints

- **No dotnet CLI from WSL** — .NET tooling runs on Windows only
- Use `gh` CLI for all GitHub operations
