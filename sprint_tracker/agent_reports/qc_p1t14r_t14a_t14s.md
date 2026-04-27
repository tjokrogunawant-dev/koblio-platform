# QC Report — P1-T14r, P1-T14a, P1-T14s
**Date:** 2026-04-27
**Dev 1 branch:** worktree-agent-ae9a9ee213a17c3af (commit 7b3a063)
**Dev 2 branch:** worktree-agent-a5cf78df450fe943a (commit ff736f2)

---

## P1-T14r + P1-T14a: Problem Schema + API

**Verdict:** PASS-WITH-WARNINGS

### Findings

| Severity | Finding | File | Detail |
|---|---|---|---|
| PASS | All required Problem model fields present | `apps/api/prisma/schema.prisma` L150–165 | `id`, `curriculum`, `grade`, `strand`, `topic`, `difficulty`, `type`, `content`, `createdAt`, `updatedAt` all present |
| PASS | `content` field typed as `Json` | `apps/api/prisma/schema.prisma` L158 | Maps to JSONB in PostgreSQL as required |
| PASS | 3 enums defined correctly | `apps/api/prisma/schema.prisma` L134–148 | `Difficulty`, `ProblemType`, `Curriculum` — all uppercase values match spec |
| PASS | Migration creates enums before table | `migration.sql` L1–3 | `CREATE TYPE` statements precede `CREATE TABLE` |
| PASS | Migration uses JSONB (not TEXT/JSON) | `migration.sql` L13 | `"content" JSONB NOT NULL` confirmed |
| PASS | Both indexes created in migration | `migration.sql` L20–21 | `problems_grade_strand_topic_idx` and `problems_difficulty_idx` |
| PASS | `GET /content/problems` accepts all 7 filters | `content.controller.ts` L26–46 + `problem-query.dto.ts` | grade, strand, topic, difficulty, type, limit, offset all bound via `ProblemQueryDto` |
| PASS | Pagination response shape correct | `content.controller.ts` L40–45 | Returns `{ data, total, limit, offset }` |
| PASS | `GET /content/problems/:id` returns 404 for unknown UUID | `content.service.ts` L46–51 | `NotFoundException` thrown when `findUnique` returns null |
| PASS | Route `grade/:grade` declared before `/:id` | `content.controller.ts` L48 vs L56 | Literal path segment resolved before UUID param — no collision |
| PASS | `limit` capped at 100 | `problem-query.dto.ts` L38–39 | `@Max(100)` decorator enforced via class-validator |
| PASS | All problem endpoints are `@Public()` | `content.controller.ts` L27, 49, 57 | All 3 problem routes decorated with `@Public()` |
| PASS | Unit tests cover all required cases | `content.service.spec.ts` L49–141 | 6 tests: no-filter, grade filter, multi-filter, findOne hit, findOne 404, findByGrade |
| PASS | `PrismaModule` imported in `ContentModule` | `content.module.ts` L2, L7 | Explicit import added — self-documenting even though `PrismaModule` is global |
| WARNING | `findByGrade` has no pagination | `content.controller.ts` L48–54 + `content.service.ts` L53–58 | Endpoint returns all problems for a grade in a single unbounded query. Acceptable for MVP seed data (≤17 problems per grade) but should be paginated before content library grows |
| WARNING | `where` clause typed as `Record<string, unknown>` instead of `Prisma.ProblemWhereInput` | `content.service.ts` L25 | Loses Prisma compile-time type safety for filter keys. Acceptable workaround until `prisma generate` runs in CI, but should be tightened after schema is applied |
| WARNING | Controller spec does not test new problem endpoints | `content.controller.spec.ts` L29–34 | Only `getStatus` is tested in the controller spec. The problem endpoints (`getProblems`, `getProblemsByGrade`, `getProblemById`) are untested at the controller layer. Service tests exist, but E2E coverage gap remains |
| INFO | Migration not applied to any database | Dev 1 report | Intentional per instructions — `prisma migrate dev` must be run manually. No action needed for code review. |

---

## P1-T14s: Seed Data

**Verdict:** PASS-WITH-WARNINGS

### Findings

| Severity | Finding | File | Detail |
|---|---|---|---|
| PASS | Seed script is idempotent | `seed.ts` L10 | `prisma.problem.deleteMany({})` runs before `createMany` |
| PASS | `prisma.seed` config added to package.json | `package.json` L17–19 | `"prisma": { "seed": "ts-node prisma/seed.ts" }` present |
| PASS | `ts-node` added to devDependencies | `package.json` L59 | `"ts-node": "^10.9.2"` present |
| PASS | All required top-level fields present in all problems | `seed-data/problems.json` | `curriculum`, `grade`, `strand`, `topic`, `difficulty`, `type`, `content` confirmed on every record |
| PASS | All `content` objects have required fields | `seed-data/problems.json` | `question`, `options`, `answer`, `hints` (array), `solution`, `image_url` present in every problem |
| PASS | MCQ problems have exactly 4 options | `seed-data/problems.json` | Verified across all 35 MCQ problems — each has exactly 4 items in `options` array |
| PASS | FILL_BLANK problems have `options: null` | `seed-data/problems.json` | All 13 FILL_BLANK records confirmed with `null` options |
| PASS | TRUE_FALSE problems have `options: ["True", "False"]` | `seed-data/problems.json` L296–298 | 1 TRUE_FALSE problem (Grade 1 shapes) has correct options |
| PASS | All `difficulty` values are EASY/MEDIUM/HARD | `seed-data/problems.json` | No lowercase or unexpected values found |
| PASS | All `type` values are MCQ/FILL_BLANK/TRUE_FALSE | `seed-data/problems.json` | No invalid type values found |
| PASS | All `curriculum` values are "US_COMMON_CORE" | `seed-data/problems.json` | Consistent across all 50 problems |
| PASS | LaTeX backslashes correctly escaped | `seed-data/problems.json` | JSON parsed without error confirming all backslashes are properly double-escaped (`\\frac`, `\\times`, `\\div`) throughout |
| PASS | Grade distribution meets spec | `seed-data/problems.json` | Grade 1: 16, Grade 2: 17, Grade 3: 17 — all meet ≥15 requirement |
| WARNING | Grade 2 subtraction HARD solution text is confused and contains a visible self-correction | `seed-data/problems.json` L415–416 | The solution for `312 − 175` begins "Tens: 0 − 7 needs borrow → 10 − 7 = 3 (but tens became 0 after borrow), reborrow from hundreds → 10 − 1 − 7 = 2... Let's recompute carefully:". The final answer (137) is correct but the solution explanation is confusing and age-inappropriate. A student reading this would be misled by the intermediate wrong value "2". Should be rewritten with a clean two-borrow column subtraction walkthrough. |
| INFO | `seed.ts` uses `as any[]` cast for `createMany` data | `seed.ts` L13 | Necessary workaround until `prisma generate` is run. Not a runtime risk since JSON is pre-validated, but the cast should be removed and typed properly post-migration. |

