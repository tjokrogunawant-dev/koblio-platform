# Sprint 12 QC Report

**Date:** 2026-04-27
**Reviewer:** QC Agent
**Sprint Goal:** flutter_math_fork math rendering + Auth0 PKCE for Parent/Teacher login

## Overall Status: PASS WITH MINOR ISSUES

---

## P3-T03 Flutter Math Rendering

### Criterion Results

- **PASS** — Package name in `pubspec.yaml` is `flutter_math_fork: ^0.7.2`. The implementation agent correctly noted this at implementation time.
- **PASS** — Import in `math_text.dart` is `package:flutter_math_fork/flutter_math_fork.dart`, which matches the pubspec entry exactly. No mismatch.
- **PASS** — Empty string edge case handled: `if (text.isEmpty) return const SizedBox.shrink();` on line 21.
- **PASS** — Fast path for plain text: `if (!text.contains(r'$')) return Text(text, style: style);` on line 26. No `Math.tex` call is made for plain strings.
- **PASS** — Splitting on `$`: `text.split(r'$')` produces segments where odd indices are LaTeX expressions and even indices are plain text. The loop correctly uses `i.isOdd` / `i.isEven` to dispatch to `Math.tex` vs `Text`. Logic is correct.
- **PASS** — Malformed LaTeX fallback: `onErrorFallback` returns a red `Text` widget with the raw segment and `color: Colors.red`. Does not crash.
- **PASS** — `problem_solver_screen.dart` usage:
  - Question text: `MathText(text: widget.problem.questionText, ...)` at line 184.
  - MCQ option text: `MathText(text: text, ...)` inside `_McqOptions` at line 342.
  - Solution text: `MathText(text: result.solution, ...)` inside `_ResultOverlay` at line 574.
  - All three use sites confirmed.

### Findings

**Non-blocking — Note on package name in acceptance criteria:** The acceptance criterion listed `flutter_math_forge` as the expected package name but flagged that the agent found `flutter_math_fork`. The actual package on pub.dev used here is `flutter_math_fork` (correct). The criterion text appears to have a typo (`forge` vs `fork`). The implementation is correct; the criterion wording should be updated.

**Non-blocking — Barrel export:** `apps/mobile/lib/core/widgets/widgets.dart` exports both `koblio_scaffold.dart` and `math_text.dart`. However, `problem_solver_screen.dart` imports `math_text.dart` directly (`package:koblio_mobile/core/widgets/math_text.dart`) rather than via the barrel. This is functionally correct and not a bug, but inconsistent with the intent of the barrel file.

---

## P3-T04 Auth0 PKCE Login

### Criterion Results

- **PASS** — `env_config.dart` uses `String.fromEnvironment('AUTH0_DOMAIN', ...)` and `String.fromEnvironment('AUTH0_MOBILE_CLIENT_ID', ...)` for `auth0Domain` and `auth0ClientId` in all three environment profiles (`dev`, `staging`, `prod`).
- **PASS** — `auth0RedirectUri` is `'com.koblio.app://callback'` (line 16 of `env_config.dart`).
- **PASS** — `AndroidManifest.xml` declares `com.linusu.flutter_web_auth_2.CallbackActivity` with an intent-filter matching scheme `com.koblio.app` and host `callback`. Matches the redirect URI exactly.
- **PASS** — `loginWithAuth0()` calls `FlutterAppAuth().authorizeAndExchangeCode(AuthorizationTokenRequest(...))` (lines 128–141 of `providers.dart`). This is a real PKCE exchange, not a stub or throw.
- **PASS** — Errors are caught in `_handleAuth0Login()` in `role_select_screen.dart` (lines 134–143) and displayed as a floating `SnackBar` with a user-friendly message via `_friendlyError()`. No stack traces are shown to the user. The `_friendlyError()` helper handles user-cancelled flows and placeholder-credential builds specially.
- **PASS** — Loading overlay is shown while Auth0 browser session is active. The `isLoading` flag in `AuthState` is set to `true` at the start of `loginWithAuth0()` (line 126) and the overlay (`Stack` with `ColoredBox`) is rendered conditionally in `RoleSelectScreen` when `isLoading` is true (lines 105–121). Role cards are also disabled (`onTap: null`) while loading.
- **MINOR ISSUE** — `logout()` clears `auth_role` and `auth_user_id` from secure storage (lines 174–175 of `providers.dart`) and delegates token clearing to `_authInterceptor.clearTokens()`. However: (a) the acceptance criterion specifies clearing `auth_token` but the actual storage key used by `AuthInterceptor` is `access_token` — the criterion's key name is wrong, not the implementation; (b) `auth_user_id` is deleted in `logout()` but it is never explicitly written to secure storage during `loginWithAuth0()` (the user ID lives only in `AuthState` in memory). The delete is defensive and harmless, but `auth_user_id` is orphaned in the key-management contract. No functional regression.
- **PASS** — Shell screen has a `FloatingActionButton` logout button (lines 72–82 of `shell_screen.dart`) with a confirmation `AlertDialog` (lines 36–57). The dialog requires the user to press "Log out" to confirm before `logout()` is called.

### Findings

**Non-blocking — `auth_user_id` write/delete asymmetry:** `logout()` calls `storage.delete(key: 'auth_user_id')` but no code path in `loginWithAuth0()` or `checkAuthStatus()` ever calls `storage.write(key: 'auth_user_id', ...)`. The delete is safe but the key is never populated, making it dead code. If the intent is to persist `userId` across cold restarts (mirroring the `auth_role` fast-path cache), a corresponding `storage.write(key: 'auth_user_id', value: userId)` should be added after line 160 of `providers.dart`.

**Non-blocking — `loginWithAuth0` error path leaves `isLoading` true temporarily:** When `checkAuthStatus()` (called inside `loginWithAuth0`) throws, the `catch (_)` on line 164 sets `isLoading: false` and rethrows. However `checkAuthStatus()` also internally calls `state = state.copyWith(status: AuthStatus.unauthenticated)` before returning (line 73), and `isLoading` is not reset there. The `catch` in `loginWithAuth0` does reset it, so the end state is correct. No user-visible issue, but the error path is somewhat convoluted.

---

## Blockers (must fix before Sprint 13)

None.

---

## Non-Blocking Issues

1. **P3-T03** — `problem_solver_screen.dart` imports `math_text.dart` directly instead of through the `widgets.dart` barrel. Cosmetic inconsistency; no functional impact.
2. **P3-T04** — `auth_user_id` is deleted in `logout()` but never written during login. Add `storage.write(key: 'auth_user_id', value: userId)` in `loginWithAuth0()` after the `auth_role` write if cross-restart persistence of user ID is desired, or remove the orphaned `delete` call.
3. **P3-T04** — Acceptance criterion referred to the storage key as `auth_token`; the actual key is `access_token`. Update the criterion text for accuracy.
