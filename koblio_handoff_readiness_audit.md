# Handoff-Readiness Audit: Koblio Development Plan

**Date:** 2026-04-17
**Auditor:** worker_1 (self-audit of docs I helped produce)
**Scope:** Can an external dev team execute this plan with zero additional context?

> **Note on self-audit bias:** I wrote much of this plan. I've tried to read it with fresh eyes as if I were seeing it for the first time as a new tech lead, but the auditor effect is real — I may underestimate gaps in areas I find intuitive and overestimate gaps in areas I find unclear. Treat this as a critical review, not an exhaustive independent audit.

---

## Verdict: YELLOW

**Team can start some tasks Day 1 but will hit blocking questions within Days 1-5 on multiple dimensions.**

- The architecture, technology choices, and overall structure are sound. The plan IS executable in principle.
- But critical *specifications* — not just tech choices but "what exactly do we build" — are mostly missing.
- A realistic Day 1: DevOps provisions scaffolding; everyone else files 15+ questions by Day 3.

---

## Critical Gaps by Dimension

### 1. Product Specs — MAJOR GAP

| Gap | Impact | What's needed |
|-----|--------|---------------|
| No wireframes, mockups, or UX flows for any feature | **Slowdown** (not blocker — devs can stub) | Figma designs for 8-10 key screens: login (parent/teacher/student), topic browser, problem-solving, gamification dashboard, teacher roster, teacher analytics, parent child-view, admin CMS |
| Feature descriptions are names + sentences, not specs | Slowdown | PRD-style spec per major feature: user stories, acceptance scenarios, edge cases. Examples of what's missing: badge notification UX, streak-at-risk reminder design, hint reveal interaction, offline→online sync conflict UI |
| No example user journeys end-to-end | Slowdown | 3-5 annotated user journeys: "new parent registers and onboards child," "teacher creates first assignment," "student hits daily paywall" |

The plan has feature *names* and acceptance *checkboxes*, but not enough detail to build without designer + PM input. Example: "Parent weekly email digest" has no sample layout, no subject line convention, no section order, no data cutoffs.

### 2. Data Models — MODERATE GAP

| Gap | Impact | What's needed |
|-----|--------|---------------|
| Only partial schemas documented | Slowdown | Complete Prisma schema file. Fully specced tables today: skills, student_sessions, student_skill_states, mood_classification_events, the MongoDB problem document. Partial/missing: subscriptions, payments, badges_earned, badges_catalog, points_ledger, assignments, assignment_submissions, leaderboard entries, missions, avatar_shop items, avatar_inventory |
| No ERD diagram | Minor | Draw.io or Mermaid ERD showing table relationships |
| Index strategy unspecified | Minor | Index recommendations on hot tables (student_problem_attempts by student_id+timestamp, points_ledger by student_id, etc.) |

### 3. API Contracts — **BLOCKER for parallel work**

| Gap | Impact | What's needed |
|-----|--------|---------------|
| No canonical API spec (OpenAPI/Swagger) | **Blocker** | Skeletal OpenAPI 3.1 spec covering Phase 1 MVP endpoints. Without it: (a) frontend devs code against mocks and rework later, (b) P2-T07 "OpenAPI codegen → Dart client" is blocked — there's no source spec to generate from |
| Endpoints mentioned in scattered prose, not specified | Blocker for mobile | Request/response schemas, auth headers, error codes, pagination convention |
| No error envelope convention | Minor | Pick one: RFC 7807 problem+json, or custom `{error: {code, message, details}}` |

This is the single most valuable thing to add before handoff.

### 4. Gamification Rules — MODERATE GAP

| Gap | Impact | What's needed |
|-----|--------|---------------|
| Many magnitudes are directional, not final | Slowdown | Finalize: streak bonus multiplier at 7/30/100 days (plan says "bonus" — but 1.5x? 2x? 3x?); XP curve beyond L5 ("etc" is not a spec); weighted-correct leaderboard formula |
| Badge catalog not enumerated | Slowdown | List all 20+ badges with name, condition (expressed in domain terms), visual, earn copy. Without this, implementation is "add 20 more like the first three" — design debt |
| Avatar shop catalog not defined | Slowdown | 50 item catalog with name, category, coin cost, asset reference |
| Anti-gaming thresholds unspecified | Minor | Rate limit: "1 attempt per 3 seconds" isn't in the plan; flag threshold for "statistically impossible accuracy" needs a concrete formula |

