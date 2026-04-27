# Koblio — Revised Web-First MVP Roadmap

**Version:** 2.0  
**Revised:** 2026-04-23  
**Replaces:** `koblio_development_plan.md` Phase 1-2 scope  

---

## How to Read This Document

The plan is split into **sections** that build on each other. Each section ends with a **Trial Gate** — a concrete point where real users can start using the platform. You do not need to finish every section before starting a trial; each gate represents a real, shippable thing.

**Credentials are not blockers.** Each section notes exactly what external service (if any) is needed, and what the free/cheap alternative is.

---

## What Is Already Built

These are done and merged as of Sprint 03:

| Item | Commit |
|---|---|
| Turborepo monorepo (web + api + packages) | `e81a0d8` |
| GitHub Actions CI pipeline | `ed0943d` |
| NestJS API bootstrap (helmet, rate limiting, health check) | `a94b3e9` |
| Auth0 JWT + RBAC guards + COPPA roles | `0e372b3` |
| Prisma schema (users, schools, classrooms, enrollments, parent_child_links) | `f536c19` |
| Next.js 15 web shell + teacher dashboard shell | `e164ac6` |
| Design system `@koblio/ui` — 10 components | `b32e2bf` |
| Flutter app shell (scaffolded, parked until Section 7) | `a85d6fd` |
| Auth Module — parent + teacher registration (62 unit tests) | `acabf47` |

---

## Section 1 — Complete Auth & User Management

**Goal:** Every user type can register and log in. A parent can create a child account.  
**Sprint:** S03 (Apr 22 – May 2, 2026) — current sprint  
**Credentials needed:** Auth0 (already configured). PostgreSQL via Neon free tier or Docker Desktop on Windows.

### Tasks

| ID | Task | Priority | Notes |
|---|---|---|---|
| P1-T11 | Student login (username + password) + RBAC enforcement | P0 | Unblocked — T10 is done |
| P1-T12 | Parent-child account linking + school association | P0 | After T11 |
| P1-T13 | Auth frontend — login page, register page, role-aware redirect | P0 | After T10 + T11 |
| P1-T09 | Sentry error tracking (web + API) | P2 | No blockers, run in parallel |

### Simplifications vs. original plan

- Redis-backed token revocation is **deferred** — use a `revoked_tokens` table in PostgreSQL for MVP. Good enough for <1K users.
- Auth0 is already configured. If Auth0 free tier limits are hit, migrate to Clerk (same API surface, simpler COPPA flow). Not a blocker either way.

---

## Section 2 — Content Pipeline (Simplified)

**Goal:** 50+ math problems stored in the database and rendered with KaTeX in the browser.  
**Sprint:** S04 (May 5–16, 2026)  
**Credentials needed:** None. PostgreSQL only (already set up).

### Why no MongoDB

MongoDB Atlas was planned for flexible problem schemas. However, PostgreSQL's `JSONB` column type handles flexible document schemas, full-text search, and GIN indexes well enough for tens of thousands of problems. This removes one entire database from the local dev stack and eliminates the Atlas credential requirement for MVP.

Migrate to MongoDB Atlas in Section 8 only if the content authoring team needs it (e.g., >50K problems with complex nested structures).

### Tasks

| ID | Task | Priority | Notes |
|---|---|---|---|
| P1-T14r | Problem schema in Prisma — `problems` table with `content JSONB` | P0 | Replaces MongoDB approach |
| P1-T17 | KaTeX integration — math rendering in Next.js | P1 | Already scheduled, no blockers |
| P1-T14s | Seed 50 problems (grades 1–3, MCQ + fill-in-blank, US Common Core) | P0 | JSON seed files, no CMS needed for MVP |
| P1-T14a | Problem API — `GET /problems`, `GET /problems/:id`, filtered by grade/topic/difficulty | P0 | Standard REST, no changes |

### Problem schema (PostgreSQL JSONB)

```
problems table:
  id          UUID
  curriculum  TEXT  (e.g. "us_common_core")
  grade       INT
  strand      TEXT  (e.g. "number_and_operations")
  topic       TEXT  (e.g. "fractions")
  difficulty  ENUM  (easy / medium / hard)
  type        ENUM  (mcq / fill_blank / true_false)
  content     JSONB (question, options[], answer, hints[], solution, image_url)
  created_at  TIMESTAMP
```

