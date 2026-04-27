# P2-T07 Dev Report — Admin CMS for Problem Authoring

**Date:** 2026-04-27  
**Task:** P2-T07 — Admin CMS for Problem Authoring  
**Status:** Complete

---

## Summary

Built a full problem authoring workflow accessible at `/admin/problems` for TEACHER and ADMIN roles. Includes two new API endpoints and a frontend CMS page with inline editor.

---

## Backend Changes

### New DTOs

**`apps/api/src/content/dto/create-problem.dto.ts`**
- `grade` (@IsInt, @Min(1), @Max(6))
- `strand`, `topic` (@IsString, @IsNotEmpty)
- `difficulty` (@IsEnum(Difficulty))
- `type` (@IsEnum(ProblemType))
- `content` (@IsObject) — raw JSONB

**`apps/api/src/content/dto/update-problem.dto.ts`**
- Same shape as `CreateProblemDto` with all fields marked `@IsOptional()`

### New Service Methods (`content.service.ts`)

- `createProblem(dto)` — calls `prisma.problem.create`, returns `mapProblem()`
- `updateProblem(id, dto)` — checks existence, throws `NotFoundException` if not found, calls `prisma.problem.update`, returns `mapProblem()`

### New Controller Routes (`content.controller.ts`)

- `POST /content/problems` — guarded with `@Roles(UserRole.TEACHER, UserRole.ADMIN)`, uses `CreateProblemDto`
- `PUT /content/problems/:id` — same guard, uses `UpdateProblemDto`

Both routes rely on the globally registered `JwtAuthGuard` + `RolesGuard` (`APP_GUARD` in `app.module.ts`).

---

## Frontend Changes

### `apps/web/src/lib/api.ts`

- Added `ProblemsResponse` interface to correctly type the paginated response from `GET /content/problems`
- Fixed `getProblems` return type from `Promise<Problem[]>` to `Promise<ProblemsResponse>` (was a pre-existing bug — the API returns `{ data, total, limit, offset }` but the function was typed as returning `Problem[]`)
- Added `CreateProblemData` and `UpdateProblemData` interfaces
- Added `createProblem(data, token)` → `POST /content/problems`
- Added `updateProblem(id, data, token)` → `PUT /content/problems/:id`

### `apps/web/src/app/dashboard/teacher/assignments/new/page.tsx`

- Fixed `.then((data) => setProblems(data))` to `.then((res) => setProblems(res.data))` to match the corrected `getProblems` return type.

### `apps/web/src/app/admin/problems/page.tsx` (new)

- Role guard: redirects non-teacher/non-admin users to `/dashboard` via `useEffect` checking `user.role`
- Table listing all problems (fetches `GET /content/problems` with limit 100): Grade | Strand | Topic | Difficulty | Type | Actions columns
- "New Problem" button opens inline right-panel editor
- "Edit" button per row opens same editor pre-populated with problem data
- Editor fields: Grade (number 1-6), Strand (text), Topic (text), Difficulty (select), Type (select), Content JSON (textarea with hint)
- JSON textarea validates on save — shows inline error if syntax is invalid
- Save dispatches `createProblem` or `updateProblem` and updates local state without refetch
- Cancel button closes panel

---

## Notes

- The `content` field stores a raw JSONB object. On edit, `mapProblem()` splits it into `questionText`, `correctAnswer`, `solution`, `options`, `hints` — so the editor reconstructs the raw JSON from those fields for editing.
- All Tailwind only, no new CSS files.
- The controller is under `/content/problems` (matching existing route prefix), not `/problems`.