Gamification is THE product differentiator. A dev team will implement what's specced, and if the rules are placeholder, the feel will be off.

### 5. Content/Curriculum — **BLOCKER for content team**

| Gap | Impact | What's needed |
|-----|--------|---------------|
| Target curriculum market not decided | **Blocker** | Plan says "Singapore MOE or US Common Core." Decision needs to be made before content team is hired. Different taxonomies, different pedagogical expectations, different sample problems |
| Full curriculum taxonomy not documented | Blocker | Grades 1-6 × strands × topics × subtopics × skills (~500-700 skills). Without this, CMS metadata tagging is guesswork |
| No sample problems defining quality bar | Blocker for content hires | 20-30 sample problems across grades 1-6 showing hint style, solution depth, difficulty calibration. Content creators need something to match |
| No authoring style guide | Slowdown | Rules for hint tone ("encouraging not dismissive"), solution structure (steps vs. narrative), language reading level per grade |
| "Source from open-source banks" isn't sourcing | Blocker | Specific banks identified, license compatibility checked, import format known, legal approval to relicense |

This is where the plan punts hardest on execution detail.

### 6. Third-Party Credentials / Procurement — **BLOCKER for DevOps**

| Gap | Impact | What's needed |
|-----|--------|---------------|
| No business entity / billing owner info | **Blocker** | Legal entity must exist to open AWS/Stripe/Apple Developer accounts. Not mentioned anywhere in plan |
| No account-creation checklist | Blocker | Who creates AWS account? Who's billing contact? Who creates Auth0 tenant? GitHub org? Domain registrar? |
| Procurement not on critical path | Blocker | AWS account setup can take days for large orgs; Apple Developer Program enrollment 2-4 weeks (requires D-U-N-S); Stripe tax registration varies by country. None of this is in the timeline |
| Secrets rotation policy unstated | Minor | Who has master admin? Rotation cadence for API keys? Break-glass procedure? |

Imagine Day 1: DevOps sits down, opens the plan, needs to create an AWS account. No account exists. Stuck.

### 7. Design Assets — MODERATE GAP

| Gap | Impact | What's needed |
|-----|--------|---------------|
| No brand identity | Slowdown | Product name (is it "Koblio-clone" or something else?), logo, tagline |
| Color palette not documented | Slowdown | Hex values for the child-friendly palette; accessibility contrast verified |
| Typography not picked | Slowdown | Display + body font choices, weights, size scale |
| Illustration style / character art not defined | Major slowdown | What do the avatars look like? Who draws them? 6-8 avatars for MVP need ~2 weeks of illustration work that's not in the plan |
| No design brief to give the designer | Slowdown | Reference aesthetic (is it Duolingo-like? Prodigy-like? Flat? 3D?), age-appropriate tone, competitor analysis |

Designer is on the critical path (P1-T08 blocks P1-T13 which blocks student UX). Shipping the designer without a brief wastes 1-2 weeks.

### 8. Legal/Compliance — **BLOCKER for auth flows**

| Gap | Impact | What's needed |
|-----|--------|---------------|
| No privacy policy draft | **Blocker** for P1-T07 (Auth0 COPPA config), P1-T10 (parent registration), P1-T12 (parent-child linking) | Legal counsel engaged, privacy policy drafted, URL-ready by Week 1 |
| No ToS draft | Blocker | Same timeline |
| COPPA consent language not drafted | Blocker | Parent consent UI strings must come from legal, not engineering |
| Data retention policy undefined | Slowdown | How long do we retain inactive student data? Right-to-deletion SLA? |
| kidSAFE application not initiated | Slowdown for launch | Application process, documentation requirements, review cycle (weeks) |

The plan mentions COPPA/GDPR as "risks" and schedules legal counsel engagement by Week 2. But auth flows are being built Week 3-4. Legal work needs to START before the project starts, not be a parallel track.

### 9. Environments / Configuration — MINOR GAP

