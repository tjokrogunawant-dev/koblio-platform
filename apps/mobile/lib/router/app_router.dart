import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:koblio_mobile/features/parent/models/child_ref.dart';
import 'package:koblio_mobile/features/parent/screens/child_detail_screen.dart';
import 'package:koblio_mobile/features/parent/screens/parent_home_screen.dart';
import 'package:koblio_mobile/features/student/models/problem.dart';
import 'package:koblio_mobile/features/student/screens/problem_list_screen.dart';
import 'package:koblio_mobile/features/student/screens/problem_solver_screen.dart';
import 'package:koblio_mobile/features/student/screens/student_home_screen.dart';
import 'package:koblio_mobile/providers/providers.dart';
import 'package:koblio_mobile/screens/login_screen.dart';
import 'package:koblio_mobile/screens/profile_screen.dart';
import 'package:koblio_mobile/screens/role_select_screen.dart';
import 'package:koblio_mobile/screens/shell_screen.dart';
import 'package:koblio_mobile/screens/splash_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final isAuth = authState.status == AuthStatus.authenticated;
      final isLoading = authState.status == AuthStatus.unknown;
      final loc = state.matchedLocation;

      // Stay on splash while checking stored session.
      if (isLoading) return '/';

      // Unauthenticated: allow role-select and login only.
      if (!isAuth) {
        if (loc == '/role-select' || loc == '/login') return null;
        return '/role-select';
      }

      // Authenticated: redirect away from auth screens to role-appropriate home.
      if (loc == '/' || loc == '/role-select' || loc == '/login') {
        if (authState.role == 'PARENT') return '/parent/home';
        return '/home';
      }

      // Guard parent routes — only PARENT (or ADMIN) may access them.
      if (loc.startsWith('/parent') && authState.role != 'PARENT') {
        return '/home';
      }

      return null;
    },
    routes: [
      // Splash — shown while auth status is loading.
      GoRoute(
        path: '/',
        builder: (context, state) => const SplashScreen(),
      ),

      // Role selection — entry point for unauthenticated users.
      GoRoute(
        path: '/role-select',
        builder: (context, state) => const RoleSelectScreen(),
      ),

      // Student username + password login form.
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),

      // ── Student shell (bottom nav) ────────────────────────────────────────
      ShellRoute(
        builder: (context, state, child) => ShellScreen(child: child),
        routes: [
          // /home is the student-authenticated landing.
          GoRoute(
            path: '/home',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: StudentHomeScreen(),
            ),
          ),
          GoRoute(
            path: '/profile',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: ProfileScreen(),
            ),
          ),
        ],
      ),

      // ── Parent shell (bottom nav) ─────────────────────────────────────────
      ShellRoute(
        builder: (context, state, child) => ShellScreen(child: child),
        routes: [
          GoRoute(
            path: '/parent/home',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: ParentHomeScreen(),
            ),
          ),
          // Profile is shared between roles.
          GoRoute(
            path: '/parent/profile',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: ProfileScreen(),
            ),
          ),
        ],
      ),

      // ── Parent child detail (full-screen, outside shell) ─────────────────
      GoRoute(
        path: '/parent/children/:childId',
        builder: (context, state) {
          final child = state.extra as ChildRef?;
          if (child == null) {
            return Scaffold(
              body: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text('Child not found.'),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: () => context.go('/parent/home'),
                      child: const Text('Back to Dashboard'),
                    ),
                  ],
                ),
              ),
            );
          }
          return ChildDetailScreen(child: child);
        },
      ),

      // ── Student problem flow (full-screen, outside shell) ─────────────────
      GoRoute(
        path: '/student',
        redirect: (_, __) => '/home',
      ),
      GoRoute(
        path: '/student/problems',
        builder: (context, state) => const ProblemListScreen(),
      ),
      GoRoute(
        path: '/student/problems/solve',
        builder: (context, state) {
          final problem = state.extra as Problem?;
          if (problem == null) {
            return Scaffold(
              body: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text('No problem selected.'),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: () => context.go('/student/problems'),
                      child: const Text('Browse Problems'),
                    ),
                  ],
                ),
              ),
            );
          }
          return ProblemSolverScreen(problem: problem);
        },
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Page not found: ${state.error}'),
      ),
    ),
  );
});
