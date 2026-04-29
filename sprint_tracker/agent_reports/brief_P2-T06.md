# Brief: P2-T06 — Paywall Enforcement

## What to Build

Enforce a 5-problems/day limit for free-tier students. When a free-tier student has submitted 5 or more problem attempts in the current UTC day, `POST /attempts` must reject with `403 ForbiddenException('Daily problem limit reached')`. The web problem-solving page must catch this 403 as a `PaywallError` and show a paywall modal (not the generic network-error fallback). Premium students (`subscriptionStatus = 'active'`) are never limited.

No Stripe credentials are required — the `subscriptionStatus` field on `User` is already updated by the existing Stripe webhook handler. The limit works in test mode and with no Stripe key (all users default to `"free"`).

---

## Files to Create

- `apps/web/src/lib/errors.ts` — export `PaywallError extends Error` class (one line; gives us a named type to `instanceof`-check in the problem page)

## Files to Modify

- `apps/api/src/attempt/attempt.service.ts` — add daily limit check in `submitAnswer`
- `apps/api/src/attempt/attempt.service.spec.ts` — add unit tests for the limit
- `apps/web/src/lib/api.ts` — import `PaywallError`; detect 403 + matching message in `submitAnswer` and throw `PaywallError`
- `apps/web/src/app/learn/problem/[id]/page.tsx` — add `paywallHit` state; catch `PaywallError` in `handleSubmit`; render paywall modal

---

## Acceptance Criteria

- [ ] `AttemptService.submitAnswer` fetches the submitting user's `subscriptionStatus` from Prisma before any other work
- [ ] If `subscriptionStatus !== 'active'`, count the student's `StudentProblemAttempt` records where `createdAt >= start of current UTC day`
- [ ] If count >= 5, throw `ForbiddenException('Daily problem limit reached')` — the attempt is NOT recorded
- [ ] If count < 5 or `subscriptionStatus === 'active'`, proceed as before (no behaviour change)
- [ ] Unit tests in `attempt.service.spec.ts` cover: (a) free user under limit → attempt recorded, (b) free user at limit → ForbiddenException, (c) premium user at/over 5 → attempt recorded
- [ ] `apps/web/src/lib/errors.ts` exports `PaywallError extends Error` with `name = 'PaywallError'`
- [ ] `submitAnswer` in `api.ts` throws `PaywallError` (not a generic `Error`) when `res.status === 403` and the response body message is `'Daily problem limit reached'`
- [ ] `handleSubmit` in `problem/[id]/page.tsx` catches `PaywallError` separately — does NOT fall back to local comparison; sets `paywallHit = true`
- [ ] When `paywallHit` is `true`, the problem page renders a paywall modal (not a full page redirect): heading "Daily limit reached", body "You've used all 5 free problems for today. Upgrade to Premium for unlimited practice.", "Upgrade to Premium" button as `<Link href="/subscribe">`, "Continue Learning Tomorrow" link as `<Link href="/learn">`
- [ ] `pnpm typecheck` passes with 0 errors
- [ ] `pnpm test` passes (including new unit tests)

---

## Stack Notes

- **Do not use `TooManyRequestsException` (429)** — NestJS maps `ForbiddenException` to 403 which is semantically correct (you are authenticated but not authorized to exceed the limit). The web side keys off `res.status === 403` + the exact message string.
- **UTC day boundary:** `new Date(new Date().toISOString().slice(0, 10))` gives midnight UTC for today as a `Date` object. Use this as the `gte` value in the Prisma `where` filter.
- **Import path for `PaywallError` in api.ts:** `import { PaywallError } from './errors'`
- **The paywall modal should be inline** (not a Next.js `<Dialog>` or shadcn/ui `<Modal>`) — a simple positioned `div` overlay or a conditionally rendered full-screen panel is fine. Keep it in the same file as the problem page.
- **Do not add a new API route** — the 403 response from the existing `POST /attempts` endpoint is sufficient. No `/paywall` endpoint needed.
- **`subscriptionStatus` current values:** `"free"` (default), `"active"` (Stripe webhook sets this on `customer.subscription.updated` with status `active`), `"canceled"`. Only `"active"` bypasses the limit.
- **Existing `AttemptService` constructor** injects `PrismaService`, `GamificationService`, `BadgeService`, `MasteryService`, `SchedulerService`, `LeaderboardService`. Add the user lookup via `this.prisma.user.findUnique({ where: { id: studentId }, select: { subscriptionStatus: true } })` at the top of `submitAnswer`.

## Current state of key files

**`apps/api/src/attempt/attempt.service.ts:24-37`** — `submitAnswer` signature and opening:
```ts
async submitAnswer(studentId: string, dto: SubmitAnswerDto): Promise<{...}> {
  const problem = await this.prisma.problem.findUnique({ where: { id: dto.problemId } });
  // ... no daily limit check here yet
```

**`apps/web/src/lib/api.ts:234-246`** — `submitAnswer`:
```ts
export async function submitAnswer(data, token): Promise<SubmitAnswerResponse> {
  const res = await fetch(`${API_BASE}/attempts`, { method: 'POST', ... });
  return handleResponse<SubmitAnswerResponse>(res);  // throws Error on non-ok
}
```
`handleResponse` at line 33 throws `Error(message)` for any non-ok status. You need to intercept before it reaches `handleResponse` to get the raw status code.

**`apps/web/src/app/learn/problem/[id]/page.tsx:139-177`** — `handleSubmit`:
```ts
async function handleSubmit(answer: string) {
  // ...
  try {
    const res = await submitAnswer({ problemId, answer, timeSpentMs, hintUsed }, token ?? '');
    setResult({ correct: res.correct, ... });
  } catch {
    setSubmitError('Could not record your answer (server unavailable).');
    setResult({ correct: localCorrect, ... }); // ← do NOT do this for PaywallError
  } finally {
    setSubmitting(false);
    setPageState('ANSWERED');
  }
}
```
The `finally` sets `pageState = 'ANSWERED'` — you need to `return` early (before `finally` runs, or handle in a way that keeps the page in `'QUESTION'` state showing the modal). Simplest approach: add `paywallHit` as a separate state flag and render the paywall overlay before the normal QUESTION/ANSWERED render tree.

## Definition of Done

All acceptance criteria above have passing tests. DASHBOARD.md and agent_status.md updated. Changes committed and pushed to master.
