# Sprint 13 QC Report

**Date:** 2026-04-27  
**Reviewer:** QC Agent  
**Sprint Goal:** Flutter gamification UI + Flutter parent dashboard  
**Commit reviewed:** `85fefcc`

## Overall Status: PASS WITH MINOR ISSUES

---

## P3-T05 Flutter Gamification UI

### Criterion: `BadgeModel.fromJson` maps id, type, awardedAt (DateTime), name, description, iconEmoji

**PASS with note.**  
All six fields are mapped. The `id` field is synthesized as `json['slug'] ?? json['type']` because the backend `/badges/me` endpoint returns `{ type, slug, name, description, iconEmoji, awardedAt }` with no standalone `id` field — this is the correct adaptation. `awardedAt` is parsed via `DateTime.parse()`. All fields have safe fallback defaults.

### Criterion: `StudentStats` has `LevelInfo` (currentLevel/level, progressPercent, xpToNextLevel)

**PASS.**  
`LevelInfo` class is defined in `student_stats.dart` with `currentLevel` (read from JSON key `level`), `xpToNextLevel`, and `progressPercent`. `StudentStats` embeds a `LevelInfo levelInfo` field and constructs it in `fromJson`. A `LevelInfo.empty` sentinel is provided as a safe fallback.

### Criterion: `badgesProvider` calls `GET /badges/me` and reads `response.data` directly (not `.data.badges`)

**PASS.**  
`badgesProvider` calls `api.getMyBadges()` which issues `GET /badges/me` typed as `Response<List<dynamic>>`. The provider then accesses `response.data ?? []` — a bare array, not a nested object. This matches the backend which returns a raw array from `BadgeController`.

### Criterion: `XpProgressBar` shows level label + `LinearProgressIndicator` with progress 0.0–1.0

**PASS.**  
The widget displays `'Level $level'` and a `LinearProgressIndicator`. It receives `progressPercent` in the range 0–100 (as returned by the API) and converts to 0.0–1.0 via `(progressPercent / 100.0).clamp(0.0, 1.0)` before passing to `LinearProgressIndicator.value`. The indicator receives a correctly bounded value.

### Criterion: `StreakCounter` gray at 0, orange at 1-6, golden at 7+

**PASS.**  
Colors are driven by `isEmpty` and `isGolden` flags. `isEmpty` (count == 0) uses `AppColors.textSecondary` (gray). 1–6 uses `AppColors.secondary` (orange/primary). 7+ uses `Color(0xFFFFB300)` (golden amber). A "Bonus x1.5" badge is additionally shown for 7+ streaks.

### Criterion: `BadgeShelf` — empty state card, horizontal scroll of tappable badge cards, `AlertDialog` on tap with name/description/date

**PASS.**  
`_EmptyShelf` renders a styled container card with a "No badges yet — keep solving!" message. `_BadgeRow` uses `ListView` with `scrollDirection: Axis.horizontal` for the badge list. Each `_BadgeCard` is wrapped in `GestureDetector` that calls `_showDetail`, which opens an `AlertDialog` displaying `iconEmoji`, `name`, `description`, and `'Earned on ${_formatDate(badge.awardedAt)}'`.

### Criterion: Student home screen — all three widgets integrated and shown

**PASS.**  
`StudentHomeScreen` watches `studentStatsProvider`, `dailyChallengeProvider`, and `badgesProvider`. `XpProgressBar`, `StreakCounter`, and `BadgeShelf` are all rendered in the `Column`, each wrapped in appropriate `AsyncValue.when()` handlers.

### Criterion: Pull-to-refresh invalidates badges provider too

**PASS.**  
`RefreshIndicator.onRefresh` calls `ref.invalidate(studentStatsProvider)`, `ref.invalidate(dailyChallengeProvider(_defaultGrade))`, and `ref.invalidate(badgesProvider)`. All three providers are invalidated on pull-to-refresh.

---

## P3-T06 Flutter Parent Dashboard

### Criterion: `ChildRef.fromJson` maps id, name, grade

**PASS.**  
`ChildRef.fromJson` reads `json['id']` (String), `json['name']` (String, with empty-string fallback), and `json['grade']` (nullable int). The backend `getLinkedChildren` returns exactly `{ id, name, grade }` — `name` is mapped from `child.displayName` on the backend before the response is sent, so the JSON key `name` is correct.

### Criterion: `ChildProgress.fromJson` maps the backend parent service response

