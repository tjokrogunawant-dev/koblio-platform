# QC Report: TG1-T01 — Student Profile Setup Page

**Sprint:** 19  
**Task ID:** TG1-T01  
**Reviewed by:** QA agent  
**Date:** 2026-04-27  
**Verdict: PASS WITH NBI**

---

## Files Reviewed

| File | Role |
|---|---|
| `apps/api/src/user/dto/update-profile.dto.ts` | New DTO (created) |
| `apps/api/src/user/user.controller.ts` | `PUT /me/profile` route added |
| `apps/api/src/user/user.service.ts` | `updateProfile()` method added |
| `apps/web/src/lib/api.ts` | `UpdateProfileResponse` + `updateProfile()` function added |
| `apps/web/src/components/providers/auth-provider.tsx` | `updateUser` added to context |
| `apps/web/src/app/profile/setup/page.tsx` | Full rewrite with display name input + auth guard |

---

## Acceptance Criteria Verification

| # | Criterion | Result | Notes |
|---|---|---|---|
| 1 | Display name input pre-filled from `user?.name` | **PASS** | `useState(user?.name ?? '')` on line 20 of setup page |
| 2 | Inline error < 2 chars; Save disabled until ≥ 2 chars AND avatar selected | **PASS** | Error rendered when `0 < length < 2`; button `disabled={!selected \|\| saving \|\| displayName.trim().length < 2}` |
| 3 | Avatar 8-slug grid preserved | **PASS** | Grid renders `AVATAR_SLUGS` from `AVATAR_MAP`; aria-pressed, selection highlight, 4-column layout all intact |
| 4 | Save calls `PUT /me/profile` with `{ displayName, avatarSlug }` → redirect `/dashboard/student` | **PASS** | `updateProfile(...)` + `router.push('/dashboard/student')` in `handleSave` |
| 5 | Backend atomically persists both fields, returns `{ id, displayName, avatarSlug }` | **PASS** | Single `prisma.user.update()` call; conditional `data` object handles partial updates; correct return shape |
| 6 | `AuthContext` and localStorage updated without page refresh | **PASS** | `updateUser({ name: result.displayName, avatarSlug: result.avatarSlug ?? undefined })` patches both state and localStorage |
| 7 | Unauthenticated visit redirects to `/login` | **PASS** | `useEffect(() => { if (!token) router.push('/login'); }, [token, router])` |
| 8 | Skip link → `/dashboard/student` without saving | **PASS** | `<Link href="/dashboard/student">Skip</Link>` |

---

## Non-Blocking Issues (NBI)

**NBI-1 — Cold-load flash on unauthenticated visit to `/profile/setup`**  
The middleware only guards `/dashboard/*`. The `/profile/setup` auth guard runs client-side via `useEffect`, which means unauthenticated users see a brief render of the page before the redirect fires. The brief explicitly documents this trade-off. Acceptable for MVP; can be addressed by extending the middleware matcher to include `/profile/setup` in a future pass.

**NBI-2 — No skip cookie/flag to prevent re-showing profile setup after Skip**  
A student who clicks Skip will be taken to `/dashboard/student`, but nothing marks "setup was skipped." If a teacher or future logic checks `avatarSlug === null` to decide whether to prompt setup, they'll always be prompted. Low severity for Trial Gate 1 since the "Pick your avatar →" link on the dashboard is the only reminder; no forced redirect exists. Defer to Section 6.

---

## Summary

All 8 acceptance criteria pass. The implementation matches the brief exactly. The two NBIs are pre-acknowledged design trade-offs, not regressions. Marking **PASS WITH NBI**.
