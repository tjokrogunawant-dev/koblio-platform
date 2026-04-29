# QC Report: P2-T06 — Paywall Enforcement

**Sprint:** 20  
**Date:** 2026-04-29  
**Reviewer:** QA Agent  
**Verdict: PASS WITH NBI**

---

## Files Reviewed

- `apps/api/src/attempt/attempt.service.ts`
- `apps/api/src/attempt/attempt.service.spec.ts`
- `apps/web/src/lib/errors.ts`
- `apps/web/src/lib/api.ts`
- `apps/web/src/app/learn/problem/[id]/page.tsx`

---

## Acceptance Criteria Evaluation

### AC1 — `AttemptService.submitAnswer` fetches `subscriptionStatus` from Prisma before any other work
**PASS**

Lines 38–41 of `attempt.service.ts` perform `this.prisma.user.findUnique({ where: { id: studentId }, select: { subscriptionStatus: true } })` as the first awaited operation in `submitAnswer`, before the problem lookup or any other work.

---

### AC2 — If `subscriptionStatus !== 'active'`, count today's UTC attempts
**PASS**

Lines 43–47: the `if (!user || user.subscriptionStatus !== 'active')` guard correctly routes free/canceled/null users into the count block. The UTC midnight boundary `new Date(new Date().toISOString().slice(0, 10))` exactly matches the spec. The Prisma filter `{ studentId, createdAt: { gte: todayUtc } }` is correct.

---

### AC3 — If count >= 5, throw `ForbiddenException('Daily problem limit reached')` — attempt NOT recorded
**PASS**

Lines 48–50 throw the exception before `this.prisma.studentProblemAttempt.create` (line 67), so the attempt record is never written. The exception message matches the spec exactly.

---

### AC4 — If count < 5 or `subscriptionStatus === 'active'`, proceed as before
**PASS**

Active users skip the guard block entirely (condition is `false`). Free users with count < 5 fall through normally. No behavioral change to the rest of `submitAnswer`.

---

### AC5 — Unit tests: (a) free under limit, (b) free at limit, (c) premium at/over 5
**PASS**

Three new tests at lines 294–343 of `attempt.service.spec.ts`:

- **(a)** "should record attempt when free user is under the daily limit (4 attempts today)": mocks `count` to return 4; verifies `create` is called. ✅
- **(b)** "should throw ForbiddenException when free user has reached the daily limit (5 attempts today)": mocks `count` to return 5; verifies `ForbiddenException` is thrown and `create` is NOT called. ✅
- **(c)** "should record attempt when premium user has 5 or more attempts today": mocks `findUnique` to return `{ subscriptionStatus: 'active' }`; verifies `create` is called. ✅

`mockResolvedValueOnce` is used correctly so subsequent `count` calls (for badge stats) fall through to the default `mockResolvedValue(0)` without interfering.

---

### AC6 — `apps/web/src/lib/errors.ts` exports `PaywallError extends Error` with `name = 'PaywallError'`
**PASS**

```ts
export class PaywallError extends Error {
  name = 'PaywallError';
}
```

Standard instance property pattern. `instanceof` checks work correctly.

---

### AC7 — `submitAnswer` in `api.ts` throws `PaywallError` on `res.status === 403` + exact message
**PASS**

Lines 247–259 of `api.ts` intercept the response before calling `handleResponse`. Status is checked as `res.status === 403`. Body is parsed; message is normalized to handle NestJS's array-or-string format. The string equality check `=== 'Daily problem limit reached'` matches exactly. A `PaywallError` (not generic `Error`) is thrown. Non-matching 403s fall through to `handleResponse` as generic errors.

---

### AC8 — `handleSubmit` catches `PaywallError` separately, no local fallback, sets `paywallHit = true`
**PASS**

Lines 154–189 of `page.tsx`:

- `let isPaywallError = false` flag declared before the try block.
- `catch` block uses `err instanceof PaywallError` to branch separately.
- On `PaywallError`: `setPaywallHit(true)` is called; `isPaywallError = true`; no `setResult(...)` call (no local fallback).
- `finally`: `setSubmitting(false)` always runs; `setPageState('ANSWERED')` is guarded by `if (!isPaywallError)` — so the page stays in `QUESTION` state when the paywall is hit.

---

### AC9 — Paywall modal: heading, body, links
**PASS**

Lines 234–259 of `page.tsx` render when `paywallHit`:

- Fixed full-screen overlay (`fixed inset-0 z-50`) — not a page redirect, not a Next.js `<Dialog>` or shadcn/ui `<Modal>`.
- Heading: `"Daily limit reached"` ✅
- Body: `"You've used all 5 free problems for today. Upgrade to Premium for unlimited practice."` ✅
- `<Link href="/subscribe">Upgrade to Premium</Link>` ✅
- `<Link href="/learn">Continue Learning Tomorrow</Link>` ✅

---

### AC10 — `pnpm typecheck` passes with 0 errors
**PASS** (per dev report: 6/6 packages, 0 errors)

---

### AC11 — `pnpm test` passes including new unit tests
**PASS** (per dev report: 189/189 API tests, 38/38 web tests, 66/66 UI tests)

---

## Non-Blocking Issues (NBIs)

### NBI-P2T06-1 — Null user treated as free tier rather than rejected

In `attempt.service.ts` line 43, the guard is `if (!user || user.subscriptionStatus !== 'active')`. If the DB lookup returns `null` (theoretically impossible because the JWT auth guard validates the student exists, but possible in edge cases like a deleted account with a still-valid token), the null user is silently treated as free tier and subjected to the 5/day limit rather than receiving a `NotFoundException`.

**Impact:** Negligible in practice — the JWT guard prevents deleted users from reaching this path. The code is functionally correct for all reachable states.

**Suggested fix (optional):** Add an explicit `if (!user) throw new NotFoundException('Student not found');` before the subscription check.

---

## Summary

All 11 acceptance criteria pass. Implementation is clean and matches the brief exactly — the `isPaywallError` guard pattern in `finally` correctly prevents the ANSWERED state transition, the 403 interception in `api.ts` is precise (keyed on exact message string, handles NestJS array format), and the paywall modal is an inline overlay as specified. One minor NBI logged for future hardening.

**Verdict: PASS WITH NBI**
