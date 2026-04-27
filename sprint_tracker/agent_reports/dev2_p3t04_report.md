# Dev Agent Report — P3-T04: Auth0 PKCE Full Implementation (Parent/Teacher Login)

**Date:** 2026-04-27
**Agent:** dev2
**Task:** P3-T04 — Wire up Auth0 Authorization Code + PKCE flow for Parent and Teacher login using `flutter_appauth`.

---

## Summary

Replaced the `UnimplementedError` stub in `loginWithAuth0()` with a complete Auth0 PKCE implementation using `flutter_appauth`. Added Android manifest callback activity, updated `EnvConfig` with Auth0 constants, updated the role select screen with loading state, and added a logout button to the shell screen.

---

## Files Changed

### `apps/mobile/lib/config/env_config.dart`
- Replaced hardcoded placeholder strings with `String.fromEnvironment()` constants for `AUTH0_DOMAIN` and `AUTH0_MOBILE_CLIENT_ID` (with descriptive fallback defaults that make it obvious the values are unconfigured).
- Added two static constants:
  - `auth0RedirectUri = 'com.koblio.app://callback'`
  - `auth0PostLogoutRedirectUri = 'com.koblio.app://callback'`
- All three environment flavors (`dev`, `staging`, `prod`) now use the env-var approach so the same build artifact can be signed with real credentials at CI time.

### `apps/mobile/android/app/src/main/AndroidManifest.xml`
- Added `com.linusu.flutter_web_auth_2.CallbackActivity` inside `<application>` with an intent-filter for `com.koblio.app://callback`. This is the callback receiver that `flutter_appauth` (which uses `flutter_web_auth_2` internally) needs to complete the PKCE redirect.

### `apps/mobile/lib/providers/providers.dart`
- Added imports: `flutter_appauth`, `flutter_secure_storage`, `koblio_mobile/config/env_config.dart`.
- **`loginWithAuth0({required String role})`** — full implementation:
  - Sets `isLoading: true` before opening the browser session.
  - Calls `FlutterAppAuth().authorizeAndExchangeCode()` with `AuthorizationTokenRequest` using `EnvConfig.current.auth0ClientId`, `EnvConfig.auth0RedirectUri`, OIDC issuer URL, and scopes `['openid', 'profile', 'email', 'offline_access']`.
  - Passes `login_hint: role.toLowerCase()` as an additional parameter so Auth0 actions/rules can branch by role.
  - Stores access token and refresh token via the shared `AuthInterceptor.saveTokens()` (so all Dio requests automatically get the `Authorization` header).
  - Writes `auth_role` to `FlutterSecureStorage` as a cold-restart cache.
  - Calls `checkAuthStatus()` to verify against `/auth/me` and populate `userId`/`displayName`.
  - On any error: resets `isLoading: false` and rethrows so the UI shows a SnackBar.
- **`logout()`** — extended to also delete `auth_role` and `auth_user_id` from `FlutterSecureStorage` (previously only called `AuthInterceptor.clearTokens()`).

### `apps/mobile/lib/screens/role_select_screen.dart`
- Converted from `ConsumerWidget` build to watch `authProvider.isLoading`.
- Wrapped the entire screen in a `Stack` with a semi-transparent loading overlay (spinner + "Opening login…" text) rendered when `isLoading` is true.
- All three `_RoleCard` `onTap` callbacks are set to `null` while loading (disables tap).
- `_RoleCard.onTap` type changed from `VoidCallback` to `VoidCallback?` to support the null-disabled state.
- `_handleAuth0Login` error handler:
  - Removed the now-dead `on UnimplementedError` branch.
  - Added `_friendlyError()` helper that translates raw exception messages into user-friendly SnackBar copy (handles user cancellation, placeholder credentials, and generic errors).

### `apps/mobile/lib/screens/shell_screen.dart`
- Converted `ShellScreen` from `StatelessWidget` to `ConsumerWidget`.
- Added imports: `flutter_riverpod`, `koblio_mobile/providers/providers.dart`.
- Added `_handleLogout()` method that shows a confirmation `AlertDialog` before calling `authProvider.notifier.logout()`.
- Added a `FloatingActionButton.small` (logout icon) to the `Scaffold`, only rendered when `authState.status == AuthStatus.authenticated`. Positioned at `FloatingActionButtonLocation.endDocked` so it sits above the navigation bar without overlapping nav items.

---

## Design Decisions

- **`const appAuth = FlutterAppAuth()`** — instantiated with `const` (no factory needed in v7.x).
- **`login_hint` parameter** — passes `parent` or `teacher` so Auth0 rules/actions can apply role-specific logic without requiring a separate Auth0 application per role. This is optional and ignored if no rule reads it.
- **Token storage via `AuthInterceptor`** — Auth0 tokens are stored under the same `access_token` / `refresh_token` keys used by student login, so `checkAuthStatus()` and the Dio interceptor work unchanged regardless of login method.
- **`isLoading` overlay vs. disabling individual buttons** — the overlay approach prevents any taps (including the Student button) while the browser session is open, avoiding race conditions.
- **Logout FAB** — a `FloatingActionButton.small` is the least invasive way to add a logout button to the shell without modifying child screens. The confirmation dialog prevents accidental logouts.

---

## Dev Notes

- With placeholder credentials (`YOUR_TENANT.us.auth0.com` / `YOUR_MOBILE_CLIENT_ID`), the PKCE flow will fail immediately when the browser session opens (Auth0 will reject the unknown domain). The `_friendlyError()` helper in `role_select_screen.dart` detects this and shows a clear SnackBar message rather than a stack trace.
- To enable real login, pass credentials at build time:
  ```
  flutter run --dart-define=AUTH0_DOMAIN=dev-xxxx.us.auth0.com --dart-define=AUTH0_MOBILE_CLIENT_ID=<client_id>
  ```
- The Auth0 mobile application must have `com.koblio.app://callback` registered as an Allowed Callback URL in the dashboard, and the mobile app must be created as a "Native" application type (not SPA or M2M) to enable PKCE.

---

## Acceptance Criteria Status

| Criterion | Status |
|---|---|
| `loginWithAuth0()` no longer throws `UnimplementedError` | Done |
| `flutter_appauth` PKCE flow is wired up | Done |
| Android manifest has callback intent-filter | Done |
| `EnvConfig` exposes `auth0RedirectUri` and uses env-var approach | Done |
| Loading state shown in UI during auth | Done |
| Errors shown as SnackBar, not crashes | Done |
| `logout()` clears all secure storage keys | Done |
| Logout accessible from shell screen | Done |
