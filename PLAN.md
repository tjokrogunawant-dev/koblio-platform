# Koblio — Plan to First 10K Users

**Last updated:** 2026-04-29  
**Owner:** Solo developer + AI (Claude Code)  
**Stack:** NestJS API + Next.js 15 Web + PostgreSQL (Prisma) + Railway  
**Payment:** Deferred until after 10K MAU — build value first, monetise second

---

## The North Star

Get 10,000 monthly active learners by proving the core loop works:
> **Student logs in → gets a problem → answers it → earns XP/coins → comes back tomorrow**

Everything else is secondary until that loop is proven at scale.

---

## Current State (as of Sprint 19)

**What's built and working:**

- Turborepo monorepo: `apps/api` (NestJS) + `apps/web` (Next.js 15)
- Internal auth — bcrypt + HS256 JWT, COPPA-safe roles (student / teacher / parent)
- Teacher: create class, invite students via class code
- Student: register with class code, solve problems, earn XP + coins
- FSRS-4.5 scheduler + BKT mastery tracking (implemented, needs end-to-end wiring)
- Gamification: XP, coins, badges, streaks, Redis leaderboard
- Forgot-password / reset flow
- Docker + Railway deploy working
- GitHub Actions CI (lint, typecheck, unit tests)

**What's missing before real users can test it:**

- [ ] Student profile setup page (`/profile/setup`)
- [ ] Student home dashboard (`/student/dashboard`)
- [ ] Playwright e2e smoke tests

---

## Stack Decision

**Keep NestJS + Next.js. Don't switch frameworks mid-build.**

The backend is ~80% feature-complete. Migrating to a new framework now costs 4–6 weeks and produces the same result. Instead, simplify *how we work*:

- One branch: `main`. Ship directly to Railway on every merge.
- No automated agent crons — you + Claude Code implement tasks manually.
- No sprint ceremony — work from this file as the single source of truth.
- One deploy command: `git push origin main` → Railway builds and deploys automatically.

---

## Phase 1 — Close the Alpha Gap (now → ~May 10)

**Goal:** Any real student can sign up, solve problems, and have a reason to return.

| Task | What to build | Done? |
|---|---|---|
| TG1-T01 | `/profile/setup` — avatar picker + display name, redirects to dashboard | ☐ |
| TG1-T02 | `/student/dashboard` — XP bar, coin counter, streak, today's challenge card | ☐ |
| TG1-T04 | Playwright smoke test: register teacher → class → student → solve → XP check | ☐ |

**Done when:** A teacher can create a class, share the code, a student registers, solves one problem, and sees their XP go up.

---

## Phase 2 — Wire the Learning Loop (May 11 – May 31)

**Goal:** The adaptive scheduler drives daily practice. Students have a reason to return each day.

| Task | What to build |
|---|---|
| Scheduler end-to-end | FSRS due-cards surface on `/student/dashboard` and `/learn` page |
| Streak enforcement | Daily streak resets at midnight; streak count shown on dashboard |
| Problem set: Grade 1–3 | Seed 150+ problems across addition, subtraction, multiplication, fractions |
| Teacher class view | See per-student XP, streak, mastery % per topic |
| Mobile-responsive pass | All student-facing pages usable on a phone (no native app needed yet) |

**Done when:** A student logs in daily, sees their scheduled practice, and the streak counter moves.

---

## Phase 3 — Invite Real Families (June 1 – June 21)

**Goal:** 20–50 real families using the platform. Collect feedback.

| Task | What to build |
|---|---|
| Parent dashboard | See child's progress, recent activity, current streak |
| Email invites | Teacher sends class invite link via email (SendGrid, already wired) |
| Onboarding flow | First-time student gets a 3-step tutorial before their first problem |
| Error monitoring | Sentry alerts on API 5xx and unhandled frontend errors |
| Basic analytics | Log problem attempts + session starts to a `events` table — no third-party tool yet |

**Done when:** 20 real children have used the platform for at least one week.

---

## Phase 4 — Grow to 1K MAU (July – August)

**Goal:** 1,000 monthly active students. Reach this before adding any new features.

Lever | Action
--- | ---
**Content** | Reach 500+ problems across all Grade 1–3 topics
**Retention** | Badge notifications — email digest for earned badges ("You earned the Streak Star badge!")
**Referral** | Teacher sharing: one-click "copy invite link" on class page
**Feedback loop** | Weekly 3-question in-app survey for teachers ("What's missing?")
**Performance** | Page load < 2 s on 4G. Profile with Lighthouse; fix the top 3 bottlenecks.

No new architecture. Fix bugs, add content, improve UX. Deploy as often as needed.

---

## Phase 5 — Grow to 10K MAU (September – November)

**Trigger:** Only begin this phase when Phase 4 is stable (churn < 20%/month, no critical bugs open for > 1 week).

| Area | Action |
|---|---|
| **Android app** | Flutter app (already scaffolded). Target students on low-cost Android devices. |
| **School accounts** | Bulk class creation. CSV student import. |
| **Leaderboards** | Class-level + school-level weekly boards. Redis already wired. |
| **Parent notifications** | Weekly progress email digest. |
| **Content** | Grade 4–5 topics to expand addressable market. |
| **Infra** | If Railway CPU/memory spikes: horizontal scale on Railway. No AWS until 5K+ MAU. |

**Payment is NOT in this phase.** Premium features, subscriptions, and school billing come after 10K is proven.

---

## Backlog / Deferred

| Item | Notes |
|---|---|
| CI auto-deploy via SSH | `deploy` job is written in `ci.yml` (commented out). Add 4 secrets to GitHub: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_DEPLOY_PATH`. See `DEPLOY.md`. |

---

## What Not to Build (Until After 10K)

| Feature | Why deferred |
|---|---|
| Stripe / subscriptions | Don't add payment friction before product-market fit |
| iOS app | Android comes first; iOS after Android proves retention |
| AI-generated problems | Expensive; seed content is enough for 10K |
| Admin CMS | Seed via JSON files; a GUI adds weeks with no user value |
| AWS ECS / Kubernetes | Railway handles up to ~5K MAU comfortably |
| MongoDB migration | Postgres JSONB is fine for 10K+ problems |
| Redis cluster | Single Redis instance on Railway is sufficient |
| Multi-region deploy | Not needed below 50K MAU |

---

## How to Work (Solo Dev + AI)

1. **Pick the top unchecked item** from the current phase above.
2. **Open Claude Code**, describe the task, implement it together.
3. **Test locally** — `pnpm dev` runs the full stack via Turborepo.
4. **Push to main** — Railway deploys in ~3 minutes automatically.
5. **Update this file** — check off the task, add any blockers or notes.

No sprint planning. No retrospectives. No agent crons. Just build → ship → check off.

---

## Reference

Detailed specs for curriculum, API, legal compliance, and original roadmap are archived in `doc/`.
