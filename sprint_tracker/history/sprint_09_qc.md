# Sprint 09 QC Report

**Date:** 2026-04-27  
**Reviewer:** QC Agent  
**Sprint Goal:** Badge shelf UI + Admin CMS for problem authoring

## Overall Status: PASS WITH MINOR ISSUES

All acceptance criteria are met. Two non-blocking issues were found: a missing role-guard on the admin CMS page for the unauthenticated state, and no delete capability in the Admin CMS (not in scope but worth noting for Sprint 10). No blockers.

---

## P2-T03 Badge Shelf UI

**Commit:** `33c7420`  
**Files reviewed:** `apps/web/src/lib/api.ts`, `apps/web/src/components/badge-shelf.tsx`, `apps/web/src/app/dashboard/student/page.tsx`

| # | Criterion | Status | Notes |
|---|---|---|---|
| 1 | `BadgeDto` has: id, type, awardedAt, name, description, iconEmoji | PASS | All six fields present. `type` is a discriminated union of 10 `BadgeType` literals (not a plain string) — stricter than required, which is correct. |
| 2 | `getMyBadges` calls `GET /badges/me` and unwraps `{ badges }` envelope | PASS | Fetches `/badges/me`, calls `handleResponse<{ badges: BadgeDto[] }>(res)`, returns `data.badges`. Envelope unwrap is correct. |
| 3 | `BadgeShelf` renders a responsive grid of badge cards (emoji + name) | PASS | `grid-cols-4 sm:grid-cols-5` grid. Each card shows `badge.iconEmoji` (text-3xl) and `badge.name` (xs font-medium). |
| 4 | Empty state shown when badges array is empty | PASS | `badges.length === 0` branch renders a dashed-border placeholder with "No badges yet — keep solving problems!" |
| 5 | Hover tooltip shows description and earned date | PASS | CSS `group-hover/badge:opacity-100` tooltip renders `badge.description` and `formatDate(badge.awardedAt)` above the card. Works without JS (pure CSS transition). |
| 6 | Student dashboard integrates `BadgeShelf` with a `useEffect` fetch | PASS | `getMyBadges(token)` is called inside the `useEffect(() => { if (!token) return; ... }, [token])` block. Result stored in `badges` state and passed to `<BadgeShelf badges={badges} />`. |
| 7 | Badge fetch errors silently degrade (don't crash the page) | PASS | `.catch(() => { /* silently degrade */ })` — no error state is set for badges; the shelf simply renders the empty state. |

**Findings — P2-T03:**

- Minor: The `BadgeShelf` component has no explicit `aria-label` on the section, and the tooltip (`position: absolute, bottom-full`) may clip at the top of the viewport if badge cards appear near the top of the page. Low severity; no fix required before Sprint 10.
- Minor: No loading skeleton or spinner for the badge fetch. The shelf silently shows the empty state while loading, which could momentarily mislead users into thinking they have no badges. Acceptable for MVP; recommend a loading flag in a future iteration.

**P2-T03 verdict: PASS**

---

## P2-T07 Admin CMS Problem Authoring

**Commit:** `0f4b9b1`  
**Files reviewed:** `apps/api/src/content/dto/create-problem.dto.ts`, `apps/api/src/content/dto/update-problem.dto.ts`, `apps/api/src/content/content.service.ts`, `apps/api/src/content/content.controller.ts`, `apps/web/src/lib/api.ts`, `apps/web/src/app/admin/problems/page.tsx`, `apps/web/src/app/dashboard/teacher/assignments/new/page.tsx`

| # | Criterion | Status | Notes |
|---|---|---|---|
| 1 | `CreateProblemDto` validates grade (1-6), strand, topic, difficulty enum, type enum, content object | PASS | `@IsInt() @Min(1) @Max(6)` on grade; `@IsString() @IsNotEmpty()` on strand and topic; `@IsEnum(Difficulty)` and `@IsEnum(ProblemType)` from `@prisma/client`; `@IsObject()` on content. Full validation present. |
| 2 | `UpdateProblemDto` makes all fields optional | PASS | Every field decorated with `@IsOptional()` before its type validator. Manually written (not `PartialType`) but validators are correctly composed. |
| 3 | `createProblem` service returns a `ProblemDto` via `mapProblem()` | PASS | `prisma.problem.create(...)` result is passed directly to `mapProblem(row)` and returned. |
| 4 | `updateProblem` service throws `NotFoundException` if problem not found | PASS | `findUnique({ where: { id } })` runs before the update; throws `new NotFoundException(...)` if null. |
| 5 | Both routes guarded with TEACHER + ADMIN roles | PASS | `@Roles(UserRole.TEACHER, UserRole.ADMIN)` on both `POST /content/problems` and `PUT /content/problems/:id`. No `@Public()` decorator present — routes fall through to the global auth guard correctly. |
| 6 | Controller prefix is `@Controller('content')` so routes are at `/content/problems`; frontend also uses `/content/problems` | PASS | Controller decorator is `@Controller('content')`. Frontend `createProblem` and `updateProblem` in `api.ts` fetch `${API_BASE}/content/problems` and `${API_BASE}/content/problems/${id}` respectively. Consistent. |
| 7 | Admin CMS page redirects non-teacher/non-admin users | PASS | `useEffect` calls `router.replace('/dashboard')` when `user.role !== 'teacher' && user.role !== 'admin'`. The page also skips the data fetch for those roles. |
| 8 | Admin CMS page shows problem table and editor panel/modal | PASS | Problem table renders grade, strand, topic, difficulty badge, type, and an Edit button. Editor panel (`w-96 shrink-0`) slides in beside the table with grade/strand/topic/difficulty/type fields and a JSON textarea. Save and Cancel actions are wired. |
| 9 | Teacher assignment page still works after `getProblems` return-type fix | PASS | `apps/web/src/app/dashboard/teacher/assignments/new/page.tsx` calls `.then((res) => setProblems(res.data))`, correctly destructuring `res.data` from the `ProblemsResponse` envelope. No regression. |

**Findings — P2-T07:**

- Minor: `AdminProblemsPage` checks role only after `user` is non-null; while loading (`user === null`), the page renders a "Loading…" placeholder instead of a redirect. This is acceptable for an MVP admin route (server rendering is not in scope yet), but note that a brief flash of the loading state is visible to any authenticated non-admin who navigates directly to `/admin/problems` before the `useEffect` fires.
- Minor: The content JSON textarea is free-form with only client-side `JSON.parse()` validation. There is no server-side schema enforcement on the `content` object itself beyond `@IsObject()` — e.g., `question`, `answer`, and `solution` keys are not required at the DTO level. The UI hints at this requirement ("Must include: question, answer, solution") but a malformed content object can still be persisted. This was also present in the original problem seed pathway; not a regression, but flagged for future hardening.
- Minor: No delete endpoint or UI for problems. Out of scope for P2-T07 per the acceptance criteria, but CMS authors will need it. Flag for Sprint 10.
- Minor: `PUT /content/problems/:id` does not validate the `:id` param with `ParseUUIDPipe` on the service side beyond the controller's `ParseUUIDPipe` — which is correctly applied in the controller. No issue.
- Minor: `updateProblem` on the frontend always sends the full `CreateProblemData` payload even in edit mode (not just the changed fields). This is not incorrect (the backend handles partial updates correctly via undefined-check guards), but it means a full object is always sent on every edit. Acceptable for MVP.

**P2-T07 verdict: PASS WITH MINOR ISSUES**

---

## Blockers (must fix before Sprint 10)

None.

---

## Non-Blocking Issues

1. **Badge shelf loading state** — `BadgeShelf` shows the empty-state placeholder while the badge fetch is in-flight. Consider a `loadingBadges` flag in Sprint 10 to show a skeleton instead.
2. **Content `@IsObject()` only** — `CreateProblemDto` does not enforce that `content` includes `question`, `answer`, and `solution` keys. A `@ValidateNested()` + nested DTO or a custom validator would prevent malformed problems being stored. Recommended for Section 8 (adaptive engine) when content integrity becomes critical.
3. **No problem delete** — Admin CMS has create and update but no delete. Add `DELETE /content/problems/:id` (TEACHER/ADMIN guarded) and a UI confirmation dialog in Sprint 10.
4. **Badge tooltip viewport clipping** — Tooltip uses `bottom-full` positioning and may clip at page top for cards near the header. Low priority cosmetic fix.
5. **Admin page unauthenticated flash** — `/admin/problems` shows a "Loading…" placeholder before the role check fires. Not a security issue (the API is guarded), but a UX rough edge.