No admin CMS for MVP — seed problems via JSON files committed to the repo. A simple web-based CMS comes in Section 6 when you need non-developers to author content.

---

## Section 3 — Student Problem-Solving Flow

**Goal:** A student can log in, pick a topic, solve problems, and see correct/incorrect feedback with a worked solution.  
**Sprint:** S05 (May 19–30, 2026)  
**Credentials needed:** None beyond what's already set up.

### Tasks

| ID | Task | Priority |
|---|---|---|
| P1-T18 | Topic browser UI — grade → strand → topic navigation | P0 |
| P1-T19 | Problem display — MCQ renderer + fill-in-blank renderer + KaTeX | P0 |
| P1-T20 | Answer submission — immediate correct/incorrect feedback + worked solution reveal | P0 |
| P1-T21 | Attempt recording — `student_problem_attempts` table (student, problem, answer, correct, time_spent) | P0 |
| P1-T22 | Hint system — progressive hints revealed one at a time | P1 |

### What is NOT in this section

- Audio feedback (deferred — not core to learning loop)
- Video solutions (deferred — expensive to produce, Phase 3+)
- Interactive manipulatives (deferred — Phase 3+)

---

## Section 4 — Gamification v1 (Coins + Streak)

**Goal:** Students earn coins for correct answers. A daily streak is tracked and displayed. A simple class leaderboard shows who solved the most this week.  
**Sprint:** S06 (Jun 2–13, 2026)  
**Credentials needed:** None. All in PostgreSQL.

### Why no Redis

Redis was planned for leaderboards (ZSET) and streak tracking. For MVP with <1,000 students per school, a PostgreSQL query returning the top 10 students by weekly score takes <20ms. Redis adds a third database to configure locally and in production. Introduce Redis in Section 9 only if leaderboard query latency becomes a real problem.

### Tasks

| ID | Task | Priority |
|---|---|---|
| P1-T23 | Points ledger — `points_ledger` table (append-only), coins per correct answer scaled by difficulty | P0 |
| P1-T24 | XP + levels — accumulate XP from attempts, level thresholds, progress bar UI | P1 |
| P1-T25 | Daily streak — `last_active_date` + `streak_count` on user record; bonus multiplier at 7 days | P0 |
| P1-T26 | Class leaderboard — SQL query, weekly window, top 10 + student's own rank | P1 |
| P1-T27 | Daily challenge — one curated problem per grade per day (picked from seed data) | P1 |
| P1-T28 | Gamification UI — coin counter, streak flame, XP bar, leaderboard widget on student dashboard | P0 |

---

## Section 5 — Teacher Dashboard v1

**Goal:** A teacher can create a class, add students, assign a topic, and see basic progress.  
**Sprint:** S07 (Jun 16–27, 2026)  
**Credentials needed:** None.

### Tasks

| ID | Task | Priority |
|---|---|---|
| P1-T29 | Class management — create class, add students manually or by class code | P0 |
| P1-T30 | Assignment creation — pick topic + difficulty + deadline | P0 |
| P1-T31 | Assignment tracking — see which students submitted, auto-graded results | P0 |
| P1-T32 | Student progress view — problems attempted, % correct by topic, streak status | P0 |
| P1-T33 | Parent view — read-only child progress (problems done, streak, recent activity) | P1 |

---

## ← TRIAL GATE 1: Internal Alpha (~Jun 27, 2026)

**What you have at this point:**
- Parent registers → creates child account → child logs in via username/password
- Student picks topic → solves problems → earns coins + maintains streak
- Teacher creates class → assigns work → monitors student progress
- Parent views child's activity