**PASS.**  
Backend `getChildProgress` returns: `totalAttempts`, `correctAttempts`, `accuracyPercent`, `streakCount`, `coins`, `xp`, `level`, `topicBreakdown[]` (each with `topic`, `attempted`, `correct`).  
`ChildProgress.fromJson` maps all eight top-level fields by exact key name. `TopicBreakdown.fromJson` maps `topic`, `attempted`, `correct`. Field names match the backend response exactly — no mismatches found.

### Criterion: `childrenProvider` calls `GET /parent/children`

**PASS.**  
`childrenProvider` is a `FutureProvider<List<ChildRef>>` that calls `api.getMyChildren()`. `getMyChildren()` in `ApiClient` issues `GET /parent/children` (typed as `Response<List<dynamic>>`).

### Criterion: `childProgressProvider` (family) calls `GET /parent/children/:childId/progress`

**PASS.**  
`childProgressProvider` is a `FutureProvider.family<ChildProgress, String>` keyed by `childId`. It calls `api.getChildProgress(childId)` which issues `GET /parent/children/$childId/progress`.

### Criterion: `ParentHomeScreen` — greeting, child list with name/grade/accuracy, pull-to-refresh, empty state

**PASS.**  
`_ParentGreeting` shows `'Welcome, $displayName!'`. `_ChildCard` shows `child.name` (titleLarge), a `_GradeBadge` when `child.grade != null`, and inline `_ProgressSummary` showing total attempts and accuracy percent. `_EmptyChildrenState` is shown when `children.isEmpty`. Pull-to-refresh calls `ref.invalidate(childrenProvider)`.

### Criterion: `ChildDetailScreen` — accuracy progress bar, topics as chips, back button

**PASS.**  
The screen includes a `BackButton` in the `AppBar`. An accuracy card shows a `LinearProgressIndicator` (value = `accuracyPercent / 100.0`). Topics are rendered as `Chip` widgets inside a `Wrap` via `topicBreakdown`, each with a `CircleAvatar` showing the `correct/attempted` ratio. Empty topics state is handled explicitly.

### Criterion: Router has `/parent/home` and `/parent/children/:childId` routes

**PASS.**  
`app_router.dart` defines a `ShellRoute` containing `/parent/home` (mapped to `ParentHomeScreen`). A standalone `GoRoute` for `/parent/children/:childId` is defined outside the shell, rendering `ChildDetailScreen` (or a fallback scaffold if `extra` is null).

### Criterion: After Auth0 login with role PARENT, redirect goes to `/parent/home`

**PASS.**  
The router's `redirect` callback contains: `if (authState.role == 'PARENT') return '/parent/home';` — triggered when an authenticated user is on `/`, `/role-select`, or `/login`. Non-parent roles fall through to `/home`.

### Criterion: Shell screen shows different bottom nav items for PARENT vs STUDENT role

**PASS.**  
`ShellScreen` reads `authState.isParent` (a getter on `AuthState` verified to exist in `providers.dart`). When `isParent` is true, the `NavigationBar` shows "Dashboard" and "Profile" tabs pointing to `/parent/home` and `/parent/profile`. When false, it shows "Home" and "Profile" tabs for student routes.

---

## Blockers (must fix before Sprint 14)

None.

---

## Non-Blocking Issues

1. **`BadgeModel.id` synthesized from slug/type (minor AC deviation).** The acceptance criterion listed `id` as a mapped field. The backend `/badges/me` does not emit an `id` key; the Flutter code correctly documents this and falls back to `slug ?? type`. Functionally correct, but the AC assumption of a literal `id` field is worth updating in the ticket for accuracy.

2. **`XpProgressBar` accepts 0–100 range, not 0.0–1.0.** The AC states "progress 0.0–1.0" but the widget's public API takes `progressPercent` in 0–100 (matching the API). Internal conversion to 0.0–1.0 for `LinearProgressIndicator` is correct. The widget's inline doc comment explains the convention. No runtime issue, but the AC wording is misleading.

3. **`ChildRef.grade` is nullable (`int?`), backend may return `undefined` for grade.** Backend maps `l.child.grade ?? undefined` — in TypeScript this omits the key from JSON entirely. Flutter handles this correctly with `(json['grade'] as num?)?.toInt()` (null-safe). No bug, but worth noting the nullable contract is intentional.

4. **Parent shell `/parent/profile` uses shared `ProfileScreen`.** No profile screen tailored for parents is implemented — the student `ProfileScreen` is reused at `/parent/profile`. This is acceptable for MVP but should be tracked as a future polish item.
