# Dev Agent 1 Report — P1-T14r + P1-T14a
**Status:** Done
**Branch:** master
**Commit:** (see below after push)

## Schema changes

Added to `apps/api/prisma/schema.prisma`:
- `enum Difficulty { EASY, MEDIUM, HARD }`
- `enum ProblemType { MCQ, FILL_BLANK, TRUE_FALSE }`
- `enum Curriculum { US_COMMON_CORE }`
- `model Problem` — UUID PK, curriculum, grade (Int), strand, topic, difficulty, type, content (Json/JSONB), createdAt, updatedAt
- Two indexes: `(grade, strand, topic)` and `(difficulty)`
- Table mapped to `"problems"` in PostgreSQL

Migration SQL created at:
`apps/api/prisma/migrations/20260427010000_add_problems_table/migration.sql`
- Creates enums, `problems` table (JSONB `content` column), and both indexes
- Migration was NOT run (`prisma migrate dev` not invoked per instructions)

## API endpoints added

All endpoints are `@Public()` — no auth required.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/content/problems` | List with optional filters (grade, strand, topic, difficulty, type, limit, offset) |
| GET | `/content/problems/:id` | Single problem by UUID — 404 if not found |
| GET | `/content/problems/grade/:grade` | All problems for a grade level |

Route ordering note: `GET /content/problems/grade/:grade` is declared before `GET /content/problems/:id` in the controller to prevent the literal string `"grade"` from being matched as a UUID param.

Response shape for list endpoint:
```json
{ "data": [...], "total": 50, "limit": 20, "offset": 0 }
```

## Files changed

- `apps/api/prisma/schema.prisma` — added 3 enums + Problem model
- `apps/api/prisma/migrations/20260427010000_add_problems_table/migration.sql` — new
- `apps/api/src/content/content.service.ts` — full implementation with PrismaService injection
- `apps/api/src/content/content.controller.ts` — 3 new problem endpoints
- `apps/api/src/content/content.module.ts` — added PrismaModule import
- `apps/api/src/content/dto/problem-query.dto.ts` — new DTO with validation
- `apps/api/src/content/content.service.spec.ts` — new unit tests
- `apps/api/src/content/content.controller.spec.ts` — updated to include PrismaService mock

## Tests written

`content.service.spec.ts` — 6 unit tests:
1. `findAll` with no filters returns paginated result with default take/skip
2. `findAll` with grade filter applies the filter to both findMany and count
3. `findAll` with multiple filters applies all of them
4. `findOne` returns problem by id
5. `findOne` throws NotFoundException for unknown id (null from Prisma)
6. `findByGrade` returns problems for the given grade ordered by strand+topic

All tests use a mock PrismaService (no DB required).

## Decisions & trade-offs

- **PrismaModule import in ContentModule**: PrismaModule is `@Global()` so PrismaService is already injectable without re-importing. Added the explicit import anyway for clarity and to make ContentModule self-documenting.
- **Dynamic `where` clause**: Built as a plain object using `Record<string, unknown>` — avoids Prisma-generated union type complexity while still being type-safe at runtime.
- **Route ordering**: `grade/:grade` declared before `:id` so NestJS resolves the literal path segment before the UUID param.
- **`content` field typed as `Json`** in Prisma — maps to `jsonb` in PostgreSQL. No Zod schema added for content shape validation since the spec defines it loosely and content editors are not in scope for this sprint.

## Issues / known gaps

- Migration has NOT been applied to any database. The `prisma migrate dev` step must be run manually when ready.
- `Prisma.ProblemWhereInput` type would be more precise for the `where` clause in `findAll` — used `Record<string, unknown>` to avoid importing internal Prisma types that may not be generated yet (schema not yet `prisma generate`'d in CI).
- No seed data — the endpoint will return empty arrays until problems are seeded via a separate seed script.
