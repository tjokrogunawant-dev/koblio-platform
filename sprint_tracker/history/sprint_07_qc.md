# QC Report — Sprint 07 (Section 5: Teacher Dashboard)

**Date:** 2026-04-27
**Reviewer:** QC Agent
**Tasks:** P1-T29, P1-T30, P1-T31, P1-T32, P1-T33
**Commits reviewed:** backend `3c8eb62`, frontend `e1fdd52`

---

## Overall Verdict

**FAIL** — Two blocking URL mismatches will cause 404s on first load for all teacher users. One additional blocking gap means the parent dashboard is permanently non-functional (no children ever rendered). All three must be fixed before this sprint can be considered done.

---

## Backend (P1-T29–T33)

### What's correct

- **Auth on all new endpoints.** Global `JwtAuthGuard` covers every route. All classroom and assignment endpoints use `@Roles(...)` decorators; no public exposure of protected data.
- **Teacher owns classroom — `POST /assignments` (P1-T30).** `AssignmentService.createAssignment` resolves the teacher from `auth0Id`, fetches the classroom, and hard-checks `classroom.teacherId !== teacher.id` → throws `ForbiddenException`. Correct.
- **Teacher owns classroom — `GET /classrooms/:id/students` and `GET /classrooms/:id/progress` (P1-T29).** Both service methods look up the authenticated user and compare `classroom.teacherId !== teacher.id` before returning data. Correct.
- **Student enrollment check — `POST /assignments/:id/submit` (P1-T31).** `AssignmentService.submitAssignment` fetches the assignment with `include: { classroom: { include: { enrollments: { where: { studentId: student.id } } } } }` then checks `enrollments.length === 0` → `ForbiddenException`. Correct.
- **`GET /assignments/student` filters by enrolled classrooms (P1-T31).** Uses Prisma nested filter `classroom: { enrollments: { some: { studentId: student.id } } }` and further excludes already-completed problems. Correct.
- **`GET /parent/children/:childId/progress` verifies parentId→childId link (P1-T33).** `ParentService.getChildProgress` looks up `ParentChildLink` by `{ parentId: parent.id, childId }` before returning any data. Correct.
- **Migration SQL matches schema.** Both `assignments` and `assignment_submissions` tables match the Prisma models exactly — columns, types, constraints (`UUID[]`, nullable fields, unique index on `(assignment_id, student_id, problem_id)`, all FK references). `updated_at` is correctly present on `assignments` and absent on `assignment_submissions`.
- **All new modules registered in `app.module.ts`.** `ClassroomModule`, `AssignmentModule`, and `ParentModule` are all present in the `imports` array.
- **COPPA — no student email in responses.** `listClassroomStudents` returns `{ id, name, grade, streakCount, coins, xp, enrolled_at }`. `getClassroomProgress` returns `{ studentId, name, totalAttempts, … }`. `getChildProgress` selects `{ id, displayName, coins, xp, level, streakCount }`. None of these include `email`. The `User.email` field is `String?` (optional) and is never selected in any new endpoint response. Correct.
- **DTOs are well-validated.** `CreateAssignmentDto` validates `classroomId` as UUID, `problemIds` as a 1–10 item array of UUIDs, `grade` bounded 1–6, `difficulty` as enum. `SubmitAssignmentDto` validates nested `answers[]` with `ValidateNested` and `@Type`.

### Issues found

**Issue B-1 (NON-BLOCKING — medium severity): `POST /classrooms/:classroomId/students` has no teacher ownership check.**

`ClassroomController.enrollStudent` calls `classroomService.enrollStudent(classroomId, dto)` without passing the authenticated user. `ClassroomService.enrollStudent` fetches the classroom and validates the student, but never checks that the calling teacher owns that classroom. Any authenticated TEACHER or ADMIN can enroll students into any classroom they do not own.

File: `apps/api/src/classroom/classroom.controller.ts` line 43–49 and `apps/api/src/classroom/classroom.service.ts` line 107–158.

**Issue B-2 (NON-BLOCKING — low severity): `getClassroomProgress` has an N+1 query.**

For each enrolled student, a separate `prisma.studentProblemAttempt.findMany` is issued inside a `Promise.all`. At 30 students this is 30 sequential DB round-trips. Not a correctness bug but will cause slow responses as class sizes grow. Consider joining attempts in a single query grouped by `studentId`.

---

## Frontend (P1-T29–T33)

### What's correct

- **All new pages are `'use client'`.** `teacher/page.tsx`, `teacher/classes/[id]/page.tsx`, `teacher/assignments/new/page.tsx`, `parent/page.tsx`, and `student/assignments/[id]/page.tsx` all have `'use client'` as the first line. Correct.
- **`createAssignment` passes `problemIds: string[]`.** `new/page.tsx` calls `createAssignment({ …, problemIds: Array.from(selectedProblemIds), … }, token)`. The `CreateAssignmentData` interface declares `problemIds: string[]`. Correct shape.
- **`submitAssignment` sends correct shape.** `student/assignments/[id]/page.tsx` calls `submitAssignment(assignmentId, { answers: allAnswers }, token)` where `allAnswers` is `{ problemId: string; answer: string }[]`. Matches `SubmitAssignmentDto`. Correct.
- **`getClassroomProgress` and `getChildProgress` URLs match backend.** `/classrooms/${classroomId}/progress` and `/parent/children/${childId}/progress` match controller paths exactly. Correct.
- **`submitAssignment` in `api.ts` URL matches backend.** `/assignments/${assignmentId}/submit` matches `POST :id/submit`. Correct.
- **`getStudentAssignments` URL matches backend.** `/assignments/student` matches `GET assignments/student`. Correct.
- **Empty-state handling.** Teacher dashboard shows "No classes yet" when `classrooms.length === 0`. Class detail shows "No students enrolled yet" and "No progress data available yet". Parent dashboard shows "No children linked yet" gracefully. All correctly handled.
- **Parent dashboard handles no children gracefully.** When `children.length === 0` it renders an explanatory empty-state card rather than erroring.

