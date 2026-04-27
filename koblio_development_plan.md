# Development Plan: Gamified Math Learning Platform (Koblio-Style)

**Version:** 1.0
**Date:** 2026-04-16
**Timeline:** May 2026 — October 2027 (18 months, 5 phases)
**Status:** Draft — awaiting team review

---

## 1. Project Overview

We are building a gamified, adaptive math learning platform for primary/elementary students (grades K-6, ages 6-12), modeled on the proven approach of Koblio Learning. The platform combines curriculum-aligned math content (starting with Singapore Math, CPA methodology) with deep gamification mechanics — points, badges, streaks, leaderboards, avatar customization, brain-training mini-games, and daily challenges — to make practice feel like play. It serves three user types: **students** (via a Flutter mobile app and web), **teachers** (class management, homework assignment, analytics dashboards), and **parents** (child progress tracking, subscription management). The backend is a NestJS modular monolith backed by PostgreSQL, MongoDB, and Redis, hosted on AWS. The platform launches math-only for one curriculum market, then expands to additional markets and subjects. Target: 10K MAU by month 12, with architecture to support 100K+.

---

## 2. Team Composition

| Role | Count | Phases Active | Notes |
|------|-------|---------------|-------|
| Tech Lead / Architect | 1 | 1-5 | Architecture decisions, backend lead, code review |
| Senior Full-Stack Engineer | 2 | 1-5 | Backend NestJS modules + Next.js web frontend |
| Frontend Developer | 1 | 1-5 | Web app, animations (Framer Motion, Lottie, PixiJS) |
| Mobile Developer (Flutter) | 1 | 2-5 | Flutter app, Flame mini-games, Rive animations |
| ML / Algorithm Engineer | 1 | 2-5 | Adaptive learning engine, IRT calibration, analytics |
| UI/UX Designer | 1 | 1-5 | Child-friendly design system, gamification assets, UX research |
| QA Engineer | 1 | 1-5 | Test automation (Playwright, Flutter integration), device matrix |
| DevOps Contractor | 0.5 | 1-3 | Terraform IaC, CI/CD, AWS setup; part-time |
| Product Manager | 1 | 1-5 | Roadmap, stakeholder alignment, content strategy |
| Content Creators (Math) | 1-3 | 2-5 | Problem authoring, curriculum alignment; ramp up over time |

**Total core team: 8 FTE** (months 1-3), scaling to **10-11** (months 4+) with mobile dev, ML engineer, and content creators.

---

## 3. Tech Stack Reference

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Web Frontend** | Next.js 15, React 19, TypeScript | Teacher/parent dashboards, student web app, marketing pages |
| **Web State** | Zustand + TanStack Query | Client state + server state caching |
| **Web Styling** | Tailwind CSS + shadcn/ui | Design system, accessible components |
| **Web Animation** | Framer Motion + Lottie + PixiJS | UI transitions, reward animations, interactive manipulatives |
| **Web Math** | KaTeX | LaTeX math expression rendering |
| **Mobile** | Flutter (Dart) | iOS + Android student app |
| **Mobile Navigation** | GoRouter | Deep linking, type-safe routing |
| **Mobile Animation** | Rive + Lottie + Flutter Animate | Interactive stateful animations, reward effects |
| **Mobile Game Engine** | Flame | Brain Games, math mini-games, interactive manipulatives |
| **Mobile Math** | flutter_math_fork | Native LaTeX rendering (KaTeX port) |
| **Mobile Offline** | Drift (SQLite) | Offline problem cache + sync |
| **Mobile State** | Riverpod + Dio | App state + HTTP layer |
| **Backend** | NestJS (Node.js, TypeScript) | Modular monolith API |
| **API Style** | REST + GraphQL (Apollo) | REST for CRUD/mobile; GraphQL for dashboard queries |
| **Real-time** | Socket.IO via NestJS | Leaderboards, live challenges |
| **Primary DB** | PostgreSQL 16 (Prisma ORM) | Users, progress, payments, analytics |
| **Content DB** | MongoDB Atlas | Math problems (flexible schema) |
| **Cache** | Redis 7 (ElastiCache/Upstash) | Leaderboards (ZSET), sessions, streaks, hot content |
| **Search** | Meilisearch | Problem library search for teachers |
| **Auth** | Auth0 (or Clerk) | COPPA-compliant, SSO/SAML for schools |
| **Payments** | Stripe + Stripe Billing | Subscriptions, invoicing, dunning |
| **Email** | SendGrid / Postmark | Transactional + parent digest |
| **Push** | Firebase Cloud Messaging | Mobile notifications |
| **Cloud** | AWS (ECS Fargate → EKS) | Compute, S3, CloudFront, RDS |
| **CI/CD** | GitHub Actions + Turborepo | Monorepo builds, automated testing |
| **IaC** | Terraform | Infrastructure provisioning |
| **Monitoring** | Sentry + Datadog/CloudWatch | Errors, APM, logs |

---

## 4. Phase Breakdown

---

### Phase 1: Foundation & MVP Core

| | |
|---|---|
| **Duration** | 12 weeks (May 5 — Jul 25, 2026) |
| **Calendar** | Months 1-3 |
| **Team Size** | 8 (Tech Lead, 2 Full-Stack, 1 Frontend, 1 Designer, 1 QA, 0.5 DevOps, 1 PM) |
| **MAU Target** | Internal testing only (0 external users) |
| **Objective** | Students can log in via web, solve curriculum-aligned math problems, earn points, and maintain streaks. Teachers can create classes and see basic progress. Parent accounts linked to children. |

#### Task List & Deliverables

**Weeks 1-2: Project Scaffolding & Infrastructure**

- [ ] Initialize monorepo (Turborepo) with `apps/web`, `apps/api`, `packages/shared`, `packages/ui`
- [ ] Scaffold Next.js 15 web app with TypeScript, Tailwind, shadcn/ui
- [ ] Scaffold NestJS backend with module structure (Auth, User, Content, Gamification, Classroom, Notification)
- [ ] Set up Docker Compose for local dev (PostgreSQL 16, MongoDB, Redis 7)
- [ ] Provision AWS staging environment via Terraform: ECS Fargate, RDS (db.t3.medium), ElastiCache (cache.t3.micro), S3 bucket, CloudFront distribution
- [ ] Configure CI/CD: GitHub Actions pipeline with lint (ESLint/Prettier), type-check (tsc), unit tests (Vitest), PR preview deployments
- [ ] Set up Auth0 tenant with COPPA-compliant configuration (no child email collection, parental consent flow)
- [ ] Establish design system foundations: color palette, typography (child-friendly), component library in Figma; begin shadcn/ui customization
- [ ] Set up Sentry for error tracking (web + API)

