# KooBits Platform Handoff Package

**Target reader:** The external development team receiving this package.
**Package date:** 2026-04-17
**Platform target:** MVP in ~12 months (production-ready), mature platform at 18 months.

---

## 1. What You're Building

A **gamified, adaptive math learning platform for primary/elementary students (Grades K-6, ages 6-12)**, modeled on the proven approach of KooBits Learning (the Singapore-based incumbent). The platform combines curriculum-aligned math content with deep gamification mechanics — points, badges, streaks, leaderboards, avatar customization, brain-training mini-games, and daily challenges — to make practice feel like play.

It serves **three user types**: students (via Flutter mobile app and Next.js web), teachers (class management, assignment creation, analytics dashboards), and parents (child progress tracking, subscription management). The backend is a NestJS modular monolith backed by PostgreSQL, MongoDB, and Redis, hosted on AWS.

**MVP scope:** Grades 1-3 on **US Common Core (CCSS-M)** — chosen over Singapore MOE because the US K-6 TAM is ~60× larger, open content licensing (Illustrative Mathematics, OpenStax) collapses the content cold-start problem, and direct confrontation with KooBits in their home market is avoidable (see `koobits_curriculum_package.md`). Singapore MOE + Grades 4-6 is the **Phase 3-4 expansion**. Target: **10,000 MAU by month 12**, architecture to support 100K+.

**Key architectural decisions already locked** (see §6 for references): Flutter mobile (not React Native), modular monolith (not microservices), PostgreSQL + MongoDB (not single-DB), FSRS-4.5 for spaced repetition (not SM-2), BKT with session-scoped mood modifiers, blended priority scheduler composing FSRS + BKT. These are documented in the Key Decisions Log of the development plan — **do not re-litigate them** unless you have new information the decisions didn't consider.

---

## 2. Reading Order by Role

| Your role | Start here (in order) | Total read time |
|-----------|----------------------|-----------------|
| **Tech Lead / Architect** | README → tech_stack_and_timeline → development_plan → scheduler_composition_design → openapi.yaml → handoff_readiness_audit | ~2-3 hours |
| **Product Manager** | README → product_analysis → development_plan → scheduled_task_plan → handoff_readiness_audit | ~2 hours |
| **Frontend / Mobile Dev** | README → tech_stack_and_timeline §1 + §9 → openapi.yaml → design_brief → development_plan Phase 1-2 tasks | ~2 hours |
| **Backend Dev** | README → tech_stack_and_timeline §2-§6 → openapi.yaml → scheduler_composition_design → development_plan → scheduled_task_plan (Phase 1-2 tickets) | ~3 hours |
| **DevOps / SRE** | README → procurement_checklist → tech_stack_and_timeline §7 → development_plan (infrastructure tasks) → openapi.yaml (for API routing) | ~1.5 hours |
| **Content / Curriculum Team** | README → curriculum_package → development_plan §P1-T14 through §P1-T16 → scheduled_task_plan content tickets | ~2 hours |
| **Designer** | README → design_brief (full) → product_analysis (user archetypes) → development_plan §P1-T08 | ~1.5 hours |
| **Legal / Compliance Owner** | README → legal_compliance_package (full) → procurement_checklist §Tier 1 item #4, #5 | ~2 hours |
| **Operations / Procurement** | README → procurement_checklist (full, with Week -4 → Week 0 sequence) → budget_estimation | ~1.5 hours |
| **Everyone, Day 1** | README + handoff_readiness_audit + relevant role doc above | ~45 min |

---

## 3. Document Index

Files are in the same directory as this README.

### 3.1 Product & Business Context

#### 📘 `koobits_product_analysis.md` (~15K, ~300 lines)

