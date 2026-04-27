# Dev Agent 2 Report — P1-T13
**Task:** Auth Frontend — Login & Registration Pages
**Status:** Done
**Branch:** master
**Commit:** (see below)

## What was implemented

Full auth frontend for all three user types (parent, teacher, student):

- Lightweight auth utility (`lib/auth.ts`) for localStorage token management
- API client (`lib/api.ts`) for all auth endpoints: login (adult/student), register parent, register teacher
- React auth context (`components/providers/auth-provider.tsx`) wrapping the app, with login/logout and session cookie management
- Redesigned login page with role-switcher tabs (Parent/Teacher vs Student)
- Registration landing page with role cards, plus parent and teacher registration forms
- Parent dashboard stub with welcome message and empty-state children list
- Student dashboard stub with welcome message and grade level
- Next.js middleware for `/dashboard/*` route protection via `koblio_session` cookie
- Updated root page to a proper landing page with two CTAs (Get Started / Sign In)
- 2 tests for the login form tab switching behaviour

## Pages/components created

| Path | Description |
|---|---|
| `src/lib/auth.ts` | Token storage helpers |
| `src/lib/api.ts` | Auth API client |
| `src/components/providers/auth-provider.tsx` | React auth context + `useAuth()` hook |
| `src/middleware.ts` | Next.js middleware — redirects unauthenticated `/dashboard/*` to `/login` |
| `src/app/register/page.tsx` | Role selection landing (Parent / Teacher cards) |
| `src/app/register/parent/page.tsx` | Parent registration form |
| `src/app/register/teacher/page.tsx` | Teacher registration form |
| `src/app/dashboard/parent/page.tsx` | Parent dashboard stub |
| `src/app/dashboard/student/page.tsx` | Student dashboard stub |
| `src/__tests__/login-form.test.tsx` | Login form tab-switching tests |

## Files changed

| Path | Change |
|---|---|
| `src/app/layout.tsx` | Added `AuthProvider` wrapper |
| `src/app/page.tsx` | Replaced placeholder with landing page copy and CTAs |
| `src/app/login/login-form.tsx` | Full redesign: role tabs, API integration, error handling, redirects |

## Tests written

`src/__tests__/login-form.test.tsx` — 2 tests:
1. Login form renders the Parent / Teacher tab by default with email field visible
2. Switching to the Student tab shows the username field and hides the email field

## Decisions & trade-offs

- **Cookie approach for middleware**: Next.js middleware runs on the Edge runtime and cannot access `localStorage`. A `koblio_session=1` cookie (set by `auth-provider.tsx` at login, cleared at logout) is used as the signal. This is a well-established pattern.
- **`expires_in` on `AuthResponse`**: Added to the API response type to match the NestJS auth module (which returns `expires_in` as seconds). Falls back gracefully — `setStoredToken` accepts the value directly.
- **No Radix UI Tabs**: The tab toggle is a simple pair of `<button>` elements styled with Tailwind to avoid adding a dependency. The existing codebase has no Tabs primitive installed.
- **`AuthUser` in `lib/api.ts`**: Shared type exported and consumed by `auth-provider.tsx` to keep a single source of truth for the user shape.
- **COPPA compliance**: No email field anywhere on the student login path. Students log in with username only.
- **Dashboard stubs** (`/dashboard/parent`, `/dashboard/student`) do not use the teacher `DashboardLayout` (sidebar). They have their own minimal chrome with a logout button — appropriate since these roles have different navigation structures.

## Issues / known gaps

- The `expires_in` field on `AuthResponse` must be provided by the backend. If the NestJS module omits it, the token will be treated as expired immediately. A safe fallback of 3600 seconds could be added if needed.
- The parent/student dashboard stubs bypass the existing teacher `DashboardLayout` (no sidebar). This is intentional for now — role-specific layouts will be added in future sprints.
- `+ Add Child` button on the parent dashboard is disabled (stub) — child management is a future sprint task.