**Weeks 3-4: Authentication & User Management**

- [ ] Implement Auth module: parent registration with email/password, child account creation (by parent), teacher registration
- [ ] Student login: username + password (set by parent/teacher); class code entry for young students (K-2)
- [ ] RBAC middleware: Student, Parent, Teacher, Admin roles with guard decorators
- [ ] Parent-child account linking: parent creates child profile, sets credentials, grants consent (recorded + auditable)
- [ ] Teacher-school association: teacher creates school, invites colleagues
- [ ] JWT access tokens (15min) + refresh tokens (httpOnly cookie, 7d) with Redis-backed revocation
- [ ] Prisma schema: `users`, `schools`, `classrooms`, `enrollments`, `parent_child_links`

**Weeks 5-6: Content Engine & Math Problem Pipeline**

- [ ] MongoDB problem document schema (as specified in tech stack doc): curriculum taxonomy, difficulty metadata, question types, hints, solutions
- [ ] Admin CMS (Next.js): rich editor for creating problems with KaTeX preview, image upload (S3), metadata tagging (country → grade → strand → topic → subtopic → skill)
- [ ] Bulk import tool: CSV/JSON ingestion for migrating existing problem banks
- [ ] Seed content: 500+ math problems across grades 1-6 for primary curriculum market (Singapore MOE or US Common Core)
- [ ] Content versioning: never delete problems, only deprecate
- [ ] KaTeX rendering integrated into web frontend for displaying math expressions
- [ ] API endpoints: `GET /problems` (filtered by grade, topic, difficulty), `GET /problems/:id`

**Weeks 7-8: Core Problem-Solving Experience**

- [ ] Student topic selection UI: browse curriculum by grade → strand → topic
- [ ] Problem-solving flow: display problem → student answers → immediate correct/incorrect feedback → show full worked solution
- [ ] Question type renderers: multiple-choice, fill-in-the-blank, true/false (minimum viable set)
- [ ] Basic difficulty buckets: easy / medium / hard (manual tagging, pre-adaptive engine)
- [ ] Attempt recording: `student_problem_attempts` table (student_id, problem_id, answer, correct, time_spent, timestamp)
- [ ] Hint system: progressive hints revealed one-at-a-time on student request
- [ ] Audio feedback: correct/incorrect answer sounds (child-friendly, encouraging)

**Weeks 9-10: Gamification v1**

- [ ] Points system: earn coins per correct answer (scaled by difficulty); `points_ledger` table (append-only)
- [ ] XP & Levels: accumulate XP, level thresholds (100, 300, 600, 1000...), progress bar UI
- [ ] Daily streak tracking: Redis-backed; visual flame/counter on student dashboard; bonus multiplier at 7 days
- [ ] Simple leaderboard: class-level, weekly reset; Redis ZSET; display top 10 + student's rank
- [ ] Basic avatar selection: 6-8 pre-made character avatars (no shop yet)
- [ ] Daily Challenge: one curated problem per grade per day; bonus coins for completion
- [ ] Gamification event bus: BullMQ job queue processing points, streaks, leaderboard updates asynchronously

**Weeks 11-12: Teacher Dashboard v1 & Integration Testing**

- [ ] Teacher class management: create class, add students (manual + CSV upload), view roster
- [ ] Assignment creation: select topic + difficulty range + deadline → auto-generate problem set
- [ ] Assignment tracking: view submission status per student, auto-graded results
- [ ] Basic student progress view: problems attempted, % correct by topic, recent activity
- [ ] Parent account: view linked child's basic progress (problems done, streak status)
- [ ] End-to-end integration testing: full student flow (login → solve → earn points → leaderboard)
- [ ] Staging deployment: full environment on AWS, accessible to internal testers
- [ ] Performance baseline: measure API response times, page load times

#### Phase 1 Milestones

| # | Milestone | Success Criteria | Target Date |
|---|-----------|-----------------|-------------|
| M1.1 | Infrastructure live | Staging environment deployed; CI/CD green on every PR | May 16, 2026 |
| M1.2 | Auth working | Parent can register, create child account, child can login; RBAC enforced | May 30, 2026 |
| M1.3 | Content pipeline | 500+ problems seeded; admin CMS functional; KaTeX rendering working | Jun 13, 2026 |
| M1.4 | Student can solve | End-to-end: login → pick topic → solve problems → see feedback | Jun 27, 2026 |
| M1.5 | Gamification live | Points, streaks, leaderboard, daily challenge all functional | Jul 11, 2026 |
| M1.6 | **MVP complete** | Teacher dashboard v1 working; internal team has tested full flow | Jul 25, 2026 |

#### Phase 1 Infrastructure Budget

| Item | Monthly Cost | Phase Total (3 months) |
|------|-------------|----------------------|
| AWS Compute (2x t3.medium, Fargate) | $60 | $180 |
| RDS PostgreSQL (db.t3.medium) | $70 | $210 |
| ElastiCache Redis (cache.t3.micro) | $15 | $45 |
| MongoDB Atlas (M10 shared) | $60 | $180 |
| S3 + CloudFront | $20 | $60 |
| Auth0 (free tier) | $0 | $0 |
| Sentry (free tier) | $0 | $0 |
| GitHub Team (5 seats) | $20 | $60 |
| CI/CD (GitHub Actions) | $10 | $30 |
| Secrets Manager | $4 | $12 |
| Domain + DNS | $2 | $6 |
| CloudWatch (basic) | $15 | $45 |
| COPPA legal prep (amortized) | $300 | $900 |
| **Phase 1 Ops Total** | **~$576/mo** | **~$1,728** |

---

### Phase 2: Adaptive Learning, Mobile App & Subscriptions

| | |
|---|---|
| **Duration** | 12 weeks (Jul 28 — Oct 17, 2026) |
| **Calendar** | Months 4-6 |
| **Team Size** | 10 (+1 Flutter dev, +1 ML engineer joining) |
| **MAU Target** | 500-2,000 (closed beta with pilot schools) |
| **Objective** | Problems adapt to student ability. Flutter mobile app on iOS + Android. Badges, missions, avatar shop. Parent dashboard with subscription payments. |
| **Dependencies** | Phase 1 complete: auth, content engine, gamification v1, teacher dashboard v1 |

