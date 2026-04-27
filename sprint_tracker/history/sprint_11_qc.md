# Sprint 11 QC Report

**Date:** 2026-04-27
**Reviewer:** QC Agent
**Sprint Goal:** Flutter Android app shell + student dashboard screens

## Overall Status: PASS WITH MINOR ISSUES

All critical acceptance criteria pass. Two minor issues noted: the router uses `/home` instead of the spec's `/student/home` as the authenticated landing route, and `flutter_secure_storage` is missing from `pubspec.yaml`'s direct dependency list in the wrong position (it is present — see note below). No blockers for Sprint 12.

---

## P3-T01 Flutter App Shell

### pubspec.yaml — Required Packages

| Package | Required | Status |
|---|---|---|
| `flutter_riverpod` | yes | PASS — v2.6.1 |
| `go_router` | yes | PASS — v15.1.2 |
| `dio` | yes | PASS — v5.8.0+1 |
| `flutter_secure_storage` | yes | PASS — v9.2.4 |
| `flutter_appauth` | yes | PASS — v7.0.1 |

All five required packages are present. Additional packages (drift, rive, lottie, flutter_math_fork, cached_network_image, riverpod_annotation) are appropriate additions for the sprint scope.

### AndroidManifest.xml — INTERNET permission

PASS — `<uses-permission android:name="android.permission.INTERNET"/>` is present at line 3.

### Network security config — cleartext to 10.0.2.2

PASS — `apps/mobile/android/app/src/main/res/xml/network_security_config.xml` is present and correctly configured:
- `cleartextTrafficPermitted="true"` scoped to domain `10.0.2.2` only
- `base-config` sets `cleartextTrafficPermitted="false"` for all other traffic
- The manifest references `@xml/network_security_config` via `android:networkSecurityConfig`

### Student login endpoint — POST /auth/login/student

PASS — `AuthNotifier.loginStudent()` in `providers/providers.dart` (line 99) calls `_apiClient.post('/auth/login/student', ...)`. The known bug (`/auth/login` vs `/auth/login/student`) is correctly fixed.

### Base URL uses 10.0.2.2:3001 in Android dev config

PASS — `EnvConfig.dev.apiBaseUrl` is set to `'http://10.0.2.2:3001/api'` in `lib/config/env_config.dart` (line 16). Not `localhost`.

### Router routes: /role-select, /login, /student/home

PARTIAL PASS — `/role-select` and `/login` routes are present and correct. The authenticated home route is defined as `/home` (not `/student/home` as specified). `StudentHomeScreen` is served at `/home` inside a `ShellRoute`. This is a naming deviation from the acceptance criteria but is functionally sound and internally consistent. Flagged as a non-blocking issue.

### Unauthenticated users redirected to /role-select

PASS — The `GoRouter` redirect logic (lines 29–31 of `app_router.dart`) correctly allows only `/role-select` and `/login` for unauthenticated users and redirects everything else to `/role-select`.

### Auth0 stub for Parent/Teacher — "coming soon" notice, no crash

PASS — `loginWithAuth0()` throws `UnimplementedError` with an explanatory message. `RoleSelectScreen._handleAuth0Login()` catches `UnimplementedError` specifically and shows a `SnackBar` with "Parent / Teacher login coming soon — Auth0 provisioning in progress." No crash path.

---

## P3-T02 Flutter Student Screens

### Problem.fromJson maps questionText (not question)

PASS — `problem.dart` line 38: `questionText: json['questionText'] as String`. Correct field name.

### AttemptResult.fromJson maps correct, coinsEarned, xpEarned, badgesEarned

PASS — All four fields are mapped in `attempt_result.dart`:
- `correct`: line 23
- `coinsEarned`: line 26 (with safe cast and `?? 0`)
- `xpEarned`: line 27 (with safe cast and `?? 0`)
- `badgesEarned`: line 30 (cast to `List<String>` with `?? []`)

### Submit answer calls POST /attempts

PASS — `problem_solver_screen.dart` (line 75) calls `api.post('/attempts', data: {...})`. Also confirmed against `attempt.controller.ts`: `@Controller('attempts')` + `@Post()` — the full path resolves to `POST /api/attempts`. Endpoints match.

### Daily challenge calls GET /gamification/daily-challenge/:grade

PASS — `problems_provider.dart` (line 26) calls `api.get('/gamification/daily-challenge/$grade')`. Confirmed against `gamification.controller.ts`: `@Controller('gamification')` + `@Get('daily-challenge/:grade')` — resolves to `GET /api/gamification/daily-challenge/:grade`. Endpoints match.

### Problem solver renders all 3 input types

PASS — `_buildAnswerInput()` in `problem_solver_screen.dart` (lines 239–269) handles:
- `MCQ`: renders `_McqOptions` with selectable option buttons (one per `ProblemOption`)
- `TRUE_FALSE`: renders `_TrueFalseButtons` with two side-by-side buttons ("True" / "False")
- `FILL_BLANK` (default): renders a `TextField` for free-text entry

All three types are covered.

### Result overlay shows coins earned and XP earned after correct answer

PASS — `_ResultOverlay` (line 535) shows:
```
'Correct! +${result.coinsEarned} coins · +${result.xpEarned} XP'
```
Displayed in a bottom sheet overlay with green background for correct, red for incorrect.

### Student home screen has pull-to-refresh

PASS — `student_home_screen.dart` wraps its `SingleChildScrollView` in a `RefreshIndicator` (line 27). The `onRefresh` callback invalidates both `studentStatsProvider` and `dailyChallengeProvider`.

### Grade chip selector (1/2/3) in problem list screen

PASS — `problem_list_screen.dart` renders `ChoiceChip` widgets for grades 1, 2, 3 (lines 48–73). Selecting a chip calls `setState(() => _selectedGrade = grade)` which re-queries `problemsProvider` for the new grade. `RefreshIndicator` is also present on the problem list.

---

## Blockers (must fix before Sprint 12)

None.

---

## Non-Blocking Issues

1. **Route path deviation: `/home` vs `/student/home`**
   The acceptance criterion specifies `/student/home` as the student home route. The implementation uses `/home` (inside a `ShellRoute`) which also hosts a `/profile` tab. This is architecturally reasonable for a shell nav pattern, but deviates from the spec. Update the spec or the route name for consistency before Sprint 12 adds more routes.

2. **Auth0 placeholder credentials in EnvConfig**
   `env_config.dart` contains literal strings `'YOUR_TENANT.auth0.com'` and `'YOUR_CLIENT_ID'` for all environments including staging and prod. This is expected until P3-T04 (Auth0 provisioning) but should not be committed to a public branch. Ensure these are replaced by environment variables before any CI/CD pipeline that runs against staging.

3. **`riverpod_annotation` / generated code not verified**
   `pubspec.yaml` includes `riverpod_annotation` and `riverpod_generator` (code-gen), but the providers in the codebase use plain `Provider`/`FutureProvider`/`StateNotifierProvider` (no `@riverpod` annotations). The dev dependency is harmless but unused. Can be removed to reduce confusion.

4. **No `/student/home` redirect after login**
   After `loginStudent()` succeeds, the router redirects authenticated users from `/` or `/role-select` to `/home`. This works correctly. However, a teacher or parent who logs in via Auth0 in a future sprint will also be routed to `StudentHomeScreen` since the only authenticated shell route is `/home`. A role-based post-login redirect should be added when P3-T04 is implemented.