| Gap | Impact | What's needed |
|-----|--------|---------------|
| Env var inventory not documented | Minor | Table of env vars × (dev, staging, prod) — names, sources, who sets them |
| Domain/DNS plan missing | Minor | What's the prod domain? Staging subdomain? Dev is localhost only? |
| Feature flag strategy unspecified | Minor | Plan mentions Unleash but not the flag naming convention, owner model, retirement policy |

### 10. Acceptance Criteria Quality — MIXED

**Good examples (testable):**
- P2-T02 (BKT): "Unit tests verify `skills.base_P_X` is NEVER mutated by an attempt"
- P2-T03 (FSRS): "Cold-start verified with default parameters (no per-user calibration needed for first 1K reviews)"
- P1-T34: "API p95 < 500ms; page load < 3s"

**Vague examples:**
- P1-T34: "Team has tested full student + teacher + parent flows" — tested how? Signed off by whom?
- Many tasks: "Responsive on desktop + tablet" — which breakpoints? Which devices are the reference?
- Phase gates: "Teacher NPS > 30" — how measured? Which survey tool? What sample size?

**What's needed:** A QA standards doc defining: severity level definitions, reference test devices, performance benchmarking method, NPS survey instrument, accessibility test procedure.

### 11. Decision Owners — MAJOR GAP

| Gap | Impact | What's needed |
|-----|--------|---------------|
| Roles named, people unnamed | **Slowdown throughout** | RACI matrix: who's accountable for product decisions, technical architecture, design, legal, business model, pricing |
| Phase gate "external stakeholder" undefined | Slowdown | Who signs off on phase gates? Founder? Board member? Customer advisory? |
| Open questions have no owner | Slowdown | Worker_3's mood_detection_spec.md has "Open Questions" that aren't assigned to anyone |
| Escalation path undefined | Slowdown | When a dev hits an ambiguity, who do they ping? How fast is response expected? |

This compounds every other gap. A missing spec is annoying; a missing spec with no one to ask is paralyzing.

---

## Gaps Not Explicitly in the Prompt but Worth Flagging

### 12. Testing Strategy
- Plan specifies Playwright E2E but doesn't specify: coverage targets, test data management, flaky test budget, load testing tools, chaos testing.

### 13. Monitoring SLOs
- No explicit SLO targets for uptime, latency percentiles, error budget per service. "99.9% uptime" appears in Phase 5 as a goal but not as a measured commitment.

### 14. Hiring Plan
- Team scales 8 → 11 across phases. But: no hiring pipeline, no job descriptions, no interview loop design. Flutter dev recruiting is mentioned as a Phase 1 risk but the hiring plan isn't.

### 15. Developer Onboarding
- Day 1 for a new engineer: what do they read? What do they run? Who shadows them? "Docker Compose local dev working" gets them running — but not up to speed on the product or the codebase conventions.

### 16. Git / Code Review Workflow
- Plan mentions CI/CD and PR previews but not: branching strategy (trunk-based? GitHub flow?), PR review requirements (reviewer count? must-pass checks?), merge strategy (squash? rebase?), commit message convention.

---

## TOP 5 Items to Add/Clarify BEFORE Handoff

### 1. OpenAPI 3.1 Skeleton Spec for MVP Endpoints

**Why:** Unblocks frontend, mobile, and OpenAPI codegen simultaneously. Highest leverage artifact.

**What it contains:** All Phase 1 endpoints (~30-40 routes) with request/response schemas, auth requirements, error envelope, pagination convention. Can be incomplete on details but complete on signatures.

**Effort:** 2-3 days for a backend lead to draft. Produces a machine-readable contract everyone codes against.

### 2. Legal/Compliance Package

**Why:** Blocks all auth flows (P1-T07, P1-T10, P1-T12) which are Phase 1 Week 3-4. Can't build consent UI without knowing exactly what legal language to show.

**What it contains:** Privacy policy draft, ToS draft, COPPA parental consent language, data retention policy, kidSAFE application initiated. Legal counsel engaged BEFORE Week 1.

**Effort:** 1-2 weeks with a COPPA-literate attorney. Start now.

### 3. Procurement & Credentials Checklist

**Why:** Blocks DevOps Day 1. Can't provision AWS without an account.

**What it contains:** Business entity confirmation, named owners for: AWS, Auth0, GitHub org, Stripe, SendGrid, Sentry, Apple Developer, Google Play, domain registrar. Account creation tasks sequenced in Week 0 (pre-kickoff).

