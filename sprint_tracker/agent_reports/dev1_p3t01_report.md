# P3-T01 — Flutter Android App Shell

**Date:** 2026-04-27
**Agent:** dev1
**Status:** COMPLETE

---

## What Was Found

The Flutter app at `apps/mobile/` was substantially pre-built with more features than the P3-T01 skeleton spec described. The existing state included:

- Full GoRouter setup with ShellRoute but missing `/role-select` and no student feature routes
- `providers/providers.dart` with manual `StateNotifierProvider` auth (good) but calling the wrong login endpoint (`/auth/login` instead of `/auth/login/student`)
- `screens/` flat structure (login, home, practice, profile, splash, shell)
- `features/student/` directory already containing full problem-list screen, problem-solver screen, models, providers, and widgets
- `services/` with Dio `ApiClient` and `AuthInterceptor` (secure storage-backed)
- `theme/app_theme.dart` with Koblio brand colors (indigo `#6C63FF`, gold `#FFD93D`)
- `config/env_config.dart` pointing to `localhost:3001` (wrong — emulator needs `10.0.2.2`)
- Missing: `flutter_appauth`, `cached_network_image` in pubspec; `/role-select` route; Auth0 PKCE stub; `core/` directory structure; `features/auth/` directory; `INTERNET` permission in AndroidManifest; network security config

---

## What Was Done

### pubspec.yaml
- Added `flutter_appauth: ^7.0.1` (Auth0 PKCE for parent/teacher)
- Added `cached_network_image: ^3.3.1` (avatar/asset loading)

### config/env_config.dart
- Fixed `dev.apiBaseUrl` from `http://localhost:3001/api` → `http://10.0.2.2:3001/api` (Android emulator routes 10.0.2.2 to host localhost)

### providers/providers.dart
- Fixed student login endpoint: `/auth/login` → `/auth/login/student` (matches `POST /api/auth/login/student` in the NestJS controller)
- Added `token` and `role` fields to `AuthState` (task spec requirement; role is `'STUDENT' | 'PARENT' | 'TEACHER'`)
- Added `isLoading` field to `AuthState`
- Renamed `login()` → `loginStudent()` for clarity
- Added `loginWithAuth0()` stub — throws `UnimplementedError` with clear message; full implementation deferred to P3-T04 (requires Auth0 tenant provisioning)
- Removed non-existent `loginWithClassCode()` (no class-code endpoint exists in the API)
- Added `_primaryRole()` helper that maps `roles[]` → primary role string

### router/app_router.dart
- Added `/role-select` route → `RoleSelectScreen` (entry point for unauthenticated users)
- Added `/login` route redirect logic (unauthenticated users allowed on `/role-select` and `/login` only)
- Redirects authenticated users away from all auth screens → `/home`
- `/home` (ShellRoute) now uses `StudentHomeScreen` instead of the legacy `HomeScreen`
- Added `/student/problems` and `/student/problems/solve` routes (full-screen, outside ShellRoute)
- `/student` redirects to `/home`

### screens/role_select_screen.dart (new)
- Three role cards: Student (→ `/login`), Parent (Auth0 PKCE stub), Teacher (Auth0 PKCE stub)
- Parent/Teacher cards trigger `loginWithAuth0()` and catch `UnimplementedError` with an informative SnackBar

### screens/login_screen.dart (rewritten)
- Cleaner student-only form (removed class-code mode toggle — no API endpoint for it)
- Calls `loginStudent()` (correct endpoint)
- Added password visibility toggle
- Improved error display (banner with icon instead of plain text)

### screens/shell_screen.dart (updated)
- Removed Practice tab (practice is accessed via StudentHomeScreen's "Browse Problems" button)
- Two tabs: Home, Profile

### features/auth/ (new directory)
- `providers/auth_provider.dart` — barrel re-export of canonical providers
- `screens/login_screen.dart` — barrel re-export of `LoginScreen`
- `screens/role_select_screen.dart` — barrel re-export of `RoleSelectScreen`

### core/ (new directory)
- `core/api/api_client.dart` — barrel re-export of `ApiClient`
- `core/theme/app_theme.dart` — barrel re-export of `AppTheme`, `AppColors`
- `core/widgets/koblio_scaffold.dart` — `KoblioScaffold` widget with standard Koblio bottom nav (for use by future feature screens)

### Android
- `android/app/src/main/AndroidManifest.xml` — added `INTERNET` permission and `networkSecurityConfig` reference
- `android/app/src/main/res/xml/network_security_config.xml` (new) — allows cleartext HTTP to `10.0.2.2` only (emulator dev); all other traffic requires HTTPS

---

## Auth Flow Summary

```
App launch
  └─ SplashScreen → checkAuthStatus() (reads SecureStorage)
       ├─ token found → GET /api/auth/me → authenticated → /home
       └─ no token → unauthenticated → /role-select

/role-select (RoleSelectScreen)
  ├─ Student tap → /login
  ├─ Parent tap  → Auth0 PKCE stub (P3-T04)
  └─ Teacher tap → Auth0 PKCE stub (P3-T04)

/login (LoginScreen — students only, COPPA: no email)
  └─ POST /api/auth/login/student {username, password}
       └─ JWT stored in SecureStorage → checkAuthStatus() → /home

/home (StudentHomeScreen inside ShellRoute)
  └─ "Browse Problems" → /student/problems → /student/problems/solve
```

---

## Deferred / Out of Scope

- **Auth0 PKCE** (parent/teacher): Requires Auth0 tenant credentials. Stubbed with `UnimplementedError`. Target: P3-T04.
- **Riverpod codegen migration**: `auth_provider.dart` uses manual `StateNotifierProvider`. Codegen migration tracked in `features/auth/providers/auth_provider.dart` comment. Target: post-MVP.
- **`flutter_math_forge`**: Spec listed this package but `flutter_math_fork` (already in pubspec) provides equivalent KaTeX rendering. No change made.
