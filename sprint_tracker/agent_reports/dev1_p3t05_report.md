# P3-T05 Implementation Report — Flutter Gamification UI

**Date:** 2026-04-27
**Agent:** dev1
**Task:** P3-T05 — Flutter Gamification UI (XP bar, streak counter, badge shelf)

---

## Summary

Implemented the full gamification widget layer for the student home screen:
- `XpProgressBar` — level + progress visualization
- `StreakCounter` — flame-based streak display with golden bonus indicator
- `BadgeShelf` — horizontal scrollable badge cards with tap-to-detail dialog
- Updated `StudentStats` model to include `levelInfo`
- Created `BadgeModel` and `badgesProvider`
- Added `getMyBadges()` to `ApiClient`
- Integrated all widgets into `StudentHomeScreen`

---

## Files Changed

### New Files
- `apps/mobile/lib/features/student/models/badge_model.dart`
- `apps/mobile/lib/features/student/providers/badges_provider.dart`
- `apps/mobile/lib/features/student/widgets/xp_progress_bar.dart`
- `apps/mobile/lib/features/student/widgets/streak_counter.dart`
- `apps/mobile/lib/features/student/widgets/badge_shelf.dart`

### Modified Files
- `apps/mobile/lib/features/student/models/student_stats.dart` — Added `LevelInfo` class and `levelInfo` field
- `apps/mobile/lib/services/api_client.dart` — Added `getMyBadges()` method
- `apps/mobile/lib/features/student/screens/student_home_screen.dart` — Integrated 3 new widgets; replaced 3-card stats row with 2-card row (coins/level) + separate XP bar + streak counter; added badge shelf above daily challenge

---

## API Shape Verification

### `GET /gamification/me`
Confirmed via `gamification.service.ts` → `getStudentProfile()`:
```ts
{
  coins: number;
  xp: number;
  level: number;
  streakCount: number;
  levelInfo: {
    level: number;
    xpToNextLevel: number;
    progressPercent: number;  // 0–100 integer
  };
}
```
`LevelInfo.fromJson` maps `json['level']` → `currentLevel` to match the nested structure.

### `GET /badges/me`
Confirmed via `badge.service.ts` → `getStudentBadges()`. Returns a **bare array** (not wrapped):
```ts
[{ type, slug, name, description, iconEmoji, awardedAt }]
```
`BadgeModel.fromJson` uses `json['slug']` as the `id` field (no separate UUID in the response).

---

## Widget Details

### XpProgressBar
- Dual-row card: "Level N" + XP label on top, `LinearProgressIndicator` below
- API's `progressPercent` (0–100) divided by 100 for Flutter's `LinearProgressIndicator` (0.0–1.0)
- Indigo/purple (`AppColors.primary`) color scheme matching web app
- Shows "Max level!" when `progressPercent >= 100`

### StreakCounter
- 0-day: gray text "Start your streak!" + "No streak yet" label
- 1–6 days: `AppColors.secondary` (orange-red) for count text
- 7+ days: golden amber (`#FFB300`) + "Bonus x1.5" chip matching the backend's `streakBonusMultiplier`
- Flame emoji rendered at 28px intrinsic size

### BadgeShelf
- Empty state: bordered card with 🏅 + "No badges yet — keep solving!"
- Non-empty: 110px-height `ListView` scrolling horizontally, 86px-wide badge cards
- Each card: large emoji + truncated name; tappable → `showDialog` with full name, description, and formatted earned date

### StudentHomeScreen changes
- Removed the previous 3-card stats row (streak/coins/level) — streak is now `StreakCounter`, coins + level remain as 2 `StatCard` widgets
- Order below greeting: coins+level row → XP bar → streak counter → badge shelf → daily challenge → browse button
- `badgesProvider` invalidated on pull-to-refresh alongside stats and daily challenge providers
- Loading states use lightweight placeholder `Card` widgets; badge errors show `SizedBox.shrink()` to avoid breaking the screen

---

## Acceptance Criteria Status

| Criterion | Status |
|---|---|
| `LevelInfo` model + `StudentStats.levelInfo` field | Done |
| `BadgeModel.fromJson` | Done |
| `badgesProvider` (FutureProvider, no codegen) | Done |
| `ApiClient.getMyBadges()` | Done |
| `XpProgressBar` with LinearProgressIndicator, indigo scheme | Done |
| `StreakCounter` with 0/normal/golden states | Done |
| `BadgeShelf` empty + scrollable + tap dialog | Done |
| Home screen integration with loading states | Done |
| No coins duplication (removed from streak card row) | Done |