**Effort:** 1 week to sequence; actual account creations span 2-4 weeks (Apple is slowest).

### 4. Curriculum Decision + Taxonomy + Sample Problems

**Why:** Content team is on the critical path from Phase 1 Week 5. Without a curriculum choice and sample problems, content work is literally impossible to start.

**What it contains:** (a) Pick one market (Singapore MOE vs US Common Core — needs business rationale), (b) full grade 1-6 taxonomy in CMS-ready format, (c) 20-30 sample problems spanning difficulty range and question types, (d) authoring style guide (2-3 pages).

**Effort:** 2-3 weeks with a math educator consultant. Start in parallel with legal.

### 5. Design System Brief + 6 Key Screen Mockups

**Why:** Designer is on the Phase 1 critical path. Frontend UX work (P1-T13 onwards) blocks without design system. Giving the designer a brief before they start saves 1-2 weeks of iteration.

**What it contains:** Design brief (brand references, aesthetic direction, accessibility requirements), then: login/registration, student dashboard, problem-solving screen, teacher class roster, teacher progress view, parent child overview. Low-fidelity wireframes acceptable — high-fidelity can follow.

**Effort:** 1 week for brief, 2 weeks for mockups. Parallel with content/legal work.

---

## What's Actually Good (So the Audit Isn't Unbalanced)

- **Tech stack is well-justified** with a Key Decisions Log explaining why Flutter over React Native, why modular monolith, why FSRS over SM-2. Future team members can read the log and not re-litigate.
- **Task dependencies and critical path are explicit** in the scheduled task plan. Sprint mapping is concrete.
- **Budget is realistic** at each MAU tier, and separates operational costs from development costs honestly.
- **Risk register is candid** and includes buffer day recommendations per phase. Phase 2 and 3 get 8-13% buffer, which is sober.
- **Definition of Done per phase** is well-structured as checkbox gates.
- **BKT mood-modifier schema (P2-T02) and FSRS task (P2-T03)** are specced at a level a dev could actually implement — these are the gold-standard tasks. If every task in the plan were at this level, this would be GREEN.

The gap is NOT technical quality or structural integrity. It's specification depth and operational readiness (procurement, legal, content sourcing, design assets).

---

## Scoring Summary

| Dimension | Rating | Notes |
|-----------|--------|-------|
| Architecture & tech choices | ✅ Green | Well-justified, documented in decisions log |
| Task decomposition & timeline | ✅ Green | Critical path, dependencies, sprints all explicit |
| Product specs (features) | 🟡 Yellow | Names + checkboxes, no mockups or detailed scenarios |
| Data models | 🟡 Yellow | Some tables fully specced, others just named |
| API contracts | 🔴 Red | No OpenAPI spec exists yet; blocks multiple parallel tracks |
| Gamification rules | 🟡 Yellow | Directional; missing badge catalog, streak multipliers |
| Content/curriculum | 🔴 Red | Market not chosen, taxonomy missing, no samples |
| Procurement/credentials | 🔴 Red | Nothing specified; DevOps blocked Day 1 |
| Design assets | 🟡 Yellow | No brief, no mockups, illustration work underestimated |
| Legal/compliance | 🔴 Red | Flagged as risk but not executed; blocks auth flows |
| Environments | 🟢 Green | Mostly specified; minor gaps |
| Acceptance criteria | 🟡 Yellow | Some gold-standard, others vague |
| Decision owners | 🟡 Yellow | Roles named, people unnamed |

**Four 🔴 Red items = YELLOW overall verdict.** Any one of them alone would be yellow. Four together means Days 1-5 will be heavy Q&A, not coding.

---

## Final Recommendation

Do NOT hand this plan to a new dev team tomorrow. Spend 2-3 weeks on the TOP 5 items first:

- Week 0: Kick off legal, curriculum decision, procurement in parallel
- Week 1: OpenAPI skeleton, design brief, credentials creation ongoing
- Week 2: Sample problems, taxonomy, privacy policy draft, 6 screen mockups
- Week 3: Team kickoff with a plan that's actually executable

That's a 2-3 week delay to avoid a 4-6 week delay of accumulated Q&A cycles during execution. The math is obvious. Don't skip pre-work.