#### Task List & Deliverables

**Weeks 13-15: Adaptive Learning Engine v1**

- [ ] Rules-based difficulty adjustment: 3 consecutive wrong → step down difficulty; 5 consecutive correct → step up
- [ ] Bayesian Knowledge Tracing (BKT) per skill: track P(known) for each curriculum skill per student. Parameters P(L0), P(T), P(G), P(S) seeded with population defaults.
- [ ] **Mood-aware BKT schema (three-parameter session-scoped model):** Base parameters (`base_P_L0`, `base_P_T`, `base_P_G`, `base_P_S`) persisted per-skill in `skills` table — only updated via population recalibration jobs. Session-scoped mood modifiers persisted in `student_sessions.mood_modifiers` as jsonb `{P_T_delta, P_G_delta, P_S_delta}` (no P_L0_delta — initial knowledge isn't affected by mood). Effective params computed at read time (`base + modifier`), never written back. BKT update equations use effective values; writeback touches only P(known). Clamp effective P(T), P(G), P(S) to [0.01, 0.99] inside the BKT service to avoid posterior discontinuities and mis-calibrated base guards. Session lifecycle: 60-minute inactivity timeout, single current-modifier overwritten per attempt. Separate append-only `mood_classification_events` table for trajectory analytics (hot-path reads stay on the single-row session record). **See:** `/home/tjokro/general_purpose/ai_office/workers/data/worker_3/workspace/mood_detection_spec.md` for the authoritative spec; integration contract with worker_2's problem generator lands Thursday at `/home/tjokro/general_purpose/ai_office/workers/data/manager/workspace/adaptive_engine_interface.md`.
- [ ] Spaced repetition (FSRS-4.5): use open-spaced-repetition's FSRS algorithm with pretrained default parameters for cold-start; per-user parameter optimization kicks in at ~1,000 reviews per student. (Chosen over SM-2 based on 20-30% fewer reviews at 90% retention target and RMSE 0.04-0.05 vs 0.10+; MIT/BSD license on algorithm repos — not AGPL.)
- [ ] Next-problem selection algorithm: blended priority score combining FSRS review urgency, BKT skill weakness, and novelty bonus, with mood-gated weight shifts and a severely-overdue safety net (cards with R < 0.5 jump to top regardless of other signals). Priority computation emits diagnostic breakdown (fsrs_urgency, bkt_urgency, novelty, mood_applied, final_priority) for debuggability and Phase 4 weight tuning. **See:** `/home/tjokro/general_purpose/ai_office/workers/data/manager/workspace/scheduler_composition_design.md` for the full conflict enumeration and strategy rationale. Final strategy to be ratified in Thursday 2026-04-18 pairing with worker_2 + worker_3.
- [ ] Difficulty parameter seeding: tag all 500+ existing problems with initial difficulty estimates from content team
- [ ] A/B tracking hooks: instrument engine to collect data for future IRT calibration
- [ ] Student ability dashboard: internal tool to visualize θ estimates and knowledge state per student

**Weeks 16-17: Content Expansion & Enhanced Solutions**

- [ ] Content team ramp: hire/contract 1-2 math content creators
- [ ] Expand to 2,000+ problems covering grades 1-6 for primary curriculum market
- [ ] Hint system enhancement: progressive hints with visual aids
- [ ] Step-by-step animated solutions: partner with designer for key topics (fractions, word problems)
- [ ] Curriculum alignment review: verify all content maps correctly to target country's syllabus
- [ ] Problem type expansion: drag-and-drop ordering, matching, multi-step word problems

**Weeks 18-19: Flutter Mobile App v1**

- [ ] Flutter project setup in `apps/mobile/`; configure GoRouter, Riverpod, Dio
- [ ] OpenAPI codegen: generate Dart API client from NestJS Swagger spec (shared contract with web)
- [ ] Core screens: login (username/password + class code), grade/topic selection, problem-solving flow
- [ ] Math rendering: integrate flutter_math_fork for LaTeX display
- [ ] Gamification UI: points display, streak counter, daily challenge, class leaderboard
- [ ] Offline support: Drift/SQLite for caching problem sets; solve offline, sync when connected
- [ ] Flame prototype: one interactive math manipulative (e.g., fraction bar drag-and-drop)
- [ ] Rive animations: correct/incorrect answer character reactions (celebrate, encourage)
- [ ] Audio integration: correct/incorrect sounds, background music toggle
- [ ] Firebase Cloud Messaging: push notification integration for daily challenge reminders
- [ ] App Store / Play Store submission prep: screenshots, descriptions, age rating, privacy policy
- [ ] Device testing matrix: iPhone SE through iPhone 15; Android mid-range through flagship; tablets

**Weeks 20-21: Gamification v2**

- [ ] Badge system: 20+ badge types ("First Perfect Score", "7-Day Streak", "Fraction Master", "100 Problems", etc.); event-driven awarding via BullMQ
- [ ] Missions/Quests: weekly missions ("Solve 20 geometry problems this week"); multi-step progress tracking; mission rewards
- [ ] Avatar shop: spend coins on avatar customization items (hats, outfits, backgrounds, pets); 50+ cosmetic items
- [ ] Lottie reward animations: confetti burst, star shower, level-up celebration, badge unlock
- [ ] Enhanced leaderboards: school-level + class-level; weekly + all-time; "Hero of the Day" spotlight
- [ ] Anti-gaming measures: rate-limit rapid guessing, scale points by difficulty, flag suspicious patterns

**Weeks 22-24: Parent Dashboard & Subscription Payments**

- [ ] Parent dashboard (web): child's skill mastery visualization (heat map or radar chart), time-spent tracking, streak history, recent activity log
- [ ] Weekly email digest for parents: auto-generated summary of child's week (SendGrid + MJML templates)
- [ ] Stripe integration: subscription plans (monthly + annual), free 7-day trial, coupon codes
- [ ] Subscription management: upgrade, downgrade, cancel, payment method update
- [ ] Paywall enforcement: free tier (3 problems/day) vs. premium (unlimited)
- [ ] Apple App Store + Google Play in-app purchase integration (for mobile subscriptions)
- [ ] Invoice generation for school B2B: quote → invoice → payment tracking (manual initially)
- [ ] Beta launch: onboard 3-5 pilot schools + 100 individual beta testers; collect feedback

#### Phase 2 Milestones

| # | Milestone | Success Criteria | Target Date |
|---|-----------|-----------------|-------------|
| M2.1 | Adaptive engine live | Rules-based difficulty + BKT working; internal validation shows appropriate difficulty targeting | Aug 15, 2026 |
| M2.2 | 2K problems | Content library expanded; all problems curriculum-tagged and difficulty-rated | Aug 29, 2026 |
| M2.3 | Mobile app submitted | Flutter app submitted to App Store + Play Store; functional on 10+ device models | Sep 12, 2026 |
| M2.4 | Gamification v2 | Badges, missions, avatar shop, enhanced leaderboards all live | Sep 26, 2026 |
| M2.5 | **Beta launch** | Payments working; pilot schools onboarded; mobile app approved; 500+ active beta users | Oct 17, 2026 |

#### Phase 2 Infrastructure Budget

| Item | Monthly Cost | Phase Total (3 months) |
|------|-------------|----------------------|
| AWS Compute (scaling for beta) | $100 | $300 |
| RDS PostgreSQL (db.t3.medium) | $70 | $210 |
| ElastiCache Redis | $15 | $45 |
| MongoDB Atlas (M10 → M30) | $100 | $300 |
| S3 + CloudFront (increased media) | $30 | $90 |
| Auth0 (free tier, under 7.5K MAU) | $0 | $0 |
| SendGrid (Essentials) | $15 | $45 |
| Stripe fees (~500 subscribers) | $50 | $150 |
| Sentry (free tier) | $0 | $0 |
| Firebase (push, free) | $0 | $0 |
| GitHub Team (8 seats) | $32 | $96 |
| CI/CD (GitHub Actions — more builds) | $15 | $45 |
| Apple Developer Program | $8 (amortized) | $25 |
| CloudWatch | $15 | $45 |
| COPPA certification | $300 | $900 |
| Video hosting (Mux, low volume) | $20 | $60 |
| **Phase 2 Ops Total** | **~$770/mo** | **~$2,311** |

---

### Phase 3: Analytics, Content Depth & School Sales (B2B)

| | |
|---|---|
| **Duration** | 12 weeks (Oct 20, 2026 — Jan 9, 2027) |
| **Calendar** | Months 7-9 |
| **Team Size** | 11 (+1-2 content creators ramped up) |
| **MAU Target** | 2,000-5,000 |
| **Objective** | Rich teacher analytics and reporting. Content library reaches 5,000+ problems. School admin portal with bulk provisioning. B2B licensing capability. |
| **Dependencies** | Phase 2 complete: adaptive engine v1, mobile app live, subscriptions working, pilot school feedback collected |

#### Task List & Deliverables

**Weeks 25-27: Teacher Dashboard v2 — Advanced Analytics**

- [ ] Skill gap heat map: visual matrix showing class mastery by topic (red/yellow/green)
- [ ] At-risk student alerts: flag students below performance thresholds; recommend intervention topics
- [ ] Assignment builder v2: pick specific instructional objectives, set difficulty range, set deadline, preview problem set before assigning
- [ ] Class comparison reports: compare class performance to school average and national benchmarks
- [ ] Item analysis: detailed per-question breakdown (% correct, common wrong answers, time spent)
- [ ] Grouping of mistakes: cluster students by error pattern for targeted reteaching
- [ ] Cross-teacher visibility: teachers can browse assignments created by colleagues in same school
- [ ] GraphQL API layer: flexible dashboard queries via Apollo Server (replacing rigid REST for analytics views)

**Weeks 28-30: Analytics Pipeline & Reporting**

- [ ] Event tracking SDK: instrument web and mobile clients with structured event logging (problem_attempted, badge_earned, session_started, etc.)
- [ ] Event pipeline: client → API → BullMQ → PostgreSQL event tables + aggregation tables
- [ ] Metabase deployment: self-hosted on ECS; connected to PostgreSQL read replica; internal ops dashboards
- [ ] Automated PDF reports: weekly student progress report for parents (Puppeteer server-side rendering)
- [ ] Teacher class report: exportable topic mastery matrix PDF
- [ ] Admin dashboard: DAU/WAU/MAU metrics, license utilization, content effectiveness metrics
- [ ] BigQuery/ClickHouse evaluation: benchmark event query performance; migrate if PostgreSQL aggregations become slow

**Weeks 31-33: Content Depth & Interactive Experiences**

- [ ] Expand to 5,000+ problems with full grade 1-6 coverage for primary curriculum
- [ ] Video solutions for top 100 most-attempted problem types (animated, step-by-step)
- [ ] Interactive manipulatives (web — PixiJS; mobile — Flame): fraction bars, number lines, geometry shape builder, place value blocks
- [ ] Word problem generator: template-based engine that generates arithmetic word problems with variable names/numbers
- [ ] Printable worksheet export: PDF generation from problem sets for offline practice
- [ ] Content effectiveness scoring: track discrimination index per problem; flag low-quality items for review

**Weeks 34-36: B2B School Features**

- [ ] School admin portal: manage teachers, view school-wide analytics, manage student licenses
- [ ] Bulk student provisioning: CSV upload (name, class, grade → auto-create accounts + generate credentials sheet)
- [ ] School-wide analytics: cross-class performance comparison, adoption metrics, engagement trends
- [ ] Google Classroom integration: import class rosters, sync assignment grades
- [ ] Clever SSO integration: single sign-on for US school districts
- [ ] Site licensing (Stripe): school-level subscription (per-student pricing with volume discounts)
- [ ] School onboarding wizard: step-by-step guide for admin to set up school, import teachers, import students
- [ ] Sales collateral: one-pager, demo video, ROI calculator for school decision-makers

#### Phase 3 Milestones

| # | Milestone | Success Criteria | Target Date |
|---|-----------|-----------------|-------------|
| M3.1 | Teacher analytics live | Heat map, at-risk alerts, assignment builder v2, class reports deployed | Nov 7, 2026 |
| M3.2 | Analytics pipeline | Event tracking, Metabase, automated PDF reports operational | Nov 28, 2026 |
| M3.3 | 5K problems | Full curriculum coverage for primary market; interactive manipulatives for 3+ topic areas | Dec 19, 2026 |
| M3.4 | **B2B ready** | School admin portal, bulk provisioning, Clever/Google Classroom SSO, site licensing — first paid school contract signed | Jan 9, 2027 |

#### Phase 3 Infrastructure Budget

| Item | Monthly Cost | Phase Total (3 months) |
|------|-------------|----------------------|
| AWS Compute (scaling to ~5K MAU) | $200 | $600 |
| RDS PostgreSQL (db.r6g.large + read replica) | $300 | $900 |
| ElastiCache Redis (cache.r6g.large) | $200 | $600 |
| MongoDB Atlas (M30) | $300 | $900 |
| S3 + CloudFront (5K MAU media) | $100 | $300 |
| Auth0 (Essentials, approaching paid tier) | $23 | $69 |
| SendGrid (scaling digests) | $15 | $45 |
| Stripe fees (~1K subscribers) | $200 | $600 |
| Sentry Team | $26 | $78 |
| Metabase (self-hosted on ECS) | $30 | $90 |
| Video hosting (Mux) | $50 | $150 |
| GitHub Team (10 seats) | $40 | $120 |
| CI/CD | $20 | $60 |
| CloudWatch + X-Ray | $50 | $150 |
| AWS WAF | $25 | $75 |
| COPPA certification | $300 | $900 |
| Uptime monitoring (UptimeRobot Pro) | $15 | $45 |
| Snyk (security scanning) | $25 | $75 |
| **Phase 3 Ops Total** | **~$1,919/mo** | **~$5,757** |

---

### Phase 4: ML-Powered Adaptive, Social Features & Hardening

| | |
|---|---|
| **Duration** | 12 weeks (Jan 12 — Apr 3, 2027) |
| **Calendar** | Months 10-12 |
| **Team Size** | 11 |
| **MAU Target** | 5,000-10,000 |
| **Objective** | Deploy IRT-based adaptive engine trained on real data. Launch multiplayer/social features. Expand to second curriculum market. Security audit and production hardening. |
| **Dependencies** | Phase 3 complete: 5K+ problems, analytics pipeline collecting response data, B2B infrastructure ready |

#### Task List & Deliverables

**Weeks 37-39: IRT Calibration & ML-Powered Adaptive Engine**

- [ ] Data export: extract all student response data from PostgreSQL (target: 10K+ attempts per problem for reliable calibration). Note: the Phase 2 session-scoped mood modifier design means the P(known) trace per student is clean of mood-induced noise — frustrated-student slip inflation and bored-student guess deflation live in session state, not in the persisted BKT parameters. This yields higher-quality IRT training data than a naive implementation would produce.
- [ ] 2-Parameter Logistic IRT (2PL) model training: Python (pyirt / scikit-learn); estimate difficulty (b) and discrimination (a) per problem
- [ ] Student ability (θ) estimation: EAP (Expected A Posteriori) updated after each response
- [ ] Deploy IRT-based problem selection: serve via API; Node.js runtime consumes exported model parameters
- [ ] A/B test: IRT engine vs. rules-based engine; measure learning gains, engagement, and student satisfaction
- [ ] Monitoring dashboard: track θ distribution, problem utilization, calibration quality metrics
- [ ] Offline model retraining pipeline: scheduled weekly/monthly; auto-export new parameters

**Weeks 40-42: Social & Competitive Features**

- [ ] Peer Challenge: real-time 1v1 math battles (Socket.IO); matchmaking by ability level
- [ ] Class challenges: teacher-initiated live competitions; real-time score display (classroom projector mode)
- [ ] Friend system: add classmates as friends; see friend activity, challenge friends
- [ ] Collaborative missions: team-based weekly goals ("Your team: solve 500 problems together")
- [ ] Enhanced leaderboards: school-level, national, friend-group, challenge-specific
- [ ] Live classroom mode: teacher starts session → students join via code → synchronized problem-solving with live scoreboard
- [ ] Mobile: Flame-based "Math Arena" mini-game for peer challenges (visual, engaging UX)

**Weeks 43-44: Second Curriculum Market & Localization**

- [ ] i18n framework: frontend (next-intl for web, flutter_localizations for mobile), backend (curriculum-tagged content)
- [ ] Second curriculum market: localize content to US Common Core or UK National Curriculum (whichever market research supports)
- [ ] Content adaptation: map existing problems to new curriculum taxonomy; fill gaps with new problems (target: 3,000+ for new market)
- [ ] Expand total library to 8,000+ problems
- [ ] Currency/pricing localization: support USD, GBP, or additional currencies via Stripe

**Weeks 45-46: Performance & Scale Hardening**

- [ ] Load testing: simulate 50K concurrent users; identify and fix bottlenecks
- [ ] Database optimization: add read replicas, query optimization, connection pooling (PgBouncer)
- [ ] CDN optimization: cache hit rate > 95% for static assets
- [ ] Mobile performance audit: startup time < 3s, animation frame rate > 55fps on mid-range devices
- [ ] Redis optimization: leaderboard query time < 50ms at 10K MAU
- [ ] Auto-scaling configuration: ECS auto-scaling based on CPU/memory, scale-to-zero off-peak

**Weeks 47-48: Security & Compliance Audit**

- [ ] Third-party penetration test: engage external security firm; remediate all critical/high findings
- [ ] COPPA compliance audit: verify parental consent flows, data minimization, no behavioral advertising
- [ ] PDPA compliance check (if targeting Singapore)
- [ ] Accessibility audit: WCAG 2.1 AA for web; equivalent mobile accessibility
- [ ] Data encryption verification: PII encrypted at rest (AES-256) and in transit (TLS 1.3)
- [ ] Incident response plan: documented procedure for data breaches, system outages
- [ ] SOC 2 readiness assessment: identify gaps for future certification

#### Phase 4 Milestones

| # | Milestone | Success Criteria | Target Date |
|---|-----------|-----------------|-------------|
| M4.1 | IRT engine deployed | A/B test running; IRT shows measurable improvement over rules-based in learning outcomes or engagement | Jan 30, 2027 |
| M4.2 | Social features live | Peer challenges, friend system, class challenges all functional on web + mobile | Feb 20, 2027 |
| M4.3 | Second market | 3K+ localized problems; platform functional in second curriculum | Mar 7, 2027 |
| M4.4 | **Production-hardened** | Pentest passed (no critical findings), load test passed (50K concurrent), COPPA audit passed, 10K MAU achieved | Apr 3, 2027 |

#### Phase 4 Infrastructure Budget

| Item | Monthly Cost | Phase Total (3 months) |
|------|-------------|----------------------|
| AWS Compute (4x t3.large + ALB) | $350 | $1,050 |
| RDS PostgreSQL (db.r6g.large, read replica) | $450 | $1,350 |
| ElastiCache Redis (cache.r6g.large) | $200 | $600 |
| MongoDB Atlas (M30) | $350 | $1,050 |
| S3 + CloudFront (10K MAU) | $135 | $405 |
| Auth0 (Essentials) | $23 | $69 |
| SendGrid (10K MAU digests) | $15 | $45 |
| Stripe fees (~2K subscribers) | $400 | $1,200 |
| Sentry Team | $26 | $78 |
| Datadog (APM, transitioning from CloudWatch) | $200 | $600 |
| Video hosting (Mux) | $100 | $300 |
| GitHub Team (10 seats) | $40 | $120 |
| CI/CD | $20 | $60 |
| AWS WAF | $25 | $75 |
| COPPA certification | $300 | $900 |
| Penetration test (amortized) | $420 | $1,260 |
| Snyk Team | $25 | $75 |
| Uptime monitoring | $15 | $45 |
| **Phase 4 Ops Total** | **~$3,094/mo** | **~$9,282** |

---

### Phase 5: Growth, AI Features & Scale

| | |
|---|---|
| **Duration** | 24 weeks (Apr 7 — Oct 1, 2027) |
| **Calendar** | Months 13-18 |
| **Team Size** | 11-13 (potential hires for growth) |
| **MAU Target** | 10,000 → 50,000+ |
| **Objective** | Scale user acquisition, add AI-powered features, expand content to 15K+ problems, launch school tournaments and seasonal events, pursue multi-region deployment. |
| **Dependencies** | Phase 4 complete: IRT engine validated, social features live, security hardened, 10K MAU baseline |

#### Task List & Deliverables

**Content & Subjects (Ongoing)**

- [ ] Expand to 15,000+ math problems across all supported curricula
- [ ] Add subject readiness: science readiness content (experiment-based problems, scientific reasoning)
- [ ] Add logic puzzles and brain-training content (non-curriculum, engagement-focused)
- [ ] Partner content integrations: license or co-develop content with educational publishers
- [ ] Content quality pipeline: automated difficulty validation using IRT data; retire low-discrimination problems

**AI-Powered Features**

- [ ] AI-generated hints: LLM-powered contextual hints based on student's specific wrong answer
- [ ] Automated problem generation: template engine + LLM to generate novel arithmetic and word problems
- [ ] Natural language problem input: students can type or speak a math question and get guided help
- [ ] Predictive analytics: at-risk student identification model (flag students likely to disengage within 2 weeks)
- [ ] Learning path recommendations: AI-suggested topic sequences per student based on knowledge gaps

**Engagement & Retention**

- [ ] Seasonal events: "Math Olympics" (quarterly), themed challenges (holiday-based)
- [ ] School tournaments: inter-class and inter-school competitions with real-time leaderboards
- [ ] Parent challenges: parent-child collaborative activities (solve problems together)
- [ ] KooClasses-style progression: structured lesson sequences students unlock by earning credits
- [ ] Expanded avatar shop: 200+ cosmetic items; limited-edition event items

**Platform Expansion**

- [ ] Tablet-optimized web experience (critical for US schools using Chromebooks/iPads)
- [ ] LTI integration for LMS platforms (Canvas, Schoology, Google Classroom deepened)
- [ ] Third curriculum market launch
- [ ] Multi-language UI: support 3-5 languages based on market demand

**Scale & Infrastructure**

- [ ] Multi-region deployment: primary (us-east / ap-southeast) + secondary region for DR
- [ ] Migrate from ECS Fargate to EKS if running 10+ services
- [ ] Database sharding evaluation: horizontal scaling strategy for 100K+ MAU
- [ ] 99.9% SLA target: redundancy, auto-failover, comprehensive monitoring
- [ ] Cost optimization: Reserved Instances, S3 Intelligent Tiering, CDN cache tuning

#### Phase 5 Milestones

| # | Milestone | Success Criteria | Target Date |
|---|-----------|-----------------|-------------|
| M5.1 | 15K problems | Content library complete for 2+ curriculum markets | May 30, 2027 |
| M5.2 | AI features live | LLM-powered hints + automated problem generation in production | Jun 27, 2027 |
| M5.3 | First tournament | Inter-school tournament executed with 10+ schools | Jul 25, 2027 |
| M5.4 | 50K MAU | Organic + paid growth reaches 50K MAU | Sep 5, 2027 |
| M5.5 | **Mature platform** | Multi-region, 99.9% uptime, 3 curriculum markets, 15K+ problems, AI features, tournaments | Oct 1, 2027 |

#### Phase 5 Infrastructure Budget

Costs scale as MAU grows from 10K toward 50-100K:

| Item | Monthly Cost (10K MAU) | Monthly Cost (50K MAU) | Phase Total (6 months, avg) |
|------|----------------------|----------------------|---------------------------|
| AWS Compute | $350 | $1,500 | $5,550 |
| RDS PostgreSQL | $450 | $1,800 | $6,750 |
| ElastiCache Redis | $200 | $800 | $3,000 |
| MongoDB Atlas | $350 | $600 | $2,850 |
| S3 + CloudFront | $135 | $500 | $1,905 |
| Auth0 | $23 | $150 | $519 |
| SendGrid | $15 | $50 | $195 |
| Stripe fees | $500 | $3,000 | $10,500 |
| Sentry | $26 | $80 | $318 |
| Datadog (APM + Logs) | $200 | $400 | $1,800 |
| Video hosting | $100 | $300 | $1,200 |
| AI/LLM API costs (Claude/GPT) | $200 | $1,000 | $3,600 |
| GitHub Team | $40 | $60 | $300 |
| CI/CD | $20 | $40 | $180 |
| WAF + Security | $50 | $100 | $450 |
| COPPA + compliance | $300 | $400 | $2,100 |
| Misc (monitoring, logs, search) | $100 | $300 | $1,200 |
| **Phase 5 Ops Total** | **~$3,059/mo** | **~$11,080/mo** | **~$42,417** |

---

## 5. Infrastructure Budget Summary (All Phases)

### Operational Costs by Phase

| Phase | Duration | Avg Monthly Cost | Phase Total |
|-------|----------|-----------------|-------------|
| **Phase 1** — Foundation & MVP | 3 months | $576 | $1,728 |
| **Phase 2** — Adaptive + Mobile | 3 months | $770 | $2,311 |
| **Phase 3** — Analytics + B2B | 3 months | $1,919 | $5,757 |
| **Phase 4** — ML + Social | 3 months | $3,094 | $9,282 |
| **Phase 5** — Growth & Scale | 6 months | $7,070 (avg) | $42,417 |
| **18-Month Total** | | | **~$61,495** |

### Cumulative Operational Spend

| End of Month | Cumulative Ops Spend | Approximate MAU |
|-------------|---------------------|-----------------|
| Month 3 | $1,728 | 0 (internal only) |
| Month 6 | $4,039 | 500-2,000 |
| Month 9 | $9,796 | 2,000-5,000 |
| Month 12 | $19,078 | 5,000-10,000 |
| Month 18 | $61,495 | 10,000-50,000+ |

*Note: Operational costs exclude all human salaries, content creation labor, marketing, and one-time development costs. These are server/platform running costs only.*

---

## 6. Risk Register

### Phase 1 Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| **Cold start content** — not enough quality problems at launch | High | High | Seed from open-source math banks (OpenStax, Khan Academy CC content); template-based arithmetic problem generation; prioritize grades 1-3 first |
| **COPPA compliance misstep** — incorrect parental consent implementation | Medium | Critical | Engage legal counsel by week 2; use Auth0's age-gating features; implement consent recording from day 1; kidSAFE pre-certification consultation |
| **Scope creep in MVP** — team tries to build too much in 12 weeks | High | Medium | PM strictly enforces phase scope; cut features, not quality; defer all "nice to have" to Phase 2 |
| **Design system delays** — child-friendly UI takes longer than enterprise UI | Medium | Medium | Designer starts week 1 with Figma prototypes; use shadcn/ui as base, customize colors/shapes; accept "good enough" for MVP |

### Phase 2 Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| **App Store rejection** — Apple/Google reject mobile app | Medium | High | Plan 2-4 week review buffer; study rejection reasons for kids' apps (privacy policy, age-gating, in-app purchase rules); submit 2 weeks before target date |
| **Flutter hiring difficulty** — hard to find experienced Flutter dev | Medium | Medium | Start recruiting in Phase 1; Dart is learnable for any TypeScript/Java dev in 2-4 weeks; consider contractor if FTE unavailable |
| **Adaptive engine over-fitting** — rules-based engine makes poor difficulty choices | Medium | Medium | Extensive internal testing before beta; teacher feedback loop; easy override (teacher can manually set difficulty for a student) |
| **Payment integration complexity** — Stripe + App Store IAP dual billing | Medium | Medium | Steer web signups to Stripe (avoids 15-30% Apple/Google commission); app initially links to web for subscription |
| **Beta school churn** — pilot schools lose interest | Medium | High | Weekly check-ins with pilot school teachers; rapid bug-fix cycle; co-design teacher features with pilot feedback |

### Phase 3 Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| **B2B sales cycle** — schools are slow to purchase | High | High | Start conversations in Phase 2; offer free pilot period; align with school budget cycles (Aug-Sep for US, Jan for SG); focus on teacher champions |
| **Analytics pipeline performance** — event volume slows PostgreSQL | Medium | Medium | Read replica for analytics queries; evaluate BigQuery/ClickHouse early; aggregation tables to precompute common metrics |
| **Content quality at scale** — 5K problems but inconsistent quality | Medium | Medium | Peer review workflow in CMS; automated difficulty validation; teacher feedback ratings on problems; discriminative index tracking |
| **Google Classroom / Clever integration delays** — API complexity | Medium | Low | Allot full 3-week sprint; use official SDKs; test with real school accounts early |

### Phase 4 Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| **IRT calibration insufficient data** — not enough response data per problem | Medium | High | Need ~10K attempts per problem; focus calibration on most-used problems first; continue rules-based for low-data problems |
| **Real-time multiplayer scaling** — Socket.IO can't handle concurrent class challenges | Medium | Medium | Load test early in phase; use Redis Pub/Sub for event distribution; consider dedicated WebSocket service extraction |
| **Security audit findings** — penetration test reveals critical vulnerabilities | Medium | High | Budget 2 weeks for remediation; don't launch new features in final 2 weeks of phase; prioritize security fixes over feature work |
| **Second market localization quality** — cultural/curriculum misalignment | Medium | Medium | Partner with local math educators for content review; hire native-speaking content reviewer; iterative validation with local teachers |

### Phase 5 Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| **LLM cost escalation** — AI features (hints, generation) too expensive per-student | High | Medium | Cache common hint patterns; batch problem generation offline; set per-student daily AI usage caps; monitor cost per query |
| **Scaling bottlenecks** — architecture can't handle 100K+ concurrent | Medium | High | Load test continuously; auto-scaling configured; database sharding plan ready; CDN optimization |
| **User engagement plateau** — growth stalls after initial school sales | Medium | High | Seasonal events and tournaments for re-engagement; referral program; parent community features; continuous gamification iteration |
| **Competitor response** — established players (Khan Academy, IXL) add gamification | Medium | Medium | Our differentiator is depth of gamification + Singapore Math pedagogy; stay 12+ months ahead on game mechanics innovation |

---

## 7. Definition of Done (Phase Gates)

Each phase must meet ALL criteria before proceeding to the next. Phase gates are reviewed by Tech Lead + PM + one external stakeholder.

### Phase 1 → Phase 2 Gate

- [ ] **Functional:** Student can register (via parent), login, browse curriculum, solve problems (MCQ + fill-in), receive instant feedback with full solutions, earn points, maintain daily streak, view class leaderboard
- [ ] **Functional:** Teacher can register, create class, add students, create assignments, view basic student progress
- [ ] **Functional:** Parent can register, create child account, link to child, view child's basic activity
- [ ] **Content:** 500+ math problems seeded, tagged by curriculum/grade/topic/difficulty, rendering correctly via KaTeX
- [ ] **Infrastructure:** Staging environment on AWS fully operational; CI/CD pipeline green; Docker Compose local dev working
- [ ] **Auth:** COPPA-compliant auth flow implemented; parental consent recorded; no child email collection
- [ ] **Quality:** Zero critical bugs; < 5 high-severity bugs; API response time p95 < 500ms; page load < 3s
- [ ] **Tested:** 80%+ unit test coverage on business logic; E2E tests covering login, problem-solving, and teacher flows (Playwright)

### Phase 2 → Phase 3 Gate

- [ ] **Functional:** Adaptive engine (rules-based + BKT) selecting appropriate difficulty for students; measurable via internal testing
- [ ] **Functional:** Flutter mobile app live on App Store and Play Store; offline problem caching working
- [ ] **Functional:** Badges (20+), missions, avatar shop with coin spending all operational
- [ ] **Functional:** Parent dashboard showing child progress, skill mastery, time tracking
- [ ] **Functional:** Stripe subscriptions working (trial, monthly, annual, cancellation); free vs. premium paywall enforced
- [ ] **Content:** 2,000+ problems covering grades 1-6 for primary curriculum
- [ ] **Users:** 500+ beta users actively using platform; feedback collected and triaged
- [ ] **Quality:** Mobile app crash rate < 1%; animation frame rate > 55fps on mid-range Android; App Store rating > 4.0

### Phase 3 → Phase 4 Gate

- [ ] **Functional:** Teacher dashboard v2: skill gap heat map, at-risk alerts, assignment builder v2, class comparison reports
- [ ] **Functional:** Analytics pipeline: event tracking, Metabase dashboards, automated PDF reports for parents
- [ ] **Functional:** School admin portal with bulk student provisioning (CSV), school-wide analytics
- [ ] **Functional:** At least one SSO integration live (Google Classroom or Clever)
- [ ] **Functional:** Site licensing (Stripe) with per-student pricing for schools
- [ ] **Content:** 5,000+ problems; video solutions for top 100 problem types; 3+ interactive manipulative types
- [ ] **Revenue:** At least 1 paid school contract signed; subscription revenue growing month-over-month
- [ ] **Users:** 2,000+ MAU; teacher NPS > 30

### Phase 4 → Phase 5 Gate

- [ ] **Functional:** IRT-based adaptive engine deployed and A/B tested; demonstrated improvement over rules-based
- [ ] **Functional:** Peer challenges (1v1), class challenges, friend system operational on web + mobile
- [ ] **Functional:** Second curriculum market live with 3,000+ localized problems
- [ ] **Security:** Third-party penetration test completed; all critical/high findings remediated
- [ ] **Compliance:** COPPA audit passed; PDPA compliance verified (if applicable)
- [ ] **Accessibility:** WCAG 2.1 AA audit completed; major issues resolved
- [ ] **Performance:** Load test passed for 50K concurrent users; p95 API latency < 200ms; uptime > 99.5%
- [ ] **Content:** 8,000+ total problems across 2 curriculum markets
- [ ] **Users:** 10,000 MAU achieved

### Phase 5 Completion Criteria (Mature Platform)

- [ ] 15,000+ problems across 3+ curriculum markets
- [ ] AI features (LLM hints, automated generation) in production
- [ ] School tournament system executed with 10+ schools
- [ ] Multi-region deployment with DR capability
- [ ] 99.9% uptime over 30-day rolling window
- [ ] 50,000+ MAU
- [ ] Positive unit economics (LTV > 3x CAC for individual subscribers)
- [ ] NPS > 40 (parents), NPS > 30 (teachers)

---

## 8. Key Decisions Log

Track important decisions made during the project so future team members understand *why*.

| Date | Decision | Rationale | Alternatives Considered |
|------|----------|-----------|------------------------|
| 2026-04-16 | Flutter for mobile (not React Native) | Superior animation performance (Impeller), Flame game engine for mini-games, Rive interactive animations — critical for gamified kids' UX | React Native — better code sharing with Next.js web, larger hiring pool; rejected because animation/game quality is the core differentiator |
| 2026-04-16 | Modular monolith (not microservices) | 8-person team can't manage 8+ services from day 1; NestJS modules enforce boundaries; easy extraction later | Microservices from start — rejected for team size; Serverless (Lambda) — rejected for real-time requirements |
| 2026-04-16 | PostgreSQL + MongoDB (not single DB) | PostgreSQL for relational data (users, payments, progress); MongoDB for flexible problem schemas (varied question types, embedded hints/solutions) | PostgreSQL only (JSONB for problems) — viable but less flexible for content team; DynamoDB — rejected for cost unpredictability |
| 2026-04-16 | Math-only launch (not multi-subject) | Koblio built 7 years of math before expanding to 4 subjects; depth > breadth for initial market credibility | Launch with Math + Science — rejected to keep content creation manageable in Phase 1-2 |
| 2026-04-16 | Rules-based adaptive first (not ML from start) | IRT requires ~10K responses per problem for calibration; rules-based works well for MVP and collects training data | Deploy IRT from day 1 — rejected due to cold-start data problem |
| 2026-04-16 | FSRS-4.5 for spaced repetition (not SM-2) | 20-30% fewer reviews than SM-2 at 90% retention target; RMSE on predicted retention 0.04-0.05 vs 0.10+ for SM-2; pretrained defaults degrade gracefully for new users (<1,000 reviews); MIT/BSD license on algorithm repos (Anki app is AGPL but algorithm implementations are permissive — confirmed with worker_2 research) | SM-2 — simpler (~50 LOC vs ~500) but meaningfully worse retention prediction; FSRS complexity is encapsulated so integration cost is low |
| 2026-04-16 | Session-scoped BKT mood modifiers for all three observation params (P(T), P(G), P(S)); P(L0) excluded | Prevents a frustrated session's elevated slip rate from permanently corrupting the skill's population-calibrated baseline (and analogously for P(G) deflation under boredom, P(T) deflation under confusion). The invariant — effective = base + modifier at read time, only base is persisted — keeps the BKT latent state representing actual knowledge, not emotional noise. Originally flagged for P(T) only (worker_1), generalized to P(S) and P(G) (worker_2's nudge), formalized into a concrete skill+session data schema with clamping [0.01, 0.99], 60-min inactivity lifecycle, and separate mood_classification_events append-only table for trajectory analytics (worker_3). | (a) Persisting mood-adjusted params — rejected because it corrupts population-calibrated baselines across students and sessions. (b) Session-scoping only P(T) — rejected because the same corruption risk applies equally to P(G) and P(S). (c) Applying modifiers at the scheduler/classifier layer instead of BKT service — rejected because it violates single-source-of-truth for BKT internals and invites double-clamping bugs. |

---

*This is a living document. Update it as decisions are made, risks materialize, and timelines adjust. Review at every phase gate.*