### Issues found

**Issue F-1 (BLOCKING — critical): `getMyClassrooms` hits wrong URL.**

`api.ts` line 298: `fetch(\`${API_BASE}/classrooms/my\`)`.
Backend controller registers the route as `GET classrooms/mine` (line 34 of `classroom.controller.ts`).
`/classrooms/my` will 404. The teacher dashboard (`teacher/page.tsx`) and the class detail page (which calls `getMyClassrooms` to populate the header) will both fail to load class lists.

**Issue F-2 (BLOCKING — critical): `getMyAssignments` hits wrong URL.**

`api.ts` line 373: `fetch(\`${API_BASE}/assignments/my\`)`.
Backend controller registers the route as `GET assignments/mine` (line 37–42 of `assignment.controller.ts`).
`/assignments/my` will 404. The teacher dashboard's "Recent Assignments" section and the new-assignment page will fail silently (assignments section) or partially (new-assignment page falls back to empty classroom list rather than erroring out, but classrooms load correctly via a separate call).

**Issue F-3 (BLOCKING — critical): Parent dashboard never fetches or receives children list.**

`parent/page.tsx` line 155–157 reads children from `user?.children`, but `AuthUser` (defined in `api.ts` lines 3–8) has no `children` field. No backend endpoint exists that returns the parent's linked children list — there is a `GET /parent/children/:childId/progress` endpoint but no `GET /parent/children` listing endpoint. The `children` array will always be `[]`, so `ChildProgressCard` is never rendered. The parent dashboard shows only the empty-state message regardless of how many children are linked.

**Issue F-4 (NON-BLOCKING — medium severity): `StudentSummary` field name mismatch in class detail table.**

`api.ts` defines `StudentSummary` with field `studentId: string` (line 274), but `ClassroomService.listClassroomStudents` returns objects with field `id` (not `studentId`) — see `classroom.service.ts` line 184: `{ id: e.student.id, name: …, … }`.

In `teacher/classes/[id]/page.tsx` line 220, the student table rows use `key={s.studentId}` — this will be `undefined` for every row, causing React key warnings and potentially unstable rendering. The displayed data (`s.name`, `s.coins`, etc.) is unaffected because those fields do match. Fix: rename the `StudentSummary` interface field from `studentId` to `id`, or update the backend response to use `studentId`.

**Issue F-5 (NON-BLOCKING — low severity): MCQ auto-advance is instantaneous with no visual confirmation.**

When a student clicks an MCQ option, `handleMCQ` immediately calls `advanceOrSubmit`, jumping to the next question before the user can see their selection highlighted. `selectedOption` is set but the component advances before the next render cycle is visible. Minor UX issue — not a data correctness problem.

---

## Required fixes before merge

Three blocking issues must be resolved:

1. **F-1:** Change `getMyClassrooms` in `apps/web/src/lib/api.ts` line 298 from `/classrooms/my` to `/classrooms/mine`.

2. **F-2:** Change `getMyAssignments` in `apps/web/src/lib/api.ts` line 373 from `/assignments/my` to `/assignments/mine`.

3. **F-3:** Either:
   - Add a `GET /parent/children` backend endpoint that returns the authenticated parent's linked children (with `id`, `name`, `grade`), add a corresponding `getMyChildren(token)` function in `api.ts`, call it from `parent/page.tsx` on mount, and populate the `children` state; **or**
   - Return the linked children inside the auth login response and persist them in the auth context so `user.children` is populated.

   Without this fix, the parent dashboard is a permanently empty screen for all parents.

---

## Non-blocking notes

- **B-1:** Add teacher ownership check to `POST /classrooms/:classroomId/students` in a follow-up. Pass `user.userId` from the controller to the service and verify `classroom.teacherId === teacher.id`.
- **B-2:** Refactor `getClassroomProgress` to a single grouped query (e.g., `groupBy studentId` or a raw join) before Trial Gate 1 if class sizes exceed 15.
- **F-4:** Align `StudentSummary.studentId` vs backend's `id` field — low risk since only the React key is wrong, but fix to avoid key-collision warnings.
- **F-5:** Add a 200–300 ms delay or a brief highlight animation before advancing on MCQ selection for better student UX.
- The `classCode` field returned by the backend uses snake_case (`class_code`) in the service response shape (see `classroom.service.ts` line 76), but the `Classroom` interface in `api.ts` uses camelCase `classCode`. This will cause `classroom.classCode` to be `undefined` in the teacher dashboard's classroom cards. Recommend auditing all snake_case vs camelCase field names across the new classroom/assignment endpoints as a follow-up.
