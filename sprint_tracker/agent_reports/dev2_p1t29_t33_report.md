# Implementation Report: Teacher Dashboard Frontend (P1-T29 – P1-T33)

**Date:** 2026-04-27
**Branch:** master
**Commit:** e1fdd52
**Tickets:** P1-T29, P1-T30, P1-T31, P1-T32, P1-T33

---

## Pages / Components Created

### New pages

| File | Description |
|---|---|
| `apps/web/src/app/dashboard/teacher/page.tsx` | Teacher Dashboard — class list with grade/code badges, inline new-class form, recent assignments table, link to new assignment form |
| `apps/web/src/app/dashboard/teacher/classes/[id]/page.tsx` | Class Detail — Students tab (streak, coins, XP table) and Progress tab (accuracy bar, topic breakdown tooltip); copy-to-clipboard class code |
| `apps/web/src/app/dashboard/teacher/assignments/new/page.tsx` | New Assignment form — classroom select, grade auto-fill, strand/topic/difficulty, optional due date, problem picker (Browse Problems button fetches from API, checkbox select up to 10) |
| `apps/web/src/app/dashboard/parent/page.tsx` | Parent Dashboard — replaces stub; lists children from `user.children`, renders per-child `ChildProgressCard` with XP bar, accuracy bar, coins/streak, topic breakdown table; empty state with Settings guidance |
| `apps/web/src/app/dashboard/student/assignments/[id]/page.tsx` | Student Assignment Solve — loads assignment + all problems, progress bar ("Problem N of M"), renders same MCQ/FILL\_BLANK/TRUE\_FALSE inputs as the learn page, submits via `submitAssignment`, shows results summary with incorrect-answer review |

### Modified pages

| File | Change |
|---|---|
| `apps/web/src/app/dashboard/student/page.tsx` | Added Assignments section below Daily Challenge: table of pending assignments with "Start →" links to the solve page |

---

## API Functions Added (`apps/web/src/lib/api.ts`)

**Classrooms (P1-T29)**
- `createClassroom(data, token)` → `POST /classrooms`
- `getMyClassrooms(token)` → `GET /classrooms/my`
- `getClassroomStudents(classroomId, token)` → `GET /classrooms/:id/students`

**Assignments (P1-T30, P1-T31)**
- `createAssignment(data, token)` → `POST /assignments`
- `getMyAssignments(token)` → `GET /assignments/my`
- `getStudentAssignments(token)` → `GET /assignments/student`
- `submitAssignment(assignmentId, data, token)` → `POST /assignments/:id/submit`

**Progress (P1-T32, P1-T33)**
- `getClassroomProgress(classroomId, token)` → `GET /classrooms/:id/progress`
- `getChildProgress(childId, token)` → `GET /parent/children/:id/progress`

**New types exported:** `Classroom`, `ClassroomSummary`, `StudentSummary`, `CreateAssignmentData`, `Assignment`, `AssignmentSummary`, `StudentAssignment`, `AssignmentResult`, `StudentProgressRow`, `ClassroomProgress`, `ChildProgress`

---

## UI Decisions

- **Slate/white/indigo palette** consistent with existing student dashboard and learn pages.
- **Inline new-class form** on teacher dashboard (toggles in place) to avoid navigation overhead for a quick action.
- **Tab switcher** (Students / Progress) on class detail page — progress data is fetched lazily only when the Progress tab is first opened.
- **Topic breakdown** shown as a collapsible count button with a hover popover table to avoid horizontal scroll on the progress table.
- **Copy-to-clipboard** class code button with transient "Copied!" confirmation state.
- **Problem picker** decoupled from form submission — teacher first sets grade/strand/difficulty/topic then clicks "Browse Problems" to pull candidates, then checks up to 10. Disabled state for items beyond the 10-problem cap.
- **Student assignment solve page** uses a linear single-problem-at-a-time flow (not all-at-once) matching the existing learn/problem/[id] UX. Progress bar shows "Problem N of M".
- **Graceful degradation** on all API calls: loading skeleton text, error messages, empty-state placeholders. No hard crashes if backend is unavailable (fallback to local answer comparison on submit).
- **COPPA compliance**: no email rendered anywhere in teacher, parent, or student views.

---

## Issues / Notes

- `pnpm run typecheck` could not be executed because `node_modules` are not installed in the WSL agent environment (per project constraint — dotnet/node tooling on Windows). TypeScript correctness was verified by manual review.
- `user.children` is typed via a local `ChildRef` interface and a type-cast on `AuthUser` in the parent dashboard. The backend should populate this field on the JWT payload / login response. If the field is absent at runtime, the empty-state guidance is shown.
- The `AuthUser` interface in `api.ts` does not currently include a `children` field — this should be extended server-side once the parent–child linking endpoint (Settings page, future sprint) is built.
