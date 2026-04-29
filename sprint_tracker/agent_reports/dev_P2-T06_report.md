# Dev Report: P2-T06 — Paywall Enforcement

**Date:** 2026-04-29  
**Agent:** DEV  
**Status:** Done — all acceptance criteria met, all tests pass

---

## What Was Built

Enforced a 5-problems/day limit for free-tier students across the API and web layers:

1. **`AttemptService.submitAnswer`** now fetches the submitting user's `subscriptionStatus` before any other work. If the status is not `'active'`, it counts that student's `StudentProblemAttempt` records with `createdAt >= start of current UTC day`. If the count is ≥ 5, it throws `ForbiddenException('Daily problem limit reached')` and the attempt is not recorded. Premium users (`'active'`) bypass this check entirely.

2. **`apps/web/src/lib/errors.ts`** (new) — exports `PaywallError extends Error` with `name = 'PaywallError'`.

3. **`submitAnswer` in `api.ts`** — intercepts the response before calling `handleResponse`. If `res.status === 403` and the body message is `'Daily problem limit reached'`, throws `PaywallError` instead of a generic `Error`.

4. **`problem/[id]/page.tsx`** — adds `paywallHit` state. In `handleSubmit`, `PaywallError` is caught separately (no local-comparison fallback). A local `isPaywallError` flag prevents the `finally` block from transitioning to `'ANSWERED'` state, keeping the problem page visible behind the paywall overlay. The paywall modal renders as a full-screen fixed overlay with the required heading, body copy, "Upgrade to Premium" link, and "Continue Learning Tomorrow" link.

---

## Files Created

| File | Change |
|---|---|
| `apps/web/src/lib/errors.ts` | New — `PaywallError extends Error` |
| `sprint_tracker/agent_reports/dev_P2-T06_report.md` | New — this report |

## Files Modified

| File | Change |
|---|---|
| `apps/api/src/attempt/attempt.service.ts` | Added `ForbiddenException` import; added user subscription check + daily count at top of `submitAnswer` |
| `apps/api/src/attempt/attempt.service.spec.ts` | Added `ForbiddenException` import; added `user.findUnique` mock; added 3 new paywall unit tests |
| `apps/web/src/lib/api.ts` | Added `PaywallError` import; 403 interception in `submitAnswer` |
| `apps/web/src/app/learn/problem/[id]/page.tsx` | Added `PaywallError` import; `paywallHit` state; `isPaywallError` guard in `handleSubmit`; paywall modal render |

---

## Deviations from Brief

None. All implementation follows the brief exactly.

---

## Test Results

- `pnpm typecheck`: 0 errors (6/6 packages pass)
- `pnpm test`:
  - `@koblio/api`: 189/189 passed (23 suites) — includes 3 new paywall unit tests
  - `@koblio/web`: 38/38 passed (10 suites)
  - `@koblio/ui`: 66/66 passed (10 suites)