### Problem count: 50/50

### Educational accuracy spot-check

**Grade 1 — 3 problems reviewed:**

| # | Topic | Problem | Answer | Verdict |
|---|---|---|---|---|
| 1 | addition EASY FILL_BLANK | "5 + 3 = ___" | "8" | CORRECT. 5+3=8. Hint chain (count-on) appropriate for Grade 1. |
| 2 | subtraction MEDIUM FILL_BLANK | "14 − 6 = ___" | "8" | CORRECT. 14-6=8. Solution uses make-a-ten bridging strategy (14-4=10, 10-2=8) — valid and aligned with 1.NBT/1.OA standards. |
| 3 | place_value MEDIUM MCQ | "Which number is greater than 47 but less than 53?" | "50" | CORRECT. 50 is the only option in range. Distractors 43, 45, 55 are all out-of-range. Good distractor set. |

**Grade 2 — 3 problems reviewed:**

| # | Topic | Problem | Answer | Verdict |
|---|---|---|---|---|
| 4 | addition HARD FILL_BLANK | "136 + 247 = ___" | "383" | CORRECT. 6+7=13 (carry 1), 3+4+1=8, 1+2=3 → 383. Solution explanation is accurate. |
| 5 | subtraction HARD MCQ | "312 − 175 = ___" | "137" | CORRECT (final answer). 312-175=137. However, the **solution text** is confusing and contains an in-text self-correction ("Let's recompute carefully"). This is a WARNING-level content quality issue — see Findings table above. |
| 6 | multiplication MEDIUM FILL_BLANK | "4 × 7 = ___" | "28" | CORRECT. 4×7=28. Skip-counting hint and solution are pedagogically sound. |

**Grade 3 — 3 problems reviewed:**

| # | Topic | Problem | Answer | Verdict |
|---|---|---|---|---|
| 7 | fractions HARD MCQ | "Jake has 5/6 ft of string, uses 2/6 ft. How much is left?" | "3/6" | CORRECT. 5/6 - 2/6 = 3/6. Standard same-denominator fraction subtraction (3.NF.3). Distractors 7/6, 2/5, 3/12 are plausible errors. |
| 8 | division MEDIUM FILL_BLANK | "56 stickers into bags of 8. How many bags?" | "7" | CORRECT. 56÷8=7. Check: 7×8=56. Age-appropriate word problem. |
| 9 | area_and_perimeter MEDIUM MCQ | "Rectangle 6cm × 4cm. What is the perimeter?" | "20 cm" | CORRECT. P = 2×(6+4) = 20 cm. Distractors include 24 cm (area confusion) and 10 cm (half-formula error) — excellent pedagogical distractors. |

All 9 spot-checked problems have correct answers and age-appropriate content.

---

## Overall Verdict

**APPROVED** — both branches are ready to merge.

### Required fixes (BLOCKERs):
_None._

### Recommended fixes (WARNINGs):

1. **[P1-T14s / Content quality]** Rewrite the solution text for Grade 2 subtraction HARD (`312 − 175`) in `apps/api/prisma/seed-data/problems.json`. The current text includes a mid-solution self-correction that would confuse a student. Replace with a clean columnar subtraction walkthrough: "Ones: 2 < 5, borrow from tens. Tens becomes 0, ones becomes 12. 12 − 5 = 7. Tens: 0 < 7, borrow from hundreds. Hundreds becomes 2, tens becomes 10. 10 − 7 = 3. Hundreds: 2 − 1 = 1. Answer: 137."

2. **[P1-T14a / Test coverage]** Add controller-layer tests for `getProblems`, `getProblemsByGrade`, and `getProblemById` in `apps/api/src/content/content.controller.spec.ts`. Currently only `getStatus` is tested in the controller spec.

3. **[P1-T14a / Type safety]** After `prisma migrate dev` and `prisma generate` are run, replace the `Record<string, unknown>` type for `where` in `ContentService.findAll` with `Prisma.ProblemWhereInput` for compile-time correctness.

4. **[P1-T14a / Pagination]** Add limit/offset pagination to the `GET /content/problems/grade/:grade` endpoint before the content library grows beyond seed data volume.
