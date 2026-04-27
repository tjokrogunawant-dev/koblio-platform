# Dev Agent Report — P1-T18, P1-T19, P1-T20

**Date:** 2026-04-27
**Agent:** Implementation Agent (dev2)
**Branch:** master

---

## Summary

Implemented the student topic browser (P1-T18), problem display renderer (P1-T19), and answer submission with feedback (P1-T20).

---

## Files Created / Modified

| File | Action | Task |
|---|---|---|
| `apps/web/src/lib/api.ts` | Modified — added `getProblems`, `getProblemsByGrade`, `getProblem`, `submitAnswer` + types | P1-T18, P1-T20 |
| `apps/web/src/app/learn/page.tsx` | Created — 3-step topic browser (grade → strand/topic → problem list) | P1-T18 |
| `apps/web/src/app/learn/problem/[id]/page.tsx` | Created — problem solver screen with MCQ/fill-blank/true-false renderers, hint system, timer, answer feedback | P1-T19, P1-T20 |
| `apps/web/src/app/dashboard/student/page.tsx` | Modified — added "Start Learning" link to `/learn` | P1-T18 |
| `apps/web/src/__tests__/learn-topic-browser.test.tsx` | Created — 2 tests for grade selection cards | P1-T18 |
| `apps/web/src/__tests__/learn-problem-page.test.tsx` | Created — 2 tests for MCQ option rendering and hint button | P1-T19 |

---

## P1-T18: Topic Browser

- **Grade step:** Three cards (Grade 1, 2, 3). Clicking a grade calls `GET /content/problems/grade/:grade` and transitions to the strand/topic step.
- **Strand/topic step:** Problems are grouped by `strand` (section header) then `topic` (clickable card showing problem count). No second network call needed.
- **Problem list step:** Filtered by selected topic. Each row shows difficulty badge (green/yellow/red), problem type, and truncated question text. Clicking navigates to `/learn/problem/:id`.
- Breadcrumb nav in header for quick back-navigation.
- "Start Learning" button added to student dashboard linking to `/learn`.

## P1-T19: Problem Renderer

- `RichText` helper splits question/option/solution text on `$…$` LaTeX delimiters and renders each math segment via `MathRenderer` from `@koblio/ui`.
- **MCQ:** 4 full-width bordered buttons (A/B/C/D). Auto-submits on click; all disabled while submitting.
- **FILL_BLANK:** Text input (auto-focused) + Submit button. Enter key submits. Whitespace trimmed.
- **TRUE_FALSE:** Two large buttons — "True" and "False". Auto-submits on click.
- Timer counts up in the top-right corner of the question card (seconds elapsed).

## P1-T20: Answer Submission + Feedback

- Calls `POST /attempts` with `{ problemId, answer, timeSpentMs, hintUsed }` and Bearer token.
- **Graceful degradation:** If the API is unavailable (P1-T21 not yet deployed), falls back to local string comparison against `problem.correctAnswer`. Shows amber warning banner but still displays feedback.
- **Correct state:** Green banner (✅), solution card with `RichText` rendering, "Try Another Problem" + "Back to Topics" buttons.
- **Incorrect state:** Red banner (❌), user's answer + correct answer displayed, solution card, "Try Again" (resets timer and form state) + "Back to Topics" buttons.

## Hint System (P1-T22 basic version)

- "Hint" button in header; shows hints sequentially from `problem.hints[]`.
- Button label cycles: `Hint` → `Hint 2` → `No more hints` (disabled when exhausted).
- Sets `hintUsed: true` in the attempt payload if any hint was shown.

---

## Tests

- `learn-topic-browser.test.tsx`: Verifies grade cards (1, 2, 3) render; "Start Learning" heading present.
- `learn-problem-page.test.tsx`: Mocks `getProblem` with an MCQ problem; verifies all 4 option labels and texts render; verifies Hint button present.

---

## Known Gaps / Follow-ups

- `POST /attempts` backend (P1-T21) not yet implemented; graceful fallback is in place.
- No auth guard on `/learn` — middleware only protects `/dashboard`. Consider extending middleware or adding a redirect in the page if `token` is null (deferred to P1-T22 scope).
- `line-clamp-2` utility used on problem list — requires Tailwind `@tailwindcss/line-clamp` plugin if Tailwind < 3.3; current stack uses Tailwind 4.x which includes it natively.
