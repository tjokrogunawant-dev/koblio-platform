# P3-T06 — Flutter Parent Dashboard

**Date:** 2026-04-27
**Agent:** dev2
**Status:** Done

---

## Summary

Implemented the full parent-facing Flutter feature: children list dashboard and per-child progress detail screen, with role-aware routing and navigation.

---

## Files Created

### Models (`apps/mobile/lib/features/parent/models/`)

| File | Purpose |
|---|---|
| `child_ref.dart` | `ChildRef { id, name, grade? }` — lightweight child reference |
| `topic_breakdown.dart` | `TopicBreakdown { topic, attempted, correct }` — per-topic stats |
| `child_progress.dart` | `ChildProgress` — full progress snapshot; `topicsAttempted` computed from `topicBreakdown` |

`ChildProgress` models the exact backend shape from `ParentService.getChildProgress`:
`totalAttempts`, `correctAttempts`, `accuracyPercent`, `streakCount`, `coins`, `xp`, `level`, `topicBreakdown[]`.

### Providers (`apps/mobile/lib/features/parent/providers/`)

| File | Provider |
|---|---|
| `children_provider.dart` | `FutureProvider<List<ChildRef>>` → `GET /parent/children` |
| `child_progress_provider.dart` | `FutureProvider.family<ChildProgress, String>` keyed by childId → `GET /parent/children/:childId/progress` |

### Screens (`apps/mobile/lib/features/parent/screens/`)

**`parent_home_screen.dart`**
- Greeting: "Welcome, {displayName}!" from `AuthState.displayName`
- `CustomScrollView` with `RefreshIndicator` (invalidates `childrenProvider` on pull)
- Per-child `_ChildCard` loads `childProgressProvider(child.id)` inline — shows accuracy % and total attempts as pills
- Empty state when no children linked
- Taps navigate to `/parent/children/:childId` with `ChildRef` as route `extra`

**`child_detail_screen.dart`**
- Receives `ChildRef` from route `extra`
- AppBar shows child name + grade subtitle with back button
- Accuracy card: percentage headline + `LinearProgressIndicator` (0–1 clamped)
- 2×2 stat grid: Total Attempts, Day Streak, Coins, Level/XP
- "Topics Attempted" `Wrap` of `Chip` widgets — each chip shows topic name and a `correct/attempted` avatar badge

---

## Files Modified

### `apps/mobile/lib/services/api_client.dart`

Added two parent convenience methods:
- `Future<List<dynamic>> getMyChildren()` — `GET /parent/children`
- `Future<Map<String, dynamic>> getChildProgress(String childId)` — `GET /parent/children/$childId/progress`

### `apps/mobile/lib/router/app_router.dart`

- Redirect logic: after Auth0 login with `role == 'PARENT'`, redirects to `/parent/home` instead of `/home`
- Added guard: `/parent/*` routes redirect non-PARENT users to `/home`
- Added parent `ShellRoute` wrapping `/parent/home` and `/parent/profile`
- Added full-screen `GoRoute` for `/parent/children/:childId` — takes `ChildRef` as `extra`

### `apps/mobile/lib/screens/shell_screen.dart`

- `ShellScreen` is now role-aware: reads `authState.isParent` flag
- Parent bottom nav: Dashboard (`/parent/home`) + Profile (`/parent/profile`)
- Student bottom nav: unchanged (Home + Profile)
- `_currentIndex` and `_onTap` are role-switched accordingly

---

## Key Decisions

- **`topicBreakdown` over `topicsAttempted: List<String>`**: The backend returns richer per-topic data (`{topic, attempted, correct}`). Modelled it faithfully; the `topicsAttempted` getter provides `List<String>` for callers that only need names.
- **Inline progress loading on cards**: Each child card independently watches `childProgressProvider(child.id)` so the list loads progressively without a single blocking request.
- **`/parent/profile` reuses `ProfileScreen`**: Avoids duplication; the profile screen is role-agnostic.
- **No `AdminRole` guard on flutter side**: The backend enforces `PARENT | ADMIN`; the Flutter redirect only checks `PARENT`.
