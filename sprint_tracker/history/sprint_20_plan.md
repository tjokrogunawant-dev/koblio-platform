# Sprint 20 Plan — 2026-04-29 to 2026-05-10

## Sprint Goal

Close the last Section 6 gap (P2-T06 paywall enforcement) and harden auth hydration so the platform is fully ready for Trial Gate 2 closed beta.

---

## Roadmap Context

Section 6 of 10 — Growth Features (Web)  
Next Trial Gate: **Trial Gate 2 (~Aug 2026)** — closed beta with pilot schools + 100 beta testers.

Trial Gate 2 requirements vs. current state:

| Requirement | Status |
|---|---|
| Everything from Trial Gate 1 | ✅ Complete (14/14) |
| Badges + avatar customization | ✅ Done (P2-T01, T02, T03) |
| Weekly email digest | ✅ Done (P2-T04) |
| Stripe subscriptions | ✅ Done (P2-T05) |
| 200+ problems across grades 1–3 | ✅ Done (P2-T08) |
| **Paywall enforcement (free tier limit)** | ❌ **Missing — this sprint** |

After Sprint 20, all Trial Gate 2 code-side requirements will be met. Deployment + beta user onboarding can begin.

---

## Tasks This Sprint

| Task ID | Title | Owner Role | Priority | Est. Days | Summary |
|---|---|---|---|---|---|
| P2-T06 | Paywall enforcement | Backend + Frontend | P0 | 2 | 5-problems/day free-tier limit in API; paywall modal in web UI |
| TG1-POLISH-01 | Auth hydration hardening | Frontend | P2 | 0.5 | Add `hydrated` flag to `AuthProvider`; fix cold-load `displayName` pre-fill |

---

## Carry-Over from Sprint 19

No task carry-over — Sprint 19 completed 4/4 tasks. Three NBIs are tracked as work items:

| NBI | Source | Disposition |
|---|---|---|
| NBI-TG1-T01-1 (displayName cold-load) | S19 QC | Addressed in TG1-POLISH-01 |
| NBI-TG1-T01-2 (auth hydration flash) | S19 QC | Addressed in TG1-POLISH-01 |
| NBI-TG1-T03-1 (method ordering in email.service.ts) | S19 QC | Cosmetic; log as backlog item, do not block |

---

## Risks & Blockers

- **Stripe credentials for live mode** — P2-T06 paywall enforcement works without Stripe credentials in test mode. The limit is enforced based on `subscriptionStatus` already stored in the User record by the webhook handler. No Stripe credentials required to implement or test the enforcement.
- **e2e CI run** — the first push this sprint will be the first live execution of the Playwright golden-path test added in S19. Monitor CI; most likely failure mode is seed data gap (unlikely given 200 problems). If it fails, brief DEV to fix the seed before continuing.
- **No AWS credentials** — Section 9 (AWS/ECS) is not in scope until 5K+ MAU. Ignore any ECS deploy failures in CI.

---

## Definition of Done for This Sprint

- [ ] P2-T06: Free-tier students are blocked after 5 problem submissions in a UTC day; `ForbiddenException` returned by API with status 403; paywall modal shown in web UI with upgrade CTA; premium users (subscriptionStatus = 'active') are not affected; unit tests pass
- [ ] TG1-POLISH-01: `AuthProvider` exports `hydrated`; auth guards in `profile/setup` and `student/dashboard` wait for `hydrated` before redirecting; `displayName` pre-fills on cold load
- [ ] All tasks have passing QA sign-off
- [ ] DASHBOARD.md and agent_status.md updated after each task

---

## Notes for Implementation Agent

**Start with P2-T06** — it is the only blocking item for Trial Gate 2.

Key implementation points:
- `subscriptionStatus` is already on `User` model (`String? @default("free")`). Values: `"free"`, `"active"`, `"canceled"`.
- The limit check belongs in `AttemptService.submitAnswer` in `apps/api/src/attempt/attempt.service.ts` — add it before the `problem.findUnique` call.
- Count `StudentProblemAttempt` records for today's UTC day: `createdAt >= startOfToday()` where `startOfToday()` returns `new Date(new Date().toISOString().slice(0, 10))`.
- Throw `ForbiddenException('Daily problem limit reached')` if count >= 5 and user is not `'active'`.
- On the web side, `handleResponse` in `api.ts` already throws `Error(message)` for non-ok responses. Add a `PaywallError extends Error` class; in `submitAnswer`, detect `res.status === 403` and message matching `'Daily problem limit reached'`; throw `PaywallError` instead.
- In `problem/[id]/page.tsx`, catch `PaywallError` separately in `handleSubmit` — do NOT fall back to local comparison. Show paywall modal instead.

**TG1-POLISH-01 is independent** — DEV can implement it in the same PR or a separate commit after P2-T06.