**What it is:** Research report on KooBits Learning (the reference platform we're modeled on). Covers company background (founded 2007 Singapore), user base (250K+ MAU, 2/3 of Singapore primary schools), product features, curriculum coverage, business model, competitors (Geniebook, Matholia, IXL, Khan Academy, Prodigy), and differentiation strategy.

**Key sections:** Company Background; Product Features; Business Model; Competitors & Differentiation.

**Who needs this:** PM, Tech Lead, Designer — to understand the reference product. Founder/business team for positioning.

**When it matters:** Day 1 context-setting; revisit when product decisions need reference to the incumbent's playbook.

---

### 3.2 Technical Architecture & Plan

#### 📗 `koobits_tech_stack_and_timeline.md` (~48K, ~780 lines)

**What it is:** Full technical architecture reference. Technology choices for every layer with justifications; module boundaries; database schemas; auth strategy; deployment topology; CI/CD; monitoring. Includes **Appendix A: Flutter vs React Native Analysis** (why Flutter was chosen).

**Key sections:** Frontend (web + mobile); Backend (NestJS modular monolith); Database (PostgreSQL + MongoDB + Redis); Content & Curriculum Engine; Gamification Engine; Analytics & Dashboards; Infrastructure (AWS); Authentication & Authorization (Auth0 + COPPA-safe flows); Third-Party Services.

**Who needs this:** Everyone technical. Authoritative source for "what technology" questions.

**When it matters:** Before any code is written. Revisit whenever a new service is being integrated.

---

#### 📙 `koobits_development_plan.md` (~50K, ~710 lines)

**What it is:** The 18-month, 5-phase execution plan with milestones, risks, phase gates, and a Key Decisions Log. This is the **master plan** — every other doc supports or refines it.

**Key sections:** Project Overview; Team Composition; Tech Stack Reference Table; **Phase Breakdown** (Phase 1 MVP Core → Phase 5 Growth & Scale) with per-phase task lists, milestones, and infrastructure budgets; **Risk Register** (per-phase risks with mitigations); **Definition of Done (Phase Gates)**; **Key Decisions Log**.

**Who needs this:** Everyone. Tech Lead, PM, and Founder must internalize the full plan. Individual contributors should know the Phase 1-2 task lists and their role's specific tickets.

**When it matters:** Every day. Phase gates (M1.6, M2.5, M3.4, M4.4, M5.5) are review checkpoints.

---

#### 📕 `koobits_scheduled_task_plan.md` (~82K, ~1350 lines)

**What it is:** 108 tasks broken out of the development plan into ticket-ready detail — prerequisites, durations, priorities, roles, sprint mapping, acceptance criteria, and automation hooks. Designed to be directly importable into Jira / Linear.

**Key sections:** Phase 1 Tasks (34 fully-detailed tickets); Phase 2 Tasks (22 tickets, including **P2-T02 BKT with mood-scoped modifiers** and **P2-T03 FSRS-4.5** — the "gold standard" fully-specced tasks); Phase 3-5 Tasks (summary tables); **Dependency Graph**; **Critical Path Analysis**; **Sprint Mapping** (S1-S36 across 18 months); **Milestone Checkpoints**; **Automation Hooks**; **Risk Flags & Buffer Recommendations**.

**Who needs this:** PM for ticket creation. Tech Lead for sprint planning. All ICs for their specific tickets.

**When it matters:** Sprint planning, ticket estimation, phase kickoffs.

---

#### 📔 `scheduler_composition_design.md` (~22K, ~370 lines) — *optional but critical for adaptive engine work*

**What it is:** Design doc for how FSRS (per-card retention) and BKT (per-skill mastery) compose in the scheduler when they disagree. Full conflict enumeration (3×3 state matrix), three resolution strategies with rationale, and a recommended decision: **Strategy C+D — blended priority score with mood-gated weight shifts and a "R<0.5 safety net" override**. Includes cold-start diagnostic mode, signed novelty bonus, structured `decision_trace` schema with top-N candidates for counterfactual replay in Phase 4.

**Who needs this:** Backend dev implementing the adaptive engine (Phase 2 weeks 13-15), ML engineer, Tech Lead.

**When it matters:** Phase 2 adaptive engine sprint. Refer when modifying next-problem selection logic.

---

### 3.3 API & Integration

#### 📒 `koobits_openapi.yaml` (~45K, ~1000 lines)

**What it is:** OpenAPI 3.1 skeleton spec covering Phase 1 + Phase 2 + key Phase 3 endpoints. Defines the canonical contract between frontend/mobile/backend. Includes: request/response schemas, auth requirements, RFC 7807 error envelope, Bearer JWT security, examples.

**Key endpoint groups:** Auth (register/login/refresh/reset for 3 role types); Users/Profiles; Content/Curriculum; **Adaptive Engine** (including `/adaptive/next-problem` with full `decision_trace`); Gamification; Classrooms/Assignments; Dashboard/Analytics; Billing (incl. Stripe webhook); School Admin.

**Who needs this:** Backend (implement), Frontend (consume), Mobile (OpenAPI codegen → Dart client), QA (contract testing).

**When it matters:** Day 1 — it unblocks parallel frontend/backend/mobile work. **Unblocks P2-T07 (Dart codegen).**

---

### 3.4 Cost, Operations, Risk

#### 📓 `koobits_budget_estimation.md` (~23K, ~360 lines)

**What it is:** Operational server/SaaS cost estimation by MAU scale. Does NOT include salaries, content creation labor, or marketing — infrastructure and SaaS operating costs only. Broken into 1K / 10K / 100K MAU tiers across 5 phases. Includes LOW/MEDIUM/HIGH estimate ranges.

**Key sections:** Cloud Infrastructure Costs (compute, DB, cache, CDN, etc.); Third-Party SaaS Services; Domain/SSL/CI-CD/Compliance; Monthly & Annual Summary Tables; 18-month cumulative spend.

**18-month infrastructure-only operational spend: ~$61,495.** *Note: `procurement_checklist.md` includes additional SaaS + team tooling that brings true monthly burn to ~$900/mo at Phase 1.*

**Who needs this:** Founder, CFO, DevOps (for cost-aware infrastructure decisions), Operations.

**When it matters:** Fundraising conversations, quarterly budget reviews, cost-optimization decisions.

---

#### 📕 `koobits_procurement_checklist.md` (~17K, ~360 lines)

**What it is:** Every account, service, credential, and procurement item the dev team needs BEFORE Day 1 coding. Organized into 4 priority tiers by lead time and Day-1-blocker status.

**Key sections:** **Tier 1 Critical** (business entity, D-U-N-S, Apple Developer, legal counsel, kidSAFE — 2-6 week lead times); **Tier 2 Urgent** (AWS, GitHub org, Auth0, Stripe, domain, SendGrid, Sentry, Figma — Week -1 blockers); **Tier 3 Needed within 2-4 weeks** (MongoDB Atlas, Google Workspace, Play Console, Firebase); **Tier 4 Deferred** (Twilio, Datadog, Mux, Clever SSO, pentest, LLM APIs); **Week -4 → Week 0 execution sequence**; Red flags to catch; Monthly cost summary (~$903/mo at Phase 1 true burn).

**Who needs this:** Founder, DevOps, Operations, PM. **If you read only one Day-1 document, read this one.**

**When it matters:** Starts Day -28 (four weeks before project kickoff). Do not start coding until Tier 2 is complete.

---

#### 📘 `koobits_handoff_readiness_audit.md` (~17K, ~340 lines) — *optional but recommended Day 1 read*

**What it is:** A critical self-audit of this entire handoff package assessing whether a new dev team could execute it. Dimension-by-dimension scoring (Green/Yellow/Red) with top-5 gaps to address. Verdict was **YELLOW** at time of writing; the curriculum_package, legal_compliance_package, design_brief, openapi.yaml, and procurement_checklist were produced specifically to close 4 of the 5 identified blockers.

**Why read it:** Gives you an honest map of what's well-specced vs. what still needs stakeholder input. Helps you triage early questions.

**When it matters:** Day 1, to calibrate expectations.

---

### 3.5 Content, Design, Legal (the pre-handoff unblockers)

#### 📗 `koobits_curriculum_package.md` (~57K, ~900 lines)

**What it is:** Resolves the "which curriculum market?" blocker from the handoff audit. Argues for and commits to **US Common Core (CCSS-M)** for MVP, with Singapore MOE as Phase 3-4 expansion. Provides the **Grade 1-3 skill taxonomy (78 skills)** in CMS-ready format, sample problems, quality guidelines, and a scaling sourcing plan.

**Key sections:** Market Decision & Rationale; Grade 1-3 Skill Taxonomy (CCSS-M domains: OA, NBT, NF, MD, G); Sample Problems (showing the quality bar); Content Authoring Style Guide; Content Sourcing Plan (Illustrative Mathematics, OpenStax K-8, Open Up Resources — all CC BY 4.0); Review & Quality Assurance Workflow.

**Who needs this:** Content team, PM, Backend (for MongoDB schema tags), Tech Lead.

**When it matters:** Phase 1 Week 5 onward (P1-T14, P1-T15, P1-T16). Day 1 for content team hiring.

---

#### 📙 `koobits_design_brief.md` (~51K, ~850 lines)

**What it is:** Brand direction + 6 low-fidelity wireframes of the core screens. Communicates layout, hierarchy, and copy intent — not final visual design. Designer is expected to translate these into high-fidelity Figma comps.

**Key sections:** **Brand Direction** ("my friend who happens to be good at math" — playful but not childish); **Color Palette** (primary `#2E6FF2`, success `#1FA672`, amber `#F5A623`, soft red `#E5566B`, gold `#FFD036`); Typography; Iconography; Illustration Direction; Motion Guidelines; **6 Wireframes** (Student Login, Daily Home, Problem-Solving, Reward/Celebration, Parent Dashboard, Teacher Dashboard).

**Who needs this:** Designer (for high-fidelity comps), Frontend, Mobile, PM.

**When it matters:** Day 1 for Designer (P1-T08). Frontend Weeks 2+.

---

#### 📔 `koobits_legal_compliance_package.md` (~34K, ~570 lines)

**What it is:** **Specification** for what legal artifacts must contain — **NOT drafted legal documents**. This is a dev-facing spec that tells engineering what to build and tells counsel what to draft. **Counsel engagement is still required.**

**Key sections:** Regulatory Landscape (COPPA, GDPR-K, CCPA/CPRA, state laws, PIPEDA); **COPPA Requirements** (Verifiable Parental Consent, data classification, what CANNOT be collected); **GDPR-K Requirements**; Data Inventory & Classification; Privacy Policy Structure; Terms of Service Structure; **Parental Consent Flow Specification** (the auth flow must implement this); Data Subject Rights Implementation; Incident Response & Breach Notification; Third-Party Processor List & DPAs; **When to Engage Counsel**.

**Who needs this:** Legal counsel (as the spec to draft against), Backend dev (implementing auth/consent flows), PM, Founder.

**When it matters:** Week -2 (engage counsel from this spec). Phase 1 Week 3-4 (P1-T07, P1-T10, P1-T12 auth flows implement from this).

---

## 4. Critical Path & Day-1 Actions

### 4.1 Before Day 1 (Week -4 to Week -1)

**Do not start coding until these are complete.** All from `koobits_procurement_checklist.md`.

- [ ] **Week -4:** File business entity; apply for D-U-N-S number; engage legal counsel (they start drafting from `koobits_legal_compliance_package.md`); apply for Apple Developer Program (2-4 week lead time); start kidSAFE application.
- [ ] **Week -2:** Open AWS, GitHub org, Auth0 tenant, Stripe account, SendGrid, Sentry, Figma team; register domain; configure DNS.
- [ ] **Week -1:** Grant credentials via team password manager (1Password/Bitwarden); dry-run Terraform provisioning; receive first draft of privacy policy and ToS from counsel.

### 4.2 Week 1

- [ ] **Tech Lead:** Read `development_plan.md` and `scheduled_task_plan.md` top-to-bottom. Walk through `scheduler_composition_design.md` with backend lead. Kickoff Phase 1 tasks P1-T01 through P1-T09.
- [ ] **PM:** Import the 34 Phase 1 tickets from `scheduled_task_plan.md` into Jira/Linear. Assign owners. Schedule sprint 1.
- [ ] **Backend:** Review `openapi.yaml`. Scaffold NestJS app (P1-T03). Set up Prisma with initial schemas per tech_stack_and_timeline §3.
- [ ] **Frontend:** Review `design_brief.md`. Scaffold Next.js app (P1-T02). Begin design system work from the color palette and typography specs.
- [ ] **DevOps:** Execute Terraform provisioning (P1-T05), GitHub Actions setup (P1-T06), Sentry integration (P1-T09).
- [ ] **Content Team:** Begin content sourcing from Illustrative Mathematics (CC BY 4.0) using `curriculum_package.md` skill taxonomy.
- [ ] **Designer:** Convert the 6 wireframes in `design_brief.md` into high-fidelity Figma comps. Target completion: end of Week 2.
- [ ] **Legal/Compliance:** Counsel completes privacy policy + ToS draft using `legal_compliance_package.md` as the spec.

### 4.3 What NOT to Skip Even If It Seems Optional

- 🚫 **Do not skip Apple Developer enrollment in Week -4.** It has a 2-4 week lead time (longer with D-U-N-S wait); if you skip it and start coding, mobile app submission will stall Phase 2.
- 🚫 **Do not skip the `scheduler_composition_design.md` read before starting Phase 2.** The FSRS+BKT composition has subtle failure modes that the doc enumerates. Skipping this will produce a scheduler that passes unit tests but fails pedagogically.
- 🚫 **Do not skip the Key Decisions Log read in `development_plan.md`.** Re-opening locked decisions (Flutter vs RN, FSRS vs SM-2) wastes 1-2 weeks of meetings. The decisions were made with substantive technical debate already.
- 🚫 **Do not skip legal counsel engagement.** The `legal_compliance_package.md` is a SPEC — it is not a substitute for attorney review. Launching auth flows without counsel-approved consent language risks COPPA fines up to $43K per violation.
- 🚫 **Do not skip the `decision_trace` telemetry in the adaptive engine.** It is mentioned in `scheduler_composition_design.md` §Observability. It costs ~5 extra DB rows per decision but enables Phase 4 weight tuning without running live A/B tests. Retrofitting it later is painful.

---

## 5. Known Open Items — Not Covered by This Package

The package is a **spec**, not a running system. These items require stakeholder (client) input or resources outside this package:

| Open Item | Owner required | Blocks |
|-----------|---------------|--------|
| **Actual drafted privacy policy + Terms of Service** | COPPA-literate legal counsel | Auth flows (P1-T07, P1-T10, P1-T12) |
| **High-fidelity visual designs** (beyond the 6 wireframes in the design brief) | Designer, 2-3 weeks post-kickoff | Polished frontend UX (P1-T13+) |
| **Character art & avatar illustrations** (6-8 avatars for MVP, expanding to 50+ shop items later) | Illustrator, ~2 weeks | Avatar selection (P1-T26), Avatar shop (P2-T15) |
| **Content writers hiring + first 500 problems authored** | Math curriculum hire | P1-T16 (content seed) |
| **Business entity formation** | Founder + business counsel | Everything (per procurement checklist Tier 1) |
| **Product naming, brand identity, logo** | Product marketing | Launch |
| **Pricing strategy validation** (monthly/annual, free tier limits) | Founder + product | P2-T19 (Stripe integration) |
| **School pilot partnerships** (3-5 schools needed for beta) | Business dev | Phase 2 beta launch (M2.5) |
| **Founder/team decisions on Phase 5 AI budget caps** (LLM API costs) | Founder + ML engineer | Phase 5 (P5-T02, P5-T03) |

---

## 6. Key Decisions Already Made

**Do not re-litigate these.** Each has been debated and documented.

| Decision | Choice | Reasoning | Documented in |
|----------|--------|-----------|---------------|
| **Mobile framework** | Flutter (Dart) | Superior animation performance (Impeller), Flame game engine for mini-games, Rive interactive animations — critical for gamified kids' UX | `tech_stack_and_timeline.md` Appendix A; `development_plan.md` Key Decisions Log |
| **Backend architecture** | Modular monolith (NestJS) | 8-person team can't efficiently manage 8+ microservices from day 1; NestJS modules enforce boundaries with clean extraction paths | `tech_stack_and_timeline.md` §2.2; Key Decisions Log |
| **Databases** | PostgreSQL + MongoDB + Redis | PostgreSQL for relational (users/payments/progress); MongoDB for flexible problem schemas; Redis for leaderboards/sessions/streaks | `tech_stack_and_timeline.md` §3; Key Decisions Log |
| **MVP curriculum market** | US Common Core (CCSS-M), Grades 1-3 | 60× larger TAM than Singapore, open content licensing, avoids direct KooBits confrontation in SG | `curriculum_package.md` §1 |
| **Spaced repetition algorithm** | FSRS-4.5 (not SM-2) | 20-30% fewer reviews than SM-2 at 90% retention; RMSE 0.04-0.05 vs 0.10+; MIT/BSD licensed | `development_plan.md` §P2-T03; Key Decisions Log |
| **Adaptive engine approach** | Rules-based → BKT → IRT (staged) | IRT requires ~10K responses per problem for calibration; rules-based for MVP collects training data | Key Decisions Log |
| **BKT mood modifier model** | Session-scoped modifiers on P(T), P(G), P(S) — not P(L0); clamp [0.01, 0.99] in BKT service; 60-min inactivity lifecycle | Prevents frustrated-session slip-rate inflation from corrupting per-skill population baseline | Key Decisions Log; `scheduler_composition_design.md` §Strategy D |
| **FSRS + BKT composition** | Strategy C+D: blended priority (w_f × fsrs_urgency + w_b × bkt_urgency + novelty_bonus) with mood-gated weight shifts and R<0.5 safety net | Pure-FSRS neglects weak skills; pure-BKT lets retention decay; blended handles all 9 state cells cleanly | `scheduler_composition_design.md` |
| **Default scheduler weights** | 0.5 / 0.5 (neutral) | No empirical data to prefer 0.4/0.6 or 0.55/0.45; tune in Phase 4 via counterfactual replay from `decision_trace` top-N candidate telemetry | `scheduler_composition_design.md` §Thursday decisions |
| **Auth provider** | Auth0 | COPPA-compliant configuration; SSO/SAML for schools (Phase 3) | `tech_stack_and_timeline.md` §8; `legal_compliance_package.md` |
| **Payment provider** | Stripe + Stripe Billing | Subscription billing, SCA/3DS, dunning for failed payments; Paddle considered for Phase 5 international | `tech_stack_and_timeline.md` §9.1 |
| **Cloud provider** | AWS | Broadest service catalog, best EdTech compliance track, strong education sector presence | `tech_stack_and_timeline.md` §7.1 |
| **API style** | REST (primary) + GraphQL (dashboards) | REST for simple CRUD and mobile; GraphQL for complex teacher/parent dashboard queries | `tech_stack_and_timeline.md` §2.1 |
| **Launch subjects** | Math only | KooBits built 7 years of math before expanding to 4 subjects; depth > breadth for initial market credibility | Key Decisions Log |

---

## 7. Glossary

### Pedagogy & learning science

- **CCSS / CCSS-M** — Common Core State Standards / CCSS for Mathematics. The US curriculum standard adopted by ~41 states. Public-domain-equivalent licensing.
- **CPA** — Concrete-Pictorial-Abstract. The Singapore Math instructional approach: students progress from hands-on manipulatives (concrete) → visual models like bar models (pictorial) → symbols/equations (abstract). Used in the platform's pedagogy even on CCSS content.
- **Singapore Math** — Pedagogical approach developed in Singapore in the 1980s; emphasizes depth over breadth and CPA progression. Internationally respected.
- **ZPD** — Zone of Proximal Development (Vygotsky). Target difficulty where a learner is challenged but not overwhelmed.
- **Desirable difficulty** — Learning research finding that effortful recall (barely getting something right) produces stronger memory than easy recall. Baked into FSRS's stability update.

### Adaptive learning algorithms

- **BKT** — Bayesian Knowledge Tracing. Hidden Markov model tracking `P(known)` per skill per student. Four parameters per skill: `P(L0)` initial knowledge, `P(T)` learn rate, `P(G)` guess rate, `P(S)` slip rate.
- **IRT** — Item Response Theory. Statistical model estimating a problem's difficulty (`b`) and discrimination (`a`) from response data; estimates student ability (`θ`). Phase 4 deployment.
- **2PL** — 2-Parameter Logistic IRT. The specific IRT model used in Phase 4.
- **CAT** — Computer Adaptive Testing. Dynamically selects items to efficiently estimate ability. Used in the cold-start diagnostic mode.
- **FSRS (FSRS-4.5)** — Free Spaced Repetition Scheduler. Modern spaced repetition algorithm based on the DSR model (Difficulty, Stability, Retrievability). Replaces SM-2. Achieves 20-30% fewer reviews at 90% retention vs. SM-2.
- **DSR model** — Difficulty, Stability, Retrievability. FSRS's memory model. R(t) = (1 + (19/81)·t/S)^(-0.5) is the power-law forgetting curve.
- **SM-2** — SuperMemo-2. 1987 spaced repetition algorithm used in early Anki. Simpler but less accurate than FSRS.
- **EAP** — Expected A Posteriori. The IRT ability estimation method used; updates after each response.

### Platform-specific

- **KoKo Credits** — KooBits' in-app currency. Our platform uses "coins" as the equivalent.
- **KooClasses** — KooBits' structured lesson progression. Our platform may implement an equivalent in Phase 5.
- **Brain Games** — KooBits' mini-game area (memory, reflexes, cognitive). Our Flame-based mini-games follow the same pattern.
- **Daily Challenge** — One curated problem per grade per day. Pattern from KooBits; implemented in Phase 1 (P1-T27).
- **Decision trace** — Per-problem-selection telemetry emitted by the scheduler. Includes fsrs_urgency, bkt_urgency, novelty_bonus, mood_applied, weights used, safety-net state, top-N candidates. Enables Phase 4 weight tuning via counterfactual replay.

### Compliance & business

- **COPPA** — Children's Online Privacy Protection Act (US). Applies to services directed to children under 13. Requires Verifiable Parental Consent. FTC fines up to $43K per violation.
- **VPC** — Verifiable Parental Consent. Specific mechanisms (credit card verification, signed form, etc.) required by COPPA.
- **GDPR-K** — GDPR Article 8, applying special protections to children (below national age of consent, 13-16 depending on EU member state).
- **CCPA / CPRA** — California Consumer Privacy Act / Privacy Rights Act. State law with extra minor protections.
- **kidSAFE** — Voluntary certification program for children's online services. Seal + audit.
- **PIPEDA** — Canada's privacy regulation.
- **DPA** — Data Processing Agreement. Required with each third-party processor handling user data.
- **MAU / DAU / WAU** — Monthly / Daily / Weekly Active Users. Platform scale metrics.
- **LTV / CAC** — Lifetime Value / Customer Acquisition Cost. SaaS unit economics.

### Technical

- **SSO / SAML** — Single Sign-On / Security Assertion Markup Language. Used for school district login (Clever, Google Classroom integrations, Phase 3).
- **OpenAPI 3.1** — API specification standard. Our contract is in `koobits_openapi.yaml`.
- **RFC 7807** — "Problem Details for HTTP APIs." Our error response format.
- **JWT** — JSON Web Token. Used for access tokens (15 min TTL) with refresh tokens (httpOnly cookie, 7d TTL) stored in Redis for revocation.
- **RBAC** — Role-Based Access Control. Student, Parent, Teacher, School Admin, Content Admin, System Admin roles.
- **BullMQ** — Redis-backed job queue for async gamification event processing (points, badges, streaks, leaderboards).
- **ZSET** — Redis sorted set. Used for leaderboards (O(log N) rank lookups).
- **Prisma** — TypeScript ORM for PostgreSQL. Type-safe query builder and migration tool.
- **Drift** — Flutter SQLite ORM for offline problem caching.
- **GoRouter / Riverpod / Rive / Flame** — Flutter stack: routing / state / animations / game engine.
- **Impeller** — Flutter's custom GPU renderer (replaces Skia). Why animation performance is superior to React Native.

---

## 8. Contact / Handoff Protocol

> **Placeholder section.** The client to fill in named contacts and SLAs.

### Question routing

| If you have a question about... | Contact |
|--------------------------------|---------|
| Product scope / priorities / roadmap | **Product Manager:** _[TBD]_ |
| Technical architecture / design decisions | **Tech Lead (client-side):** _[TBD]_ |
| Business entity / legal / procurement | **Founder / Operations:** _[TBD]_ |
| Curriculum / content quality | **Curriculum consultant:** _[TBD]_ |
| Design / branding | **Designer (external):** _[TBD]_ |
| Compliance / privacy policy language | **Legal counsel:** _[TBD]_ — engaged by Week -4 |

### Spec gap protocol

If you find a gap in the specs during implementation (missing field, unclear behavior, ambiguous acceptance criterion):

1. **Check if the gap is already flagged** in `koobits_handoff_readiness_audit.md` §Known Gaps by Dimension.
2. **If yes:** confirm the owner listed in §5 of this README and escalate to them.
3. **If no:** post in the team comms channel (Slack/Discord) with: (a) which doc the gap is in, (b) what's unclear, (c) your proposed interpretation, (d) a proposed decision deadline. Default owner = Tech Lead.
4. **Do not block on gaps.** Implement your best interpretation, flag it with a `TODO(spec-gap):` comment citing the doc+section, and ship. Decisions can be retroactive.

### Escalation path

- **L1 (same-day resolution):** Your direct Tech Lead or PM.
- **L2 (if L1 can't unblock within 24 hrs):** Client Tech Lead.
- **L3 (cross-cutting or business decision):** Founder.

### Phase gate review protocol

Each phase ends with a formal review (M1.6, M2.5, M3.4, M4.4, M5.5). Reviewed by Tech Lead + PM + one external stakeholder (client-side). Phase cannot close unless all Definition of Done criteria (in `koobits_development_plan.md` §7) are met. Exceptions require Founder sign-off and documented risk acceptance.

---

## Package Manifest

| File | Size | Lines | Required? |
|------|------|-------|-----------|
| `README.md` (this file) | ~25K | ~400 | Yes |
| `koobits_product_analysis.md` | 15K | ~305 | Yes |
| `koobits_tech_stack_and_timeline.md` | 48K | ~800 | Yes |
| `koobits_development_plan.md` | 50K | ~710 | Yes |
| `koobits_scheduled_task_plan.md` | 82K | ~1350 | Yes |
| `koobits_budget_estimation.md` | 23K | ~360 | Yes |
| `koobits_openapi.yaml` | 45K | ~1000 | Yes |
| `koobits_procurement_checklist.md` | 17K | ~360 | Yes |
| `koobits_curriculum_package.md` | 57K | ~900 | Yes |
| `koobits_legal_compliance_package.md` | 34K | ~570 | Yes |
| `koobits_design_brief.md` | 51K | ~850 | Yes |
| `koobits_handoff_readiness_audit.md` | 17K | ~340 | Optional |
| `scheduler_composition_design.md` | 22K | ~370 | Optional |
| **Total package** | **~484K** | **~8,300 lines** | |

---

*This package was prepared with care. Read the docs that apply to your role, don't re-litigate the locked decisions, and escalate spec gaps quickly. Good luck.*

---

## Local Development Setup

### Prerequisites

- **Node.js** >= 22.x
- **pnpm** >= 10.x (`npm install -g pnpm`)
- **Turbo** (installed as a dev dependency, or globally via `npm install -g turbo`)

### Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/tjokrogunawant-dev/koblio-platform.git
cd koblio-platform

# 2. Install all dependencies
pnpm install

# 3. Build all packages
turbo build

# 4. Run linting
turbo lint

# 5. Run type checking
turbo typecheck

# 6. Start development servers (API on :3001, Web on :3000)
turbo dev
```

### Monorepo Structure

```
koblio-platform/
  apps/
    api/              # NestJS backend API (port 3001)
    web/              # Next.js 15 web application (port 3000)
  packages/
    shared/           # Shared types, constants, validation
    ui/               # Shared React UI components
    eslint-config/    # Shared ESLint configurations
    typescript-config/ # Shared TypeScript configurations
```

### Key Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies across the monorepo |
| `turbo build` | Build all packages and apps |
| `turbo dev` | Start all dev servers in parallel |
| `turbo lint` | Lint all packages |
| `turbo typecheck` | Type-check all packages |
| `turbo test` | Run all tests |
| `pnpm format` | Format all files with Prettier |
| `pnpm format:check` | Check formatting without modifying |
