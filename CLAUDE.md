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
| `README.md` | Master navigation guide — start here |
| `koobits_development_plan.md` | 18-month execution plan (5 phases, 36 sprints) |
| `koobits_scheduled_task_plan.md` | 108 Jira-ready tickets with acceptance criteria |
| `koobits_tech_stack_and_timeline.md` | Full architecture reference |
| `scheduler_composition_design.md` | FSRS + BKT blended scheduler design |
| `koobits_curriculum_package.md` | Content taxonomy and problem specs |
| `koobits_design_brief.md` | UI/UX design guidance |
| `koobits_legal_compliance_package.md` | COPPA, GDPR-K, CCPA compliance |
| `koobits_openapi.yaml` | REST API spec |
| `koobits_budget_estimation.md` | Infra cost by MAU scale |
| `koobits_procurement_checklist.md` | Pre-coding procurement checklist |
| `koobits_handoff_readiness_audit.md` | Handoff readiness audit |
| `koobits_product_analysis.md` | Competitive analysis |

---

## Sprint Structure

- **18 months total, 36 sprints** (2 weeks each)
- Phase 1 (Sprints 1-6): Foundation & MVP — May–Jul 2026
- Phase 2 (Sprints 7-12): Adaptive Engine + Mobile — Jul–Oct 2026
- Phase 3 (Sprints 13-18): Analytics & B2B — Oct 2026–Jan 2027
- Phase 4 (Sprints 19-24): IRT + Social + Security — Jan–Apr 2027
- Phase 5 (Sprints 25-36): AI + Scale + Growth — Apr–Oct 2027

**Current sprint state** is tracked in `sprint_tracker/current_sprint.md`.
**Sprint history** is in `sprint_tracker/history/`.

---

## Agent Roles

Three autonomous agents operate on this repo on a recurring schedule:

### 1. PM Agent (`agents/pm_agent.md`)
- Runs every **Monday (sprint start)** and **Friday (sprint end)**
- Reads `sprint_tracker/current_sprint.md` and git log
- Writes sprint plan or retrospective
- Files are in `sprint_tracker/history/sprint_NN_plan.md` and `sprint_tracker/history/sprint_NN_retro.md`

### 2. QC Agent (`agents/qc_agent.md`)
- Runs every **Friday**
- Reviews code merged since last sprint against acceptance criteria in `koobits_scheduled_task_plan.md`
- Writes QC report to `sprint_tracker/history/sprint_NN_qc.md`
- Can flag blockers that PM agent uses next Monday

### 3. Implementation Agent (`agents/implementation_agent.md`)
- Runs **daily (weekdays)**
- Picks up the top in-progress task from `sprint_tracker/current_sprint.md`
- Implements code, writes tests, commits
- Updates task status in `sprint_tracker/current_sprint.md`

---

## Tech Stack (summary for agents)

- **Web:** Next.js 15 + React 19 + TypeScript + Tailwind + shadcn/ui
- **Mobile:** Flutter + Dart + Riverpod + Rive + Flame
- **Backend:** NestJS (modular monolith) + TypeScript
- **DB:** PostgreSQL 16 (Prisma) + MongoDB Atlas + Redis 7
- **Auth:** Auth0 (COPPA-compliant)
- **Queue:** BullMQ
- **CI/CD:** GitHub Actions + Turborepo
- **Infra:** AWS ECS Fargate → EKS, Terraform

---

## Key Architecture Decisions (locked)

- Flutter over React Native (Impeller GPU renderer + Flame game engine are decisive)
- Modular monolith (not microservices) for MVP; extract Content + Analytics in Phase 3+
- FSRS-4.5 (not SM-2) — 20-30% fewer reviews at 90% retention
- Blended scheduler: Strategy C+D (FSRS urgency + BKT urgency + novelty bonus + mood-gated weights)
- No email collection from under-13 (COPPA hard requirement)

---

## Environment Constraints

- **No dotnet CLI from WSL** — .NET tooling runs on Windows only
- Use `gh` CLI for all GitHub operations
- All agent outputs must be written as markdown files in `sprint_tracker/`
