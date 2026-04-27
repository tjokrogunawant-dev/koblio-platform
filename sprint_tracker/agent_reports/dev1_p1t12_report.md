# Dev Agent 1 Report — P1-T12
**Task:** Parent-Child Linking & School Association
**Status:** Done
**Branch:** worktree-agent-a24c00afdcc9632b4
**Commit:** (see git log)

## What was implemented

### New service methods (`UserService`)
- `getChild(parentAuth0Id, childId)` — fetches a single child profile, verifies the child belongs to the authenticated parent via `ParentChildLink` lookup. Returns 404 if not found or not owned.
- `joinClassByCode(parentAuth0Id, childId, dto)` — verifies parent owns child, looks up classroom by `classCode` (uppercased), checks for duplicate enrollment, creates `Enrollment` record inside a `$transaction`, returns updated child profile with classroom info. Throws 404 on missing parent/child/class, 409 on duplicate enrollment.
- `getSchool(schoolId)` — fetches school with teacher and classroom counts via Prisma `_count` include. Throws 404 if not found.

### New DTO
- `apps/api/src/user/dto/join-class.dto.ts` — `JoinClassDto` with `class_code` (string, 6–20 chars).

### Updated controller (`UserController`)
- `GET /parents/me/children/:childId` — `@Roles(PARENT)` — calls `getChild`
- `POST /parents/me/children/:childId/join-class` — `@Roles(PARENT)` — calls `joinClassByCode`
- `GET /schools/:schoolId` — `@Roles(TEACHER, ADMIN)` — calls `getSchool`

### Verified existing endpoints (already correct)
- `POST /parents/me/children` — create child account (COPPA-compliant, no email)
- `GET /parents/me/children` — list parent's children
- `POST /schools` — create school (teacher/admin)
- `POST /teachers/me/classrooms` — create classroom with auto-generated class code
- `GET /teachers/me/classrooms` — list teacher classrooms
- `POST /classrooms/:classroomId/students` — teacher-side enroll student
- `GET /classrooms/:classroomId/students` — list enrolled students (no email returned)

## Endpoints added/verified

| Method | Path | Role | Status |
|---|---|---|---|
| POST | /parents/me/children | PARENT | Pre-existing, verified |
| GET | /parents/me/children | PARENT | Pre-existing, verified |
| GET | /parents/me/children/:childId | PARENT | **New** |
| POST | /parents/me/children/:childId/join-class | PARENT | **New** |
| POST | /schools | TEACHER/ADMIN | Pre-existing, verified |
| GET | /schools/:schoolId | TEACHER/ADMIN | **New** |
| POST | /teachers/me/classrooms | TEACHER/ADMIN | Pre-existing, verified |
| GET | /teachers/me/classrooms | TEACHER/ADMIN | Pre-existing, verified |
| POST | /classrooms/:id/students | TEACHER/ADMIN | Pre-existing, verified |
| GET | /classrooms/:id/students | TEACHER/ADMIN | Pre-existing, verified |

## Files changed

- `apps/api/src/user/user.service.ts` — added `getChild`, `joinClassByCode`, `getSchool`; added `JoinClassDto` import
- `apps/api/src/user/user.controller.ts` — added three new endpoints; added `Param`, `ParseUUIDPipe` imports; added `JoinClassDto` import
- `apps/api/src/user/dto/join-class.dto.ts` — **new file**
- `apps/api/src/user/user.service.spec.ts` — added test suites for `getChild`, `joinClassByCode`, `getSchool`; expanded prisma mock to include `school.findUnique`, `parentChildLink.findUnique`, `classroom.findUnique`, `enrollment.findUnique/create`
- `apps/api/src/user/user.controller.spec.ts` — added test cases for `getChild`, `joinClass`, `getSchool`; expanded `userService` mock

## Tests written

**UserService** (new suites):
- `getChild` — success, parent not found, child not belonging to parent
- `joinClassByCode` — success, parent not found, child not belonging to parent, class code not found, already enrolled (ConflictException)
- `getSchool` — success with counts, not found

**UserController** (new suites):
- `getChild` — delegates to `userService.getChild` with correct args
- `joinClass` — delegates to `userService.joinClassByCode` with correct args
- `getSchool` — delegates to `userService.getSchool` with correct args

## Decisions & trade-offs

- **Class code lookup**: `dto.class_code.toUpperCase()` applied before DB lookup so codes like `sun-dragon-42` and `SUN-DRAGON-42` both work. The existing `ClassroomService.generateClassCode()` already generates uppercase codes.
- **`joinClassByCode` lives in `UserService`**: The join-by-code flow is parent-initiated and requires parent auth verification, making `UserService` the natural owner rather than cross-calling `ClassroomService` (avoids circular module dependency).
- **`$transaction` wrapping**: The enrollment creation uses a transaction even though it's a single write, for consistency with the codebase pattern and future-proofing.
- **No email in child responses**: All child/student response shapes omit `email` field (COPPA hard requirement).
- **`ParseUUIDPipe`** on `:childId` and `:schoolId` for early validation before hitting the DB.

## Issues / known gaps

- `GET /users/children` and `GET /users/children/:childId` route prefix from the task spec (`/users/children`) differs from what the existing codebase uses (`/parents/me/children`). The implementation uses the existing convention (`/parents/me`) to stay consistent with `POST /parents/me/children` already committed in P1-T11.
- No `@ApiBearerAuth()` decorator on endpoints — this was not present on pre-existing endpoints either. Should be added globally or per-controller in a follow-up.