**How to deploy:**  
Use [Railway](https://railway.app) (PostgreSQL + NestJS + Next.js, ~$5–10/month, no DevOps knowledge required). Or [Render](https://render.com) (free tier). No AWS, no Terraform, no Docker required.

```bash
# Deploy API
railway up  # in apps/api/

# Deploy web
railway up  # in apps/web/
```

**Who to invite:** 5–10 real families (parents + kids), 1–2 teachers you know personally. Run for 2–4 weeks.

**What to measure:**
- D7 retention: do students log in again 7 days later?
- Problem completion rate: are students finishing sessions or dropping off?
- Teacher feedback: is the dashboard useful or confusing?
- Bug reports and rough edges

**You do NOT need** Stripe, badges, email, or Android for this trial. Keep it simple.

---

## Section 6 — Growth Features (Web)

**Goal:** Retention loops, parent engagement, and first paying subscribers.  
**Sprints:** S08–S10 (Jul–Aug 2026)  
**Credentials needed:** Stripe (free to set up, test mode); SendGrid or Resend (free tier for <100 emails/day).

### Tasks

| ID | Task | Priority |
|---|---|---|
| P2-T01 | Badge system — 10 badge types (First Perfect Score, 7-Day Streak, 100 Problems, Fraction Master, Speed Demon, etc.) event-driven via BullMQ | P1 |
| P2-T02 | Avatar selection — 8 pre-made avatars, student picks on profile setup | P1 |
| P2-T03 | Parent dashboard (web) — child skill mastery, weekly activity, streak history | P1 |
| P2-T04 | Weekly email digest — automated parent summary (SendGrid / Resend + MJML template) | P1 |
| P2-T05 | Stripe subscriptions — free tier (5 problems/day) vs. premium (unlimited); 7-day free trial | P0 |
| P2-T06 | Paywall enforcement — free tier limit in API middleware | P0 |
| P2-T07 | Admin problem CMS — simple Next.js form for adding/editing problems without a developer | P1 |
| P2-T08 | Expand seed content to 200+ problems (grades 1–3 complete coverage) | P0 |

### What is NOT in this section

- Avatar shop (deferred — needs a coin economy that's been running long enough to know good pricing)
- Missions/quests (deferred — Phase 3+)
- School-level SSO (deferred — Phase 4+)

---

## ← TRIAL GATE 2: Closed Beta (~Aug 2026)

**What you have at this point:**
- Everything from Trial Gate 1, plus:
- Badges, streaks with visual rewards, avatar customization
- Parents receive weekly email digests
- Stripe payments live — free tier vs. premium
- 200+ problems across grades 1–3

**How to run the beta:**  
Onboard 3–5 pilot schools (offer free premium for 3 months in exchange for structured feedback). Open to 100–200 individual families. Run for 4–6 weeks before Section 7.

**What to measure:**
- D30 retention (do students stick around a month later?)
- Free-to-paid conversion rate
- Parent NPS (target > 30)
- Teacher NPS (target > 30)
- Which badges get earned most → what's actually driving engagement?

**Decide:** Is the web product retaining users well enough to justify building Android? If yes, proceed to Section 7.

---

## Section 7 — Android App

**Goal:** Same student experience on Android. Streak reminders via push notification.  
**Sprints:** S11–S15 (Sep–Oct 2026)  
**Credentials needed:** Firebase (free), Google Play developer account ($25 one-time).

The Flutter app shell is already scaffolded (`apps/mobile/`, commit `a85d6fd`). The API is stable and tested by this point, so the mobile app is purely a new client.

Build **student-facing screens only** for this release:

| Screen | Notes |
|---|---|
| Login (username + password + class code) | |
| Grade/topic browser | Same data as web |
| Problem-solving flow | MCQ + fill-in-blank |
| Coins + streak + XP display | |
| Class leaderboard | |
| Daily challenge | |
| Push notifications | Firebase Cloud Messaging — daily streak reminder |

**KaTeX** → use `flutter_math_fork` (already in plan).  
**Offline support** → deferred to Phase 2 of mobile. Too complex for first release.  
**iOS** → after Android validation. App Store review is slower; get Play Store live first.

---

## ← TRIAL GATE 3: Public Beta — Web + Android (~Oct 2026)

**What you have at this point:**
- Full web platform with payments and teacher tooling
- Android app live on Google Play
- 200+ problems

**What to measure:**
- Mobile D7 retention vs. web D7
- Play Store rating
- Whether mobile users convert to paid at a different rate than web

---

## Section 8 — Adaptive Learning Engine

**Goal:** Problems adapt to each student's ability level automatically.  
**Sprints:** S16–S18 (Nov–Dec 2026)  
**When to do this:** After you have ~500 students with real attempt data. The engine needs data to work — do not build it before Trial Gate 2.

| Task | Notes |
|---|---|
| Rules-based difficulty adjustment | 3 consecutive wrong → step down; 5 consecutive correct → step up |
| BKT per skill | P(known) per student per skill; seeded with population defaults |
| FSRS-4.5 spaced repetition | Replaces fixed daily challenge with scheduled review |
| Mood-gated weight shifts | FLOW / FRUSTRATED / CONFUSED detection → tune scheduler weights |

**MongoDB migration (optional):** If the content team is authoring 5,000+ problems and finds PostgreSQL JSONB limiting, migrate the `problems` table to MongoDB Atlas here. This is not required for the adaptive engine itself.

---

## Section 9 — Scale & Infrastructure

**Goal:** Handle 10K+ MAU reliably. Move off Railway/Render to AWS.  
**Sprints:** S19–S20 (Jan 2027)  
**When to do this:** When Railway/Render costs exceed AWS costs, or when you hit rate limits or performance ceilings. For context, Railway comfortably handles ~5K MAU.

| Task | Notes |
|---|---|
| Terraform modules for VPC, ECS Fargate, RDS, ElastiCache, S3, CloudFront | Requires AWS IAM credentials — this is when you need them |
| Redis 7 for leaderboards | ZSET for real-time ranking at scale |
| PostgreSQL read replica | For analytics queries |
| CI/CD deploy to ECS | Replaces Railway deploy |
| Monitoring (Datadog or CloudWatch) | |

---

## Section 10 — Advanced Features (Phase 4–5 of original plan)

Everything below is real and valuable — but only after the business is validated:

- **Analytics pipeline** (Metabase, event tracking, teacher PDF reports)
- **B2B school portal** (bulk provisioning, school admin, Clever SSO, site licensing)
- **iOS app** (after Android validation)
- **Gamification v3** (avatar shop, missions, peer challenges, school tournaments)
- **IRT calibration** (after ~10K attempts per problem)
- **AI features** (LLM-powered hints, automated problem generation)
- **Multi-region deployment**
- **Second curriculum market**

---

## Revised Sprint Timeline (from current position)

| Sprint | Dates | Section | Deliverable |
|---|---|---|---|
| **S03** | Apr 22 – May 2 | Section 1 | Student login + parent-child linking + auth frontend |
| **S04** | May 5–16 | Section 2 | Problem schema (JSONB) + 50 seed problems + KaTeX |
| **S05** | May 19–30 | Section 3 | Student problem-solving flow |
| **S06** | Jun 2–13 | Section 4 | Coins + streak + class leaderboard |
| **S07** | Jun 16–27 | Section 5 | Teacher dashboard v1 |
| | **~Jun 27** | **← TRIAL GATE 1** | **Internal alpha — deploy to Railway, invite 5–10 families** |
| **S08** | Jun 30–Jul 11 | Section 6 | Badges + avatar selection |
| **S09** | Jul 14–25 | Section 6 | Parent dashboard + email digest |
| **S10** | Jul 28–Aug 8 | Section 6 | Stripe payments + paywall + admin CMS |
| | **~Aug 8** | **← TRIAL GATE 2** | **Closed beta — pilot schools + 100 beta testers** |
| **S11–S15** | Aug–Oct | Section 7 | Android app (Flutter) |
| | **~Oct** | **← TRIAL GATE 3** | **Public beta — web + Android** |
| **S16–S18** | Nov–Dec | Section 8 | Adaptive engine (rules-based → BKT → FSRS) |
| **S19–S20** | Jan 2027 | Section 9 | AWS migration + Redis + scale hardening |
| **S21+** | Feb 2027+ | Section 10 | B2B, iOS, analytics, AI features |

---

## Credential / Service Dependency Map

| What | Needed from | When | Free alternative |
|---|---|---|---|
| PostgreSQL | Docker Desktop (Windows) or Neon free tier | Now | Neon.tech — free 0.5GB |
| Auth0 | Already configured | Now | Already done |
| Railway / Render | Account signup | Trial Gate 1 | Render free tier |
| Stripe | Stripe account (free, test mode) | Section 6 | Test mode is free |
| SendGrid / Resend | Account signup (free tier) | Section 6 | Resend free — 100 emails/day |
| Firebase | Google account | Section 7 | Free |
| Google Play Developer | $25 one-time | Section 7 | One-time fee |
| **AWS IAM credentials** | AWS account | **Section 9 only** | Not needed until 5K+ MAU |
| MongoDB Atlas | Atlas account | **Section 8 (optional)** | May never be needed |
| Redis | Local Docker or Upstash | **Section 9** | Not needed until scale |

---

*This document supersedes Phase 1–2 of `koblio_development_plan.md` for current sprint planning. The original document remains as a reference for Phase 3–5 features.*
