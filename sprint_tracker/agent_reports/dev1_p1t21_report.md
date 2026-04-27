# P1-T21 Implementation Report — Attempt Recording

**Date:** 2026-04-27
**Task:** P1-T21 — Student Problem Attempt Recording + Stats API
**Status:** Done

---

## Summary

Implemented the `AttemptModule` to record student answer submissions and expose attempt history and stats endpoints. Answers are validated case-insensitively against the problem's stored `content.answer` field.

---

## Files Changed

### Prisma Schema
- `apps/api/prisma/schema.prisma` — Added `StudentProblemAttempt` model with indexes on `(studentId, problemId)` and `(studentId, createdAt)`. Added `attempts` back-relation to `User` and `Problem` models.

### Migration
- `apps/api/prisma/migrations/20260427020000_add_student_attempts/migration.sql` — Raw SQL to create `student_problem_attempts` table with foreign key constraints and indexes.

### New Module: `apps/api/src/attempt/`
| File | Description |
|---|---|
| `attempt.module.ts` | NestJS module wiring controller + service, imports PrismaModule |
| `attempt.service.ts` | Business logic: answer validation, attempt recording, history + stats queries |
| `attempt.controller.ts` | REST controller with 4 endpoints (all `@Roles('student')`) |
| `dto/submit-answer.dto.ts` | Validated DTO: `problemId`, `answer`, `timeSpentMs` (0–600000), optional `hintUsed` |
| `attempt.service.spec.ts` | 8 unit tests for service |
| `attempt.controller.spec.ts` | 5 unit tests for controller |

### App Module
- `apps/api/src/app.module.ts` — Added `AttemptModule` to imports array.

---

## Endpoints

| Method | Path | Role | Description |
|---|---|---|---|
| `POST` | `/attempts` | student | Submit an answer; returns `{ correct, correctAnswer, solution, attemptId }` |
| `GET` | `/attempts/me` | student | Paginated attempt history (`?limit=&offset=`) |
| `GET` | `/attempts/me/stats` | student | Aggregate stats: totals, accuracy %, topics attempted |
| `GET` | `/attempts/me/problem/:problemId` | student | All attempts for a specific problem |

---

## Design Decisions

- **`studentId` = `user.id` (DB UUID)**: Student tokens (internal JWTs) set `sub = user.id`, so `currentUser.userId` is already the DB primary key — no extra lookup needed.
- **Case-insensitive comparison**: `dto.answer.trim().toLowerCase()` vs `content.answer.trim().toLowerCase()` for consistent grading across TRUE_FALSE and FILL_BLANK types.
- **No cross-student leakage**: All queries hard-scope `where: { studentId: user.userId }`. Students cannot access other students' data.
- **`hintUsed` defaults to `false`**: If omitted in the DTO, the DB default and service default both apply `false`.

---

## Tests

### AttemptService (`attempt.service.spec.ts`)
- `submitAnswer` — correct answer → `correct: true`, attempt created
- `submitAnswer` — wrong answer → `correct: false`, attempt still created
- `submitAnswer` — case-insensitive match ("TRUE" matches "true")
- `submitAnswer` — problem not found → `NotFoundException`
- `submitAnswer` — `hintUsed: true` propagated to DB create
- `getStudentStats` — correct totals, accuracy %, deduplicated topics
- `getStudentStats` — 0 attempts → 0% accuracy, empty topics
- `getStudentAttempts` — paginated result with correct query args
- `getStudentProblemAttempts` — filtered by student + problem

### AttemptController (`attempt.controller.spec.ts`)
- `submitAnswer` — delegates to service with correct studentId
- `getMyAttempts` — default pagination values applied
- `getMyAttempts` — custom limit/offset passed through
- `getMyStats` — returns service result for current student
- `getMyProblemAttempts` — delegates with correct studentId + problemId
