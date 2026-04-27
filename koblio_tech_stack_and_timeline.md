# EdTech Platform Technical Architecture & Development Timeline
## Koblio-Style Math Learning Platform (K-6, Gamified, Adaptive)

**Date:** 2026-04-16  
**Scope:** Full-stack architecture for an online math learning platform with gamification, adaptive learning, curriculum-aligned content, leaderboards, and parent/teacher dashboards.

---

## Table of Contents

1. [Frontend](#1-frontend)
2. [Backend](#2-backend)
3. [Database](#3-database)
4. [Content & Curriculum Engine](#4-content--curriculum-engine)
5. [Gamification Engine](#5-gamification-engine)
6. [Analytics & Dashboards](#6-analytics--dashboards)
7. [Infrastructure](#7-infrastructure)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [Third-Party Services](#9-third-party-services)
10. [Development Timeline](#10-development-timeline)
11. [Appendix A: Flutter vs React Native Analysis](#appendix-a-flutter-vs-react-native-analysis)

---

## 1. Frontend

### 1.1 Web Application

| Component | Recommendation | Rationale |
|-----------|---------------|-----------|
| **Framework** | **Next.js 15 (React 19)** | SSR for SEO (marketing pages), app router for dashboard SPAs, massive ecosystem, strong hiring pool |
| **Language** | **TypeScript** | Type safety across the entire frontend; catches bugs early in math content rendering |
| **State Management** | **Zustand** + **TanStack Query** | Zustand for client state (game state, UI), TanStack Query for server state (API caching, optimistic updates) |
| **Styling** | **Tailwind CSS** + **shadcn/ui** | Rapid development, consistent design system, accessible components out of the box |
| **Animation/Gamification** | **Framer Motion** + **Lottie** + **PixiJS** | Framer Motion for UI transitions; Lottie for pre-built reward animations (stars, confetti); PixiJS for interactive math manipulatives and mini-games |
| **Math Rendering** | **KaTeX** | Fast client-side LaTeX rendering for math expressions, significantly faster than MathJax |
| **Canvas/Drawing** | **Fabric.js** or **Konva.js** | For interactive geometry problems, drag-and-drop activities, drawing tools |

### 1.2 Mobile Application

| Component | Recommendation | Rationale |
|-----------|---------------|-----------|
| **Approach** | **Flutter (Dart)** | Cross-platform (iOS + Android) from a single codebase; Impeller rendering engine delivers pixel-perfect, jank-free animations critical for gamification; built-in widget system ideal for custom child-friendly UI; strong offline/local storage ecosystem |
| **Navigation** | **GoRouter** | Declarative routing with deep linking support for parent-shared progress links; type-safe route parameters |
| **Animations** | **Rive** + **Lottie (lottie package)** + **Flutter Animate** | Rive for interactive stateful animations (avatars, reward sequences, character reactions); Lottie for simpler pre-built animations (confetti, stars); Flutter's built-in `AnimationController` for fine-grained UI transitions |
| **Game Engine** | **Flame** | Flutter-native 2D game engine for Brain Games, interactive math manipulatives, drag-and-drop geometry activities, and mini-games; supports sprites, physics, collision detection, and Lottie/Rive integration |
| **Math Rendering** | **flutter_math_fork** | Pure Dart port of KaTeX parser — renders LaTeX math expressions natively without WebView; supports selectable/copyable equations |
| **Offline Support** | **Drift** (SQLite) | Type-safe reactive SQLite database for offline problem-solving; auto-generated query API from schema; syncs when back online — critical for students with spotty internet |
| **State Management** | **Riverpod** + **Dio** | Riverpod for app state (game state, UI); Dio for HTTP/API layer with caching and interceptors |

> **Why Flutter over React Native for this project — see [Appendix A](#appendix-a-flutter-vs-react-native-analysis) for detailed comparison.**

### 1.3 Design Principles for K-6

- Large touch targets (min 48x48dp), colorful and rounded UI, minimal text input (multiple choice, drag-drop, tap)
- Audio feedback for correct/incorrect answers
- Avatar system with customizable characters
- Age-appropriate UX: simplified navigation for younger students (K-2), more structured for older (3-6)

---

## 2. Backend

### 2.1 API & Language

| Component | Recommendation | Rationale |
|-----------|---------------|-----------|
| **Language** | **Node.js (TypeScript)** | Shared language with frontend (full-stack TypeScript), excellent async I/O for real-time features, large package ecosystem |
| **API Framework** | **NestJS** | Enterprise-grade structure (modules, guards, interceptors), built-in OpenAPI/Swagger docs, dependency injection, excellent for microservices later |
| **API Style** | **REST** (primary) + **GraphQL** (dashboards) | REST for simple CRUD and mobile; GraphQL (via Apollo Server) for complex dashboard queries where teachers/parents need flexible data views |
| **Real-time** | **Socket.IO** (via NestJS gateway) | Live leaderboard updates, multiplayer challenges, real-time classroom sessions |

### 2.2 Architecture: Modular Monolith → Microservices

**Start with a Modular Monolith** and extract services as scale demands:

```
┌─────────────────────────────────────────────────────────┐
│                    API Gateway (NestJS)                  │
│   ┌──────────┬──────────┬───────────┬────────────────┐  │
│   │  Auth     │ Content  │ Gamifi-   │  Analytics     │  │
│   │  Module   │ Engine   │ cation    │  Module        │  │
│   │          │ Module   │ Module    │                │  │
│   ├──────────┼──────────┼───────────┼────────────────┤  │
│   │  User    │ Adaptive │ Classroom │  Notification  │  │
│   │  Module  │ Learning │ Module    │  Module        │  │
│   │          │ Module   │           │                │  │
│   └──────────┴──────────┴───────────┴────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Why modular monolith first:**
- A 5-10 person team cannot efficiently manage 8+ microservices from day one
- Monolith is faster to develop, debug, and deploy initially
- NestJS modules enforce boundaries; extraction to microservices later is straightforward
- Extract the **Content Engine** and **Analytics** modules first when scale demands (these are the most resource-intensive)

### 2.3 Key Backend Services (Modules)

| Module | Responsibility |
|--------|---------------|
| **Auth** | Registration, login, session management, role-based access |
| **User** | Student profiles, parent/teacher accounts, school/class management |
| **Content Engine** | Problem storage, retrieval, curriculum mapping, difficulty tagging |
| **Adaptive Learning** | Item Response Theory (IRT) engine, student ability estimation, next-problem selection |
| **Gamification** | Points, badges, streaks, leaderboards, rewards shop |
| **Classroom** | Teacher class management, assignments, live sessions |
| **Analytics** | Event ingestion, performance metrics, report generation |
| **Notification** | Email, push, in-app notifications |

---

## 3. Database

### 3.1 Primary Relational Database

| Component | Recommendation | Rationale |
|-----------|---------------|-----------|
| **Database** | **PostgreSQL 16** | ACID compliance for financial (subscriptions) and user data; JSONB columns for semi-structured data; excellent full-text search; mature ecosystem |
| **ORM** | **Prisma** | Type-safe queries matching TypeScript stack, schema migrations, visual studio (Prisma Studio) for debugging |

**Core relational tables:**
- `users` (students, parents, teachers, admins)
- `schools`, `classrooms`, `enrollments`
- `subscriptions`, `payments`
- `student_problem_attempts` (foreign key to problems, timestamped)
- `badges_earned`, `points_ledger`
- `assignments`, `assignment_submissions`

### 3.2 Content Store (NoSQL)

| Component | Recommendation | Rationale |
|-----------|---------------|-----------|
| **Database** | **MongoDB Atlas** | Flexible schema for math problems (varied question types: MCQ, fill-in, drag-drop, multi-step); embedded documents for hints, solutions, media references; easy to query by curriculum tags |

**Problem document structure:**
```json
{
  "_id": "prob_2a3f",
  "curriculum": { "country": "SG", "grade": 3, "topic": "fractions", "subtopic": "comparing_fractions" },
  "difficulty": { "irt_difficulty": 1.2, "irt_discrimination": 0.8, "level_label": "intermediate" },
  "question": {
    "type": "multiple_choice",
    "stem_html": "Which fraction is larger?",
    "stem_latex": "\\frac{3}{4} \\text{ or } \\frac{2}{3}",
    "media": [{ "type": "image", "url": "s3://content/fractions/compare_01.png" }],
    "options": ["3/4", "2/3", "They are equal"],
    "correct_index": 0
  },
  "solution": {
    "steps_html": ["Step 1: Find common denominator...", "Step 2: Compare numerators..."],
    "video_url": "s3://content/solutions/vid_2a3f.mp4"
  },
  "hints": ["Think about what number both 4 and 3 divide into evenly."],
  "tags": ["problem-solving", "heuristic:draw-model"],
  "created_at": "2026-01-15",
  "status": "published"
}
```

### 3.3 Caching Layer

| Component | Recommendation | Rationale |
|-----------|---------------|-----------|
| **Cache** | **Redis 7 (via Upstash or ElastiCache)** | Leaderboard sorted sets (O(log N) rank lookups); session storage; rate limiting; caching hot content (daily challenge problems); pub/sub for real-time events |

**Key Redis usage patterns:**
- `ZSET` for leaderboards (`leaderboard:school:{id}:weekly`)
- `HASH` for session data and student streak tracking
- `SET` for daily problem-of-the-day cache
- TTL-based caching for curriculum metadata (changes infrequently)

### 3.4 Search

| Component | Recommendation | Rationale |
|-----------|---------------|-----------|
| **Search** | **Meilisearch** (or Typesense) | Fast, typo-tolerant search for problem library (teachers searching for problems by topic); lighter weight than Elasticsearch for this scale |

---

## 4. Content & Curriculum Engine

### 4.1 Content Management

- **Admin CMS** (custom-built in Next.js): Content creators author problems via a rich editor with LaTeX preview, image upload, and metadata tagging
- **Curriculum Taxonomy:** Country → Grade → Strand (e.g., Numbers, Geometry) → Topic → Subtopic → Skill
- **Content Versioning:** MongoDB document versioning; never delete, only deprecate (students may have historical attempts linked to old problems)
- **Bulk Import:** CSV/JSON import tool for migrating existing problem banks

### 4.2 Adaptive Difficulty Algorithm

**Recommended approach: Item Response Theory (IRT) + Knowledge Tracing**

```
┌─────────────────────────────────────────────────────┐
│              Adaptive Learning Pipeline              │
│                                                     │
│  1. Student answers problem                         │
│  2. Update student ability estimate (θ) via IRT     │
│  3. Update knowledge state per skill (BKT/DKT)     │
│  4. Select next problem:                            │
│     - Target difficulty ≈ student θ (zone of        │
│       proximal development)                         │
│     - Prioritize weak skills                        │
│     - Mix in review problems (spaced repetition)    │
│     - Respect curriculum sequence constraints       │
│  5. Adjust if student is struggling (3+ wrong →     │
│     easier) or cruising (5+ correct → harder)       │
└─────────────────────────────────────────────────────┘
```

**Algorithm details:**

| Component | Method | Notes |
|-----------|--------|-------|
| **Item difficulty calibration** | 2-Parameter Logistic IRT (2PL) | Each problem has difficulty (b) and discrimination (a) parameters, calibrated from student response data |
| **Student ability estimation** | EAP (Expected A Posteriori) | Updated after each response; starts at grade-level prior |
| **Knowledge tracing** | Bayesian Knowledge Tracing (BKT) per skill | Tracks P(known) for each curriculum skill; simpler and more interpretable than Deep Knowledge Tracing for K-6 |
| **Problem selection** | Maximize information gain | Pick the problem whose difficulty is closest to current θ, weighted by skill weakness and spaced repetition schedule |
| **Spaced repetition** | SM-2 variant | Problems answered correctly return for review at increasing intervals |

**Implementation:** Start with a rules-based engine (difficulty buckets + spaced repetition), then layer on IRT once you have sufficient response data (~10K+ attempts per problem for calibration). Use Python (scikit-learn, pyirt) for offline model training; export parameters to the Node.js runtime.

### 4.3 Content Delivery

- Math problem assets (images, audio, video solutions) stored in **S3** with **CloudFront CDN**
- Problems served via API with client-side rendering (KaTeX for math)
- Video solutions streamed via adaptive bitrate (HLS) for low-bandwidth scenarios

---

## 5. Gamification Engine

### 5.1 Core Mechanics

| Mechanic | Implementation |
|----------|---------------|
| **Points (Coins)** | Earned per correct answer (scaled by difficulty); stored in `points_ledger` table (append-only for auditability) |
| **XP & Levels** | XP accumulates; levels unlock at thresholds (100, 300, 600, 1000...); displayed as progress bar |
| **Streaks** | Daily login + problem-solving streak; tracked in Redis; bonus multiplier at 7, 30, 100 days |
| **Badges** | Event-driven: "First Perfect Score", "100 Problems Solved", "Fraction Master"; stored as `badges_earned` rows |
| **Leaderboards** | School-level, class-level, national; weekly reset; Redis sorted sets; show top 10 + student's rank |
| **Avatar Shop** | Spend coins on avatar customization (hats, outfits, backgrounds); cosmetic only |
| **Daily Challenge** | One curated problem per grade per day; bonus coins for completion |
| **Missions/Quests** | Weekly missions ("Solve 20 geometry problems"); multi-step progress tracking |

### 5.2 Architecture

```
Event Bus (Redis Pub/Sub or Bull queue)
    │
    ├── Student answers problem correctly
    │   ├── Award points → points_ledger
    │   ├── Update leaderboard ZSET
    │   ├── Check badge conditions → award if met
    │   ├── Update streak counter
    │   └── Update mission progress
    │
    └── Events are processed asynchronously (BullMQ job queue)
        to avoid blocking the problem-solving UX
```

### 5.3 Anti-Gaming Measures

- Rate limit problem attempts (prevent rapid guessing for points)
- Points scale with difficulty; trivial problems give minimal reward
- Leaderboard shows score based on weighted-correct, not raw volume
- Flag accounts with statistically impossible accuracy patterns

---

## 6. Analytics & Dashboards

### 6.1 Event Pipeline

```
Client (web/mobile)
    │ (event tracking SDK)
    ▼
API Server → Event Queue (BullMQ/Redis)
    │
    ▼
Event Processor → PostgreSQL (raw events) + Aggregation Tables
    │
    ▼
Dashboard API (GraphQL) → Teacher/Parent/Admin Dashboards
```

### 6.2 Key Metrics Tracked

**Student-level:**
- Problems attempted / correct / incorrect (by topic, difficulty, date)
- Time spent per problem, per session
- Skill mastery levels (from BKT model)
- Learning velocity (improvement rate over time)
- Streak history, engagement frequency

**Class-level (Teacher Dashboard):**
- Class average performance by topic
- Students struggling (below threshold) — flagged for intervention
- Assignment completion rates
- Engagement trends (weekly active students)
- Skill gap heat map (which topics need more class time)

**School/Admin-level:**
- Adoption metrics (DAU, WAU, MAU)
- License utilization
- Cross-class performance comparison
- Content effectiveness (which problems have high discrimination)

### 6.3 Dashboard Tech

| Component | Recommendation | Rationale |
|-----------|---------------|-----------|
| **Teacher/Parent Dashboard** | Built into Next.js app (dedicated routes) | Unified codebase; GraphQL queries for flexible data |
| **Charts** | **Recharts** or **Nivo** | React-native charting; Nivo for rich interactive visualizations |
| **Admin Analytics** | **Metabase** (self-hosted) | Connect directly to PostgreSQL read replica; no-code dashboard builder for ops team; cheaper than Looker |
| **Data Warehouse** (Phase 3+) | **BigQuery** or **ClickHouse** | When event volume exceeds what PostgreSQL handles; columnar storage for analytical queries |

### 6.4 Reports

- **Student Progress Report** (PDF export for parents): weekly/monthly; auto-generated via server-side PDF (Puppeteer or react-pdf)
- **Teacher Class Report**: topic mastery matrix, at-risk student alerts
- **Comparative Reports**: student vs. class average, class vs. national average

---

## 7. Infrastructure

### 7.1 Cloud Provider

| Component | Recommendation | Rationale |
|-----------|---------------|-----------|
| **Primary Cloud** | **AWS** | Broadest service catalog; best for EdTech compliance (COPPA, PDPA); well-supported in Asia (Koblio is SG-based); strong education sector presence |
| **Alternative** | **GCP** if team prefers Firebase integration; Azure if targeting school districts using Microsoft ecosystem |

### 7.2 Compute & Orchestration

| Component | Recommendation | Rationale |
|-----------|---------------|-----------|
| **Compute (MVP)** | **AWS ECS Fargate** | Serverless containers; no cluster management; scale to zero in off-peak hours (students sleep!) |
| **Compute (Scale)** | **AWS EKS (Kubernetes)** | Migrate when running 10+ services; better multi-service orchestration |
| **Serverless Functions** | **AWS Lambda** | PDF report generation, image processing, webhook handlers |

### 7.3 Storage & CDN

| Component | Recommendation |
|-----------|---------------|
| **Object Storage** | AWS S3 (problem images, videos, user avatars) |
| **CDN** | AWS CloudFront (global edge caching; critical for serving media to students across regions) |
| **Database Hosting** | AWS RDS (PostgreSQL) + MongoDB Atlas (managed) |
| **Cache** | AWS ElastiCache (Redis) or Upstash (serverless Redis) |

### 7.4 CI/CD Pipeline

```
GitHub (monorepo)
    │
    ├── PR opened → GitHub Actions:
    │   ├── Lint (ESLint, Prettier)
    │   ├── Type check (tsc)
    │   ├── Unit tests (Vitest)
    │   ├── Integration tests (Testcontainers)
    │   ├── E2E tests (Playwright) — critical user flows
    │   └── Preview deployment (Vercel preview or ECS staging)
    │
    ├── Merge to main → Auto-deploy to staging
    │
    └── Release tag → Deploy to production (blue-green via ECS)
```

| Tool | Purpose |
|------|---------|
| **GitHub Actions** | CI/CD orchestration |
| **Turborepo** | Monorepo build caching (web app, backend, shared packages); Flutter app in separate directory with its own build pipeline |
| **Docker** | Containerize backend services |
| **Terraform** | Infrastructure as Code (IaC) |
| **Vercel** | Optional: host the Next.js web app for simplicity |

### 7.5 Monitoring & Observability

| Component | Recommendation | Rationale |
|-----------|---------------|-----------|
| **APM** | **Datadog** or **New Relic** | Full-stack observability; distributed tracing |
| **Error Tracking** | **Sentry** | Real-time error alerts for both web and mobile |
| **Logging** | **AWS CloudWatch** + **Datadog Logs** | Centralized log aggregation |
| **Uptime** | **Better Uptime** or **Checkly** | Synthetic monitoring for critical paths (login, problem loading) |
| **Alerting** | **PagerDuty** or Datadog Alerts | On-call rotation for production incidents |

### 7.6 Environments

| Environment | Purpose |
|-------------|---------|
| **Local** | Docker Compose with all services |
| **Staging** | Mirror of production; auto-deployed from `main` |
| **Production** | Blue-green deployment; multi-AZ |

---

## 8. Authentication & Authorization

### 8.1 Auth Strategy

| Component | Recommendation | Rationale |
|-----------|---------------|-----------|
| **Auth Provider** | **Auth0** (or **Clerk** for faster integration) | COPPA-compliant; supports passwordless, social login, MFA; handles token management |
| **Session** | **JWT** (access token, 15min) + **Refresh token** (httpOnly cookie, 7d) | Stateless API auth; refresh tokens stored in Redis for revocation |

### 8.2 Student-Safe Authentication

- **Young students (K-2):** Class code + picture password (grid of images) or teacher-initiated session; no email required
- **Older students (3-6):** Username + password (set by parent/teacher) or QR code login
- **No direct email collection from children under 13** (COPPA compliance)
- **Parent/Teacher consent flow:** Parent creates child account; consent recorded and auditable

### 8.3 Role-Based Access Control (RBAC)

| Role | Permissions |
|------|------------|
| **Student** | Solve problems, view own progress, use avatar shop, see class leaderboard |
| **Parent** | View linked children's progress, manage subscription, approve account changes |
| **Teacher** | Manage classes, create assignments, view class analytics, add/remove students |
| **School Admin** | Manage teachers, view school-wide analytics, manage licenses |
| **Content Admin** | Create/edit/publish problems, manage curriculum taxonomy |
| **System Admin** | Full access; user management; system configuration |

### 8.4 Data Privacy

- **COPPA** (US): Parental consent for under-13; minimal data collection; no behavioral advertising
- **PDPA** (Singapore): Consent-based data processing; data access/correction rights
- **GDPR** (EU, if expanding): Right to deletion, data portability, DPO appointment
- All PII encrypted at rest (AES-256) and in transit (TLS 1.3)
- Student data never shared with third parties for non-educational purposes

---

## 9. Third-Party Services

### 9.1 Payments

| Service | Use Case |
|---------|----------|
| **Stripe** | Subscription billing (monthly/annual plans); parent payment portal; coupon/trial management; handles SCA/3DS for global payments |
| **Stripe Billing** | Plan management, invoicing, dunning (failed payment retry) |

### 9.2 Email

| Service | Use Case |
|---------|----------|
| **SendGrid** or **Postmark** | Transactional email (welcome, password reset, assignment notifications); parent weekly progress digest; Postmark for higher deliverability |
| **MJML** | Email template framework (responsive, cross-client) |

### 9.3 Push Notifications

| Service | Use Case |
|---------|----------|
| **Firebase Cloud Messaging** (mobile) | Daily challenge reminders, streak-at-risk alerts, assignment due dates; native Flutter support via `firebase_messaging` package |
| **OneSignal** (web + mobile) | Alternative with built-in segmentation and A/B testing; Flutter SDK available |

### 9.4 Media & Content

| Service | Use Case |
|---------|----------|
| **AWS S3 + CloudFront** | Image/video hosting and delivery |
| **Mux** or **AWS MediaConvert** | Video processing for solution videos (transcoding, adaptive bitrate) |
| **Imgix** or **Cloudinary** | On-the-fly image resizing/optimization for problem images |

### 9.5 Other Integrations

| Service | Use Case |
|---------|----------|
| **LaunchDarkly** or **Unleash** | Feature flags for gradual rollout, A/B testing gamification mechanics |
| **Intercom** or **Crisp** | In-app support chat for parents/teachers |
| **Google Classroom API** | LTI integration for schools using Google Classroom |
| **Clever SSO** | Single sign-on for US school districts |

---

## 10. Development Timeline

### Team Composition (8-person core team)

| Role | Count | Responsibility |
|------|-------|---------------|
| **Tech Lead / Architect** | 1 | Architecture decisions, code review, backend lead |
| **Senior Full-Stack** | 2 | Backend modules + web frontend |
| **Frontend Developer** | 1 | Web app, animations, gamification UI |
| **Mobile Developer** | 1 | Flutter app (Dart) |
| **ML / Algorithm Engineer** | 1 | Adaptive learning, IRT calibration, analytics |
| **Designer (UI/UX)** | 1 | Child-friendly UI, gamification assets, UX research |
| **QA Engineer** | 1 | Test automation, manual testing, device testing |

Plus part-time: DevOps contractor, content creator(s), product manager.

---

### Phase 1: Foundation & MVP Core (Months 1-3)

**Goal:** Students can log in, solve problems, and earn points. Teachers can create classes.

| Week | Deliverables |
|------|-------------|
| **1-2** | Project setup: monorepo (Turborepo), CI/CD pipeline, Docker Compose local dev, PostgreSQL + MongoDB + Redis provisioned, Auth0 tenant configured, design system kickoff |
| **3-4** | Auth module: student login (username/password), parent registration + child account creation, teacher registration, RBAC middleware |
| **5-6** | Content engine: MongoDB problem schema, admin CMS for problem creation (basic), seed 500+ problems across grades 1-6, KaTeX rendering on frontend |
| **7-8** | Problem-solving UX: student selects topic → solves problems → sees correct/incorrect feedback; multiple question types (MCQ, fill-in-the-blank); basic difficulty buckets (easy/medium/hard) |
| **9-10** | Gamification v1: points for correct answers, daily streak tracking, simple leaderboard (class level), basic avatar selection |
| **11-12** | Teacher dashboard v1: create class, add students, view class roster, assign problem sets; basic student progress view (problems attempted, % correct by topic) |

**MVP Deliverable:** Functional web app where students solve math problems, earn points, maintain streaks. Teachers manage classes and see basic progress. Parent accounts linked to children.

---

### Phase 2: Adaptive Learning & Mobile (Months 4-6)

**Goal:** Problems adapt to student level. Mobile app launched. Richer gamification.

| Week | Deliverables |
|------|-------------|
| **13-15** | Adaptive engine v1: rules-based difficulty adjustment (3 wrong → easier, 5 right → harder); BKT per skill; spaced repetition for review problems |
| **16-17** | Content expansion: 2,000+ problems; curriculum alignment to target market(s); hint system; step-by-step solutions |
| **18-19** | Mobile app v1 (Flutter): login, problem solving, points/streaks; offline problem caching (Drift/SQLite); Flame-based interactive math manipulatives |
| **20-21** | Gamification v2: badges system (20+ badge types), missions/quests (weekly), avatar shop with coin spending, animations (Lottie) for rewards |
| **22-24** | Parent dashboard: view child's progress, skill mastery visualization, time-spent tracking, weekly email digest; subscription/payment flow (Stripe) |

**Phase 2 Deliverable:** Adaptive problem selection, iOS/Android apps, badges and missions, parent dashboard with subscriptions, 2,000+ problems.

---

### Phase 3: Analytics, Content Depth & School Sales (Months 7-9)

**Goal:** Rich analytics for teachers. Enough content depth for full curriculum coverage. B2B school licensing.

| Week | Deliverables |
|------|-------------|
| **25-27** | Teacher dashboard v2: skill gap heat map, at-risk student alerts, assignment builder (pick topics/difficulty/deadline), class comparison reports |
| **28-30** | Analytics pipeline: event tracking, BigQuery/ClickHouse integration, automated weekly/monthly PDF reports for parents, Metabase for internal ops |
| **31-33** | Content depth: 5,000+ problems, video solutions for key topics, interactive manipulatives (PixiJS) for geometry/fractions, word problem generator (template-based) |
| **34-36** | B2B features: school admin portal, bulk student provisioning (CSV upload), school-wide analytics, Google Classroom/Clever SSO integration, site licensing (Stripe) |

**Phase 3 Deliverable:** Comprehensive teacher analytics, deep content library, school/district sales capability, interactive problem types.

---

### Phase 4: Advanced Adaptive & Engagement (Months 10-12)

**Goal:** ML-powered adaptation. Social/competitive features. Polish and scale.

| Week | Deliverables |
|------|-------------|
| **37-39** | IRT calibration: train 2PL model on accumulated response data; deploy IRT-based problem selection; A/B test vs. rules-based engine |
| **40-42** | Social features: class challenges (live multiplayer math battles), friend system, peer leaderboards, collaborative missions |
| **43-44** | Content: 8,000+ problems; second curriculum market (e.g., expand from Singapore to US Common Core or UK National Curriculum); localization framework (i18n) |
| **45-46** | Performance & scale: load testing (target 50K concurrent), database read replicas, CDN optimization, mobile app performance audit |
| **47-48** | Security audit, penetration testing, COPPA/PDPA compliance audit, accessibility audit (WCAG 2.1 AA) |

**Phase 4 Deliverable:** ML-powered adaptive learning, multiplayer features, multi-market content, production-hardened for scale.

---

### Phase 5: Growth & Optimization (Months 13-18)

**Goal:** Scale user acquisition, optimize retention, expand content.

| Focus Area | Deliverables |
|------------|-------------|
| **Content** | 15,000+ problems; additional subjects (science readiness, logic puzzles); partner content integrations |
| **AI Features** | AI-generated hints (LLM-powered); natural language problem input; automated problem generation from templates |
| **Engagement** | Seasonal events (Math Olympics), school tournaments, parent challenges |
| **Platform** | Tablet-optimized web app, Chromebook support (critical for US schools), LTI integration for LMS platforms |
| **Analytics** | Predictive models (at-risk student identification), learning path recommendations, content effectiveness scoring |
| **Scale** | Multi-region deployment (US, EU, Asia), 99.9% SLA, 100K+ concurrent user capacity |

---

### Timeline Summary

| Phase | Duration | Key Milestone |
|-------|----------|---------------|
| **Phase 1: MVP** | Months 1-3 | Students solving problems, earning points, teachers managing classes |
| **Phase 2: Adaptive + Mobile** | Months 4-6 | Adaptive difficulty, mobile apps, subscriptions, parent dashboard |
| **Phase 3: Analytics + B2B** | Months 7-9 | Rich teacher analytics, 5K+ problems, school licensing |
| **Phase 4: ML + Social** | Months 10-12 | IRT-powered adaptation, multiplayer, multi-market, security hardened |
| **Phase 5: Growth** | Months 13-18 | 15K+ problems, AI features, tournaments, multi-region scale |

**Total to production-ready platform: ~12 months**  
**Total to mature platform with growth features: ~18 months**

---

## Architecture Diagram (High-Level)

```
                            ┌──────────────┐
                            │   CloudFront  │
                            │     (CDN)     │
                            └──────┬───────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
              ┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐
              │  Next.js   │ │  Flutter  │ │  Static   │
              │  Web App   │ │  Mobile   │ │  Assets   │
              │ (Vercel)   │ │  App      │ │  (S3)     │
              └─────┬─────┘ └─────┬─────┘ └───────────┘
                    │              │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  API Gateway  │
                    │   (NestJS)    │
                    │  + Socket.IO  │
                    └──────┬───────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
   ┌─────▼─────┐   ┌──────▼──────┐   ┌─────▼─────┐
   │ PostgreSQL │   │   MongoDB   │   │   Redis    │
   │ (Users,    │   │  (Problems, │   │ (Cache,    │
   │  Progress, │   │   Content)  │   │  Sessions, │
   │  Payments) │   │             │   │  Boards)   │
   └───────────┘   └─────────────┘   └───────────┘
         │
   ┌─────▼──────┐
   │  BigQuery/  │
   │ ClickHouse  │
   │ (Analytics) │
   └────────────┘
```

---

## Cost Estimates (Monthly, at Scale ~10K active students)

| Service | Estimated Monthly Cost |
|---------|----------------------|
| AWS ECS Fargate | $300-500 |
| RDS PostgreSQL (db.r6g.large) | $200-300 |
| MongoDB Atlas (M30) | $300-400 |
| ElastiCache Redis | $100-150 |
| S3 + CloudFront | $50-150 |
| Auth0 (B2C) | $200-500 |
| SendGrid | $50-100 |
| Sentry | $30-80 |
| Datadog (APM) | $200-400 |
| Stripe fees | 2.9% + 30¢ per transaction |
| **Total infrastructure** | **~$1,500-2,500/mo** |

*Costs scale with usage; initial MVP phase will be significantly lower (~$200-400/mo).*

---

## Key Technical Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| **Cold start content:** Not enough problems at launch | Seed with open-source math problem banks (OpenStax, Khan Academy CC content); template-based problem generation for arithmetic |
| **Adaptive engine accuracy** | Start rules-based; IRT requires ~10K responses per problem for reliable calibration; A/B test before full rollout |
| **COPPA compliance complexity** | Use Auth0's age-gating; engage legal counsel early; keep children's PII in separate, encrypted datastore |
| **Mobile app store approval** | Plan for 2-4 week review cycles; Apple's strict rules on in-app purchases for subscriptions (30% fee); Flutter apps have strong App Store track record |
| **Teacher adoption** | Keep teacher UX dead simple; provide onboarding wizard; 1-click class setup; CSV student import |
| **Offline/low-bandwidth** | Drift (SQLite) for offline; progressive image loading; text-first problem rendering with lazy media |

---

*This document provides the technical foundation for building a Koblio-style EdTech platform. Architecture decisions favor pragmatism (modular monolith, managed services) to maximize velocity for a small team, with clear migration paths to more complex architectures as the platform scales.*

---

## Appendix A: Flutter vs React Native Analysis

### Why This Decision Matters

The mobile app is the primary student interaction surface for a Koblio-style platform. Children ages 6-12 interact through touch-heavy, animation-rich, game-like experiences. The mobile framework choice directly impacts: animation smoothness (gamification feel), interactive math manipulative quality, mini-game capability, and the overall "fun factor" that drives daily engagement.

### Head-to-Head Comparison for This Use Case

#### 1. Animation & Rendering Performance

| Criteria | Flutter | React Native | Winner |
|----------|---------|-------------|--------|
| **Rendering engine** | Impeller (custom GPU renderer) — renders directly to canvas, bypasses platform UI entirely | Native platform components via JSI bridge (New Architecture) | **Flutter** |
| **Animation stress test** | Handles 1500+ simultaneous animated elements smoothly (benchmarked 2025) | Significant improvement with New Architecture, but still lags behind Flutter under heavy animation load | **Flutter** |
| **Jank elimination** | Impeller pre-compiles all shaders at build time — zero runtime shader compilation jank | Improved with Fabric renderer, but bridge-related frame drops still possible under load | **Flutter** |
| **Pixel-perfect control** | Full control over every pixel; custom rendering pipeline | Delegates to native components; custom rendering requires dropping to native Canvas APIs | **Flutter** |
| **60/120fps consistency** | Designed to always hit target frame rate; single-threaded UI with isolates for heavy work | Achievable but requires careful optimization of JS thread workload | **Flutter** |

**Verdict:** For a gamified kids' app with coin animations, badge unlocks, leaderboard celebrations, confetti effects, animated characters, and interactive math problems running simultaneously — Flutter's rendering engine is materially superior. This is the single biggest factor in this decision.

#### 2. Game Engine & Interactive Content

| Criteria | Flutter | React Native | Winner |
|----------|---------|-------------|--------|
| **2D Game Engine** | **Flame** — mature, Flutter-native; sprites, physics, collision detection, particle effects; perfect for Brain Games and math mini-games | No native equivalent; must use react-native-game-engine (less mature) or drop to native code | **Flutter** |
| **Interactive animations** | **Rive** — interactive stateful animations with logic (state machines for avatar reactions, reward sequences); first-class Flutter support | Rive available but Flutter is Rive's primary target; Lottie only (no state machine logic) | **Flutter** |
| **Drag-and-drop manipulatives** | Built-in `Draggable`/`DragTarget` widgets + Flame for complex interactions (geometry tools, fraction bars, number lines) | `react-native-gesture-handler` + `react-native-reanimated`; functional but more boilerplate | **Flutter** |
| **Canvas drawing** | `CustomPainter` — first-class, performant; ideal for geometry drawing tools | `react-native-skia` (Shopify) — capable but adds dependency | **Slight Flutter edge** |

**Verdict:** Flame alone is a decisive advantage. Building "Brain Games" (memory, reflexes, cognitive training) and interactive math manipulatives (drag fraction pieces, draw geometry shapes, animate number lines) in Flame is dramatically simpler than the RN equivalent. Rive's interactive state machines (e.g., animated character celebrates → dances → shows trophy, all driven by score state) are far richer than static Lottie files.

#### 3. Math Rendering (LaTeX/KaTeX)

| Criteria | Flutter | React Native | Winner |
|----------|---------|-------------|--------|
| **Primary package** | `flutter_math_fork` — pure Dart port of KaTeX parser; renders natively without WebView | `react-native-katex` or WebView-based rendering | **Flutter** |
| **Performance** | Native widget rendering; no bridge overhead | WebView-based solutions have overhead; native solutions less mature | **Flutter** |
| **Selectable/copyable** | `SelectableMath` widget built in | Requires custom implementation | **Flutter** |
| **Ecosystem depth** | `flutter_tex`, `latext`, `catex` — multiple alternatives | Fewer dedicated math rendering packages | **Flutter** |

**Verdict:** Functional parity. Both can render LaTeX math. Flutter's `flutter_math_fork` being a direct KaTeX port in pure Dart is slightly cleaner (no WebView dependency).

#### 4. Code Sharing with Web (Next.js/React)

| Criteria | Flutter | React Native | Winner |
|----------|---------|-------------|--------|
| **Language overlap** | Dart (mobile) vs TypeScript (web) — no code sharing | TypeScript everywhere — shared types, validation, business logic | **React Native** |
| **Component reuse** | None between web and mobile | React Native Web enables some component sharing; Solito/Expo Router for navigation | **React Native** |
| **Shared packages** | API client types, validation schemas must be duplicated or auto-generated (OpenAPI codegen) | Direct sharing via monorepo `packages/shared` | **React Native** |
| **Monorepo integration** | Flutter app lives as separate directory; different build tooling | Turborepo manages web + mobile + shared packages seamlessly | **React Native** |

**Verdict:** React Native wins this clearly. However, the practical impact is smaller than it appears:
- **UI components rarely share well** between web (mouse, large screen) and mobile (touch, small screen) for a kids' app where interaction paradigms are fundamentally different
- **Shared business logic** (validation, API types, constants) can be handled via OpenAPI codegen (generate Dart client from the same OpenAPI spec that generates TypeScript client) — ~2-4 hours of setup, then automatic
- **The web app is primarily for teachers/parents** (dashboards, admin); the **mobile app is primarily for students** (gamified learning). These are different UX paradigms that share little UI code regardless of framework

#### 5. Offline Support

| Criteria | Flutter | React Native | Winner |
|----------|---------|-------------|--------|
| **Local database** | **Drift** — type-safe SQLite with code generation, reactive queries, migrations | **WatermelonDB** — reactive, lazy-loaded SQLite; designed for offline-first | **Tie** |
| **Alternative** | Hive (key-value), ObjectBox, Isar | MMKV (key-value), Realm | **Tie** |
| **Sync patterns** | Manual sync implementation; Drift supports complex queries for delta sync | WatermelonDB has built-in sync protocol | **Slight RN edge** |

**Verdict:** Near parity. WatermelonDB's built-in sync protocol is a minor advantage, but Drift's type-safe query builder and code generation are excellent. Either is sufficient for caching math problems offline.

#### 6. Developer Ecosystem & Hiring

| Criteria | Flutter | React Native | Winner |
|----------|---------|-------------|--------|
| **Developer pool size** | Dart developers are ~5% of JS/TS developers | JavaScript is the world's most popular language; ~20x more JS devs than Dart | **React Native** |
| **Hiring difficulty** | Harder to find experienced Flutter devs; Dart is less common | Much easier; any React dev can ramp up on RN | **React Native** |
| **GitHub popularity** | 170K stars; higher growth rate | 121K stars; massive existing ecosystem | **Flutter** (momentum) |
| **Learning curve** | Dart is easy to learn for any typed-language dev; widget system is intuitive | Familiar for React devs; RN-specific patterns (bridge, native modules) add complexity | **Tie** |
| **Package ecosystem** | pub.dev — growing rapidly; strong animation/game packages | npm — vastly larger; but many packages don't support RN | **Tie for mobile** |

**Verdict:** React Native has a larger hiring pool. However, Dart is straightforward for any developer with Java/Kotlin/TypeScript experience. For a team of 8, finding 1 Flutter developer is not a significant hiring challenge — and dedicated Flutter devs often have stronger animation/UI skills specifically because they chose Flutter for those capabilities.

#### 7. Child-Friendly UI Capabilities

| Criteria | Flutter | React Native | Winner |
|----------|---------|-------------|--------|
| **Custom widget shapes** | Trivial with `CustomPainter`, `ClipPath` — rounded, bubbly, organic shapes that appeal to kids | Possible but requires more effort; SVG-based or native modules | **Flutter** |
| **Touch target customization** | Full control over hit testing regions | Standard touch targets; custom shapes need workarounds | **Flutter** |
| **Audio feedback** | `audioplayers` package; Flame has built-in audio for games | `react-native-sound`; functional but less integrated with animation pipeline | **Flutter** |
| **Haptic feedback** | Built-in `HapticFeedback` class | `react-native-haptic-feedback`; works well | **Tie** |
| **Accessibility** | `Semantics` widget system; good screen reader support | Leverages native platform accessibility; strong support | **Tie** |

**Verdict:** Flutter's ability to create custom-shaped, colorful, bubbly UI elements that feel like a game rather than an app is a meaningful advantage for a K-6 audience.

#### 8. Long-Term Maintainability

| Criteria | Flutter | React Native | Winner |
|----------|---------|-------------|--------|
| **Backing** | Google (strong commitment; used in Google Pay, Google Classroom) | Meta (strong commitment; used in Facebook, Instagram, Ads Manager) | **Tie** |
| **Breaking changes** | Less frequent; Dart is more stable | Historically more churn (New Architecture migration was painful); stabilizing now | **Slight Flutter edge** |
| **OTA Updates** | Not natively supported; requires app store submission for updates | Expo OTA updates, CodePush — update JS bundle without app store | **React Native** |
| **Build times** | Hot reload is excellent; release builds can be slow | Hot reload good; Hermes engine improved startup times | **Tie** |

**Verdict:** React Native's OTA update capability (ship bug fixes without app store review) is a genuine operational advantage. Flutter requires Shorebird (third-party, paid) for equivalent functionality. For a kids' app where parents control updates, this matters less than for a consumer app.

### Summary Scorecard

| Category | Flutter | React Native | Weight for This Project |
|----------|---------|-------------|------------------------|
| Animation/rendering performance | ★★★★★ | ★★★☆☆ | **Critical** (gamification is the core UX) |
| Game engine (mini-games, manipulatives) | ★★★★★ | ★★☆☆☆ | **Critical** (Brain Games, interactive math) |
| Interactive animation (Rive) | ★★★★★ | ★★★☆☆ | **High** (avatar reactions, reward sequences) |
| Math rendering (LaTeX) | ★★★★☆ | ★★★★☆ | **High** (core content display) |
| Code sharing with web | ★★☆☆☆ | ★★★★★ | **Medium** (web=dashboards, mobile=student UX; different paradigms) |
| Offline support | ★★★★☆ | ★★★★☆ | **Medium** |
| Hiring pool | ★★★☆☆ | ★★★★★ | **Medium** (need 1 mobile dev, not 10) |
| Child-friendly custom UI | ★★★★★ | ★★★☆☆ | **High** (K-6 audience expects game-like feel) |
| OTA updates | ★★☆☆☆ | ★★★★★ | **Low-Medium** (kids' app; parents manage updates) |
| Long-term stability | ★★★★☆ | ★★★★☆ | **Medium** |

### Recommendation: **Flutter**

For a gamified math learning app targeting children ages 6-12 — where animation quality, interactive manipulatives, mini-games, and a "game not homework" feel are the primary differentiators — **Flutter is the stronger choice**. The Impeller rendering engine, Flame game engine, and Rive interactive animations provide capabilities that are materially harder to achieve in React Native.

The main trade-off is losing TypeScript code sharing with the Next.js web app. This is mitigated by:
1. **OpenAPI codegen** — generate both TypeScript and Dart API clients from the same spec
2. **Shared schema validation** — define once in the backend, generate client types for both platforms
3. **Different UX paradigms** — the student mobile experience and teacher/parent web dashboards share very little UI code regardless of framework
4. **Repo structure** — Flutter app lives in `apps/mobile/` alongside the monorepo; shares API contracts, not code

### Timeline Impact

Switching to Flutter adds **0-2 weeks** to Phase 2 (mobile app development) if the mobile developer is already experienced with Flutter. If hiring a React dev and training on Flutter, add **2-4 weeks** ramp-up. The Flame game engine actually **saves time** on interactive math activities and Brain Games compared to building equivalent functionality from scratch in React Native.
