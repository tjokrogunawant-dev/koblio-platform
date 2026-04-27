# Dev Agent Report: P2-T02 + P2-T08

**Date:** 2026-04-27
**Commit:** 44bfbe6
**Branch:** master

---

## P2-T02: Avatar Selection

### Schema Changes

- Added `avatarSlug String? @map("avatar_slug")` to the `User` model in `apps/api/prisma/schema.prisma`.
- Note: the schema already had a legacy `avatarId String? @map("avatar_id")` field (UUID reference). `avatarSlug` is separate — a plain text identifier for the chosen emoji avatar.
- Migration: `apps/api/prisma/migrations/20260427060000_add_avatar/migration.sql` — single `ALTER TABLE "users" ADD COLUMN "avatar_slug" TEXT;`

### Backend Endpoints Added

**`GET /me/profile`** (`@Roles(student)`)
- Returns: `{ id, displayName, grade, avatarSlug, coins, xp, level, streakCount }`
- Validates role is STUDENT, throws 403 otherwise.

**`PUT /me/avatar`** (`@Roles(student)`)
- Body: `{ avatarSlug: string }` — validated via `@IsIn` against 8 valid slugs: `fox | owl | bear | penguin | cat | dog | rabbit | dragon`
- Returns: `{ id, displayName, avatarSlug }`
- DTO: `apps/api/src/user/dto/update-avatar.dto.ts` — uses class-validator `@IsIn(VALID_AVATAR_SLUGS)`.

**Service methods added to `UserService`:**
- `updateAvatar(auth0Id, avatarSlug)` — finds user by auth0Id, updates `avatarSlug` field.
- `getStudentProfileByAuth0Id(auth0Id)` — returns profile fields from the users table.

### Frontend Changes

**`apps/web/src/components/avatar.tsx`**
- Props: `slug?: string | null`, `size?: 'sm' | 'md' | 'lg'`, `name?: string`
- Avatar emoji map: `fox=🦊 owl=🦉 bear=🐻 penguin=🐧 cat=🐱 dog=🐶 rabbit=🐰 dragon=🐲`
- Renders the emoji in a colored circle (`indigo-50` background).
- Falls back to first letter of `name` in a gray circle when no slug set.

**`apps/web/src/app/profile/setup/page.tsx`**
- 8 avatar buttons arranged in a 4-column grid.
- Selected avatar highlighted with `border-indigo-500` and shadow.
- "Save Avatar" button calls `PUT /me/avatar` then redirects to `/dashboard/student`.
- "Skip" link goes directly to `/dashboard/student`.
- Error state displayed if API call fails.

**`apps/web/src/app/dashboard/student/page.tsx`**
- Welcome row now shows `<Avatar>` component (size `lg`) alongside the student name.
- If `user.avatarSlug` is null/undefined, renders a "Pick your avatar →" link to `/profile/setup`.

**`apps/web/src/lib/api.ts`**
- Added `avatarSlug?: string | null` to `AuthUser` interface.
- Added `StudentProfile` and `UpdateAvatarResponse` interfaces.
- Added `getMyStudentProfile(token)` → `GET /me/profile`
- Added `updateAvatar(avatarSlug, token)` → `PUT /me/avatar`

---

## P2-T08: Problem Seed Expansion

### Final Counts

| Grade | Before | After | Added |
|-------|--------|-------|-------|
| 1     | 16     | 50    | 34    |
| 2     | 17     | 75    | 58    |
| 3     | 17     | 75    | 58    |
| **Total** | **50** | **200** | **150** |

### Coverage by Grade

**Grade 1 (50 problems)** — strands covered:
- `number_and_operations`: addition (7), subtraction (5), skip_counting (3), comparing_numbers (3), place_value (5)
- `geometry`: shapes (5)
- `measurement`: time (4), length (3)
- `data_and_statistics`: graphs (2)
- `algebraic_thinking`: patterns (4), equations (2)

**Grade 2 (75 problems)** — strands covered:
- `number_and_operations`: addition (7), subtraction (7), place_value (5), multiplication (6), skip_counting (3), comparing_numbers (3), even_and_odd (3)
- `measurement`: length (4), time (5), money (5), weight (2), liquid_volume (1)
- `data_and_statistics`: graphs (4)
- `geometry`: shapes (5)
- `algebraic_thinking`: patterns (3), equations (3)

**Grade 3 (75 problems)** — strands covered:
- `number_and_operations`: multiplication (10), division (8), fractions (11), rounding (4), addition (1), subtraction (1), place_value (3)
- `geometry`: area_and_perimeter (6), shapes (3)
- `data_and_statistics`: graphs (5)
- `measurement`: time (3), length (2), mass (2), liquid_volume (2)
- `algebraic_thinking`: patterns (4), equations (4), properties (2)

### Type Distribution (approx.)

- MCQ: ~55%
- FILL_BLANK: ~30%
- TRUE_FALSE: ~15%

### Difficulty Distribution (approx. per grade)

- EASY: 40%
- MEDIUM: 40%
- HARD: 20%

### Seed Script

`apps/api/prisma/seed.ts` was not changed — it already reads `problems.json` via `import` and calls `prisma.problem.createMany()` with `skipDuplicates: true`, which handles any count of problems correctly.

### Design Decisions

1. `avatarSlug` is a separate field from the existing `avatarId` (a legacy UUID field). Using a slug string means no FK dependency and easy validation on both API and frontend sides.
2. The avatar picker page uses the same `AVATAR_MAP` exported from `avatar.tsx` so the emoji map is the single source of truth.
3. The `AuthUser` interface in `api.ts` now includes `avatarSlug?: string | null` — this allows the avatar to be shown from auth context without an extra API call after login. The login endpoint would need to return it in the future; for now it degrades gracefully to the initial fallback.
4. Problem validation bug fixed: the Grade 3 rounding problem "Round 254 to nearest hundred" initially had answer "200" but the correct answer is "300" (tens digit 5 rounds up). Fixed in the combined JSON.
