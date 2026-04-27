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
| **`koblio_mvp_roadmap.md`** | **Active roadmap — web-first MVP, revised 2026-04-23. Use this for sprint planning.** |
| `koblio_development_plan.md` | Original 18-month plan (5 phases) — reference for Phase 3+ features only |
| `koblio_scheduled_task_plan.md` | Original 108-ticket plan — reference for acceptance criteria, use roadmap for ordering |
| `koblio_tech_stack_and_timeline.md` | Full architecture reference |
| `scheduler_composition_design.md` | FSRS + BKT blended scheduler design (Section 8 of MVP roadmap) |
| `koblio_curriculum_package.md` | Content taxonomy and problem specs |
| `koblio_design_brief.md` | UI/UX design guidance |
| `koblio_legal_compliance_package.md` | COPPA, GDPR-K, CCPA compliance |
| `koblio_openapi.yaml` | REST API spec |
| `koblio_budget_estimation.md` | Infra cost by MAU scale |
| `koblio_procurement_checklist.md` | Pre-coding procurement checklist |
| `koblio_handoff_readiness_audit.md` | Handoff readiness audit |
| `koblio_product_analysis.md` | Competitive analysis |

---

## Sprint Structure (Revised)

The active roadmap is `koblio_mvp_roadmap.md`. Summary:

- **Sections 1–5** (S03–S07, now–Jun 27): Web MVP core — auth, content, problem-solving, gamification v1, teacher dashboard
- **Trial Gate 1** (~Jun 27): Internal alpha — deploy to Railway, invite real families
- **Section 6** (S08–S10, Jul–Aug): Growth features — badges, parent dashboard, Stripe payments
- **Trial Gate 2** (~Aug): Closed beta — pilot schools + 100 beta testers
- **Section 7** (S11–S15, Sep–Oct): Android app (Flutter)
- **Trial Gate 3** (~Oct): Public beta
- **Sections 8–9** (Nov 2026+): Adaptive engine, AWS migration, Redis, scale
- **Section 10** (Feb 2027+): B2B, iOS, analytics, AI features

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
- Reviews code merged since last sprint against acceptance criteria in `koblio_scheduled_task_plan.md`
- Writes QC report to `sprint_tracker/history/sprint_NN_qc.md`
- Can flag blockers that PM agent uses next Monday

### 3. Implementation Agent (`agents/implementation_agent.md`)
- Runs **daily (weekdays)**
- Picks up the top in-progress task from `sprint_tracker/current_sprint.md`
- Implements code, writes tests, commits
- Updates task status in `sprint_tracker/current_sprint.md`

---

## Tech Stack (summary for agents)

**Active (MVP, Sections 1–7):**
- **Web:** Next.js 15 + React 19 + TypeScript + Tailwind + shadcn/ui
- **Backend:** NestJS (modular monolith) + TypeScript
- **DB:** PostgreSQL 16 (Prisma) — single database for MVP; problems stored as JSONB
- **Auth:** Auth0 (COPPA-compliant) — already configured
- **Queue:** BullMQ (for gamification events)
- **CI/CD:** GitHub Actions + Turborepo
- **Hosting:** Railway or Render (until Trial Gate 1 → Section 9)
- **Mobile:** Flutter (Dart) — parked until Section 7 (Sprint 11+)

**Added later (Section 7+):**
- Redis 7 — leaderboard performance at scale (Section 9)
- MongoDB Atlas — problem storage if JSONB proves limiting (Section 8, optional)
- AWS ECS Fargate → Terraform → EKS (Section 9, 5K+ MAU)
- Firebase Cloud Messaging — push notifications (Section 7, Android)

---

## Key Architecture Decisions (locked)

- **Web-first MVP** — Android app built after Trial Gate 2 validates retention
- **PostgreSQL JSONB for problems** — replaces MongoDB for MVP; migrate only if content team needs it at scale
- **No Redis until Section 9** — PostgreSQL handles streaks + leaderboards at MVP scale
- **Railway/Render for hosting** — no AWS credentials needed until 5K+ MAU
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
