# P3-T02 Dev Report — Flutter Student Dashboard Screens

**Date:** 2026-04-27
**Task:** Build student-facing Flutter screens — dashboard, problem browser, problem solver

---

## What Was Built

### Models (`apps/mobile/lib/features/student/models/`)

| File | Description |
|---|---|
| `problem_option.dart` | `ProblemOption { label, text }` with fromJson/toJson |
| `problem.dart` | `Problem` with all ProblemDto fields — fromJson/toJson |
| `attempt_result.dart` | `AttemptResult` matching the `POST /attempts` response shape |
| `student_stats.dart` | `StudentStats { coins, xp, level, streakCount }` from `/gamification/me` |

### Providers (`apps/mobile/lib/features/student/providers/`)

| File | Provider |
|---|---|
| `problems_provider.dart` | `problemsProvider(grade)` — `FutureProvider.family` fetching `GET /content/problems?grade=$grade` |
| `problems_provider.dart` | `dailyChallengeProvider(grade)` — fetching `GET /gamification/daily-challenge/$grade` |
| `student_stats_provider.dart` | `studentStatsProvider` — fetching `GET /gamification/me` |

Note: Used `FutureProvider` / `FutureProvider.family` directly (no code generation / build_runner) since shell commands cannot be run.

### Widgets (`apps/mobile/lib/features/student/widgets/`)

- `stat_card.dart` — Icon + value + label in rounded card; uses `AppColors.primary`
- `difficulty_badge.dart` — EASY=green, MEDIUM=amber, HARD=red colored chip with border

### Screens (`apps/mobile/lib/features/student/screens/`)

**`student_home_screen.dart`**
- Greeting row with avatar emoji + displayName from `authProvider`
- Live stats row (coins / XP+level / streak) from `studentStatsProvider`
- Daily challenge card (yellow accent) — loads from `dailyChallengeProvider(2)`; taps into ProblemSolverScreen via `state.extra`
- "Browse Problems" button → `/student/problems`
- Pull-to-refresh invalidates stats + daily challenge providers

**`problem_list_screen.dart`**
- Grade selector (1, 2, 3) as ChoiceChip horizontal scroll
- ListView of problem tiles showing topic, strand, `DifficultyBadge`, type label
- Tap → `/student/problems/solve` with `Problem` passed as `state.extra`
- Empty state, error state with retry, pull-to-refresh

**`problem_solver_screen.dart`**
- Accepts `Problem` via GoRouter `state.extra`
- Renders question text in card with optional hint toggle
- Answer input switches on `problem.type`:
  - `MCQ` — animated option buttons (A/B/C/D) with selection highlight
  - `FILL_BLANK` — `TextField` with text input
  - `TRUE_FALSE` — two large "True" / "False" toggle buttons
- Timer (MM:SS) shown in AppBar chip, stops on submit
- Submit → `POST /attempts` via `apiClientProvider`
- Result overlay (bottom sheet style):
  - Green: "Correct! +{coins} coins · +{xp} XP"
  - Red: "Incorrect — Correct answer: {correctAnswer}"
  - Shows solution text
  - Level-up indicator if `leveledUp == true`
  - "Try Again" (wrong only) + "Next Problem" (pops back) buttons
- Loading spinner during submission; SnackBar on network error

### Router Updates (`apps/mobile/lib/router/app_router.dart`)

Added four routes outside the shell:
- `/student` → redirects to `/student/dashboard`
- `/student/dashboard` → `StudentHomeScreen`
- `/student/problems` → `ProblemListScreen`
- `/student/problems/solve` → `ProblemSolverScreen(problem: state.extra)`

### ApiClient Extensions (`apps/mobile/lib/services/api_client.dart`)

Added four convenience methods:
- `getProblems(int grade)` → `GET /content/problems?grade=…`
- `getDailyChallenge(int grade)` → `GET /gamification/daily-challenge/$grade`
- `submitAnswer({ problemId, answer, timeSpentMs, hintUsed })` → `POST /attempts`
- `getStudentStats()` → `GET /gamification/me`

---

## API Shapes Confirmed from Backend

- Attempt submit: `POST /attempts` (controller path is `/attempts`, not `/attempt/submit`)
- Daily challenge: `GET /gamification/daily-challenge/:grade` (on GamificationController, not ContentController)
- Student stats: `GET /gamification/me` → `{ coins, xp, level, streakCount, levelInfo }`
- Problems list: `GET /content/problems?grade=…` → `{ data: ProblemDto[], total, limit, offset }`

---

## Notes

- No `flutter_math_forge` / KaTeX — plain `Text` widget for `questionText` as specified (Sprint 12 task)
- Providers use `FutureProvider` style (not `@riverpod` codegen) — avoids needing `build_runner` in a no-shell environment; upgrading to generated providers is a trivial refactor
- Default student grade is hardcoded to `2` in `StudentHomeScreen` — will be driven by student profile once the profile endpoint is wired
- MCQ option buttons type-safe: `options` field on `Problem` is `List<ProblemOption>?`, solver casts correctly

---

## Files Changed

```
apps/mobile/lib/features/student/models/problem_option.dart      (new)
apps/mobile/lib/features/student/models/problem.dart             (new)
apps/mobile/lib/features/student/models/attempt_result.dart      (new)
apps/mobile/lib/features/student/models/student_stats.dart       (new)
apps/mobile/lib/features/student/providers/problems_provider.dart        (new)
apps/mobile/lib/features/student/providers/student_stats_provider.dart   (new)
apps/mobile/lib/features/student/widgets/stat_card.dart          (new)
apps/mobile/lib/features/student/widgets/difficulty_badge.dart   (new)
apps/mobile/lib/features/student/screens/student_home_screen.dart        (new)
apps/mobile/lib/features/student/screens/problem_list_screen.dart        (new)
apps/mobile/lib/features/student/screens/problem_solver_screen.dart      (new)
apps/mobile/lib/router/app_router.dart                           (updated)
apps/mobile/lib/services/api_client.dart                         (updated)
sprint_tracker/agent_reports/dev2_p3t02_report.md                (new)
```
