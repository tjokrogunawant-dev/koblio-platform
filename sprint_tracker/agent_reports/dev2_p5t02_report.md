# P5-T02 Implementation Report — BKT Mastery Tracking Service

**Date:** 2026-04-27
**Agent:** dev2
**Task:** P5-T02 — BKT Mastery Tracking Service

---

## Summary

Implemented the full Bayesian Knowledge Tracing (BKT) mastery tracking system for Koblio.
All components are wired end-to-end: schema → migration → service → controller → attempt hook.

---

## Files Created

### `apps/api/prisma/migrations/20260427100000_add_skill_mastery/migration.sql`
Creates the `skill_masteries` table with:
- UUID primary key
- `student_id` FK → `users(id)` CASCADE
- `skill` TEXT (format: `grade{N}:{strand}:{topic}`)
- `mastery_prob` DOUBLE PRECISION DEFAULT 0.1
- `attempt_count` INTEGER DEFAULT 0
- `mastered` BOOLEAN DEFAULT false
- `last_updated`, `created_at` timestamps
- Unique index on `(student_id, skill)`
- Composite index on `(student_id, mastered)`

### `apps/api/src/mastery/bkt.service.ts`
Pure computation service — no DB access.
- `updateMastery(currentMastery, correct, params?)`: applies exact BKT update formula (observation + transit step), clamps result to [0.0, 1.0]
- `isMastered(mastery)`: returns `true` when mastery >= 0.95
- Exports `DEFAULT_BKT_PARAMS` (pL0=0.1, pT=0.1, pG=0.25, pS=0.1) and `BktParams` interface

### `apps/api/src/mastery/mastery.service.ts`
DB-backed mastery tracking.
- `recordAttempt(studentId, skill, correct)`: upserts `SkillMastery`, computes BKT update, tracks `justMastered` transition, never resets `mastered` flag to false
- `getStudentMasteries(studentId)`: returns all skill mastery records, sorted by skill key
- `getSkillMastery(studentId, skill)`: returns current mastery prob, defaults to P(L0)=0.1 if no record
- `getUnmasteredSkills(studentId)`: returns skill keys with `mastered=false`, sorted by descending `masteryProb` (highest-progress first)

### `apps/api/src/mastery/mastery.controller.ts`
- `GET /mastery/me` — STUDENT role only
- Returns `{ skills: [{ skill, masteryProb, mastered, attemptCount }] }`

### `apps/api/src/mastery/mastery.module.ts`
- Imports: `PrismaModule`
- Providers: `BktService`, `MasteryService`
- Controllers: `MasteryController`
- Exports: `BktService`, `MasteryService`

### `apps/api/src/mastery/bkt.service.spec.ts`
Unit tests covering:
- Correct answer increases mastery
- Incorrect answer decreases mastery
- Mastery never exceeds 1.0 or drops below 0.0
- `isMastered` returns true at 0.95, false at 0.94
- Two correct answers increase mastery more than one
- Exact formula verification for correct and incorrect cases (4 decimal places)
- Custom BKT params respected

---

## Files Modified

### `apps/api/prisma/schema.prisma`
- Added `skillMasteries SkillMastery[]` reverse relation on `User`
- Added `SkillMastery` model at end of file

### `apps/api/src/attempt/attempt.service.ts`
- Injected `MasteryService` via constructor
- Added `justMastered: boolean` to `submitAnswer` return type
- After attempt + gamification + badges: calls `masteryService.recordAttempt(studentId, skill, correct)` where `skill = grade{N}:{strand}:{topic}`
- Failures are caught and logged — never block the attempt response
- Returns `justMastered` in the response shape

### `apps/api/src/attempt/attempt.module.ts`
- Added `MasteryModule` to imports
- Also fixed pre-existing bug: `SchedulerModule` was missing despite `SchedulerService` being injected in `AttemptService`

### `apps/api/src/app.module.ts`
- Added `MasteryModule` import and to `imports` array

---

## BKT Formula Verification

With default params (pL0=0.1, pT=0.1, pG=0.25, pS=0.1), starting mastery=0.1:

**Correct answer:**
- P(Ln|correct) = 0.1 × 0.9 / (0.1 × 0.9 + 0.9 × 0.25) = 0.09 / 0.315 ≈ 0.2857
- After transit: 0.2857 + 0.7143 × 0.1 ≈ **0.3571**

**Incorrect answer:**
- P(Ln|incorrect) = 0.1 × 0.1 / (0.1 × 0.1 + 0.9 × 0.75) = 0.01 / 0.685 ≈ 0.0146
- After transit: 0.0146 + 0.9854 × 0.1 ≈ **0.1131**

---

## Constraints Met
- Upsert pattern (creates on first attempt, updates thereafter)
- `mastered` flag never resets to false — monotonically increasing
- `justMastered` true only when this attempt caused the 0.94 → 0.95+ transition
- `masteryProb` clamped to [0.0, 1.0]
- Mastery side-effects do not block the attempt response (try/catch)
