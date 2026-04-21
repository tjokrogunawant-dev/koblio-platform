import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:koblio_mobile/providers/providers.dart';
import 'package:koblio_mobile/screens/home_screen.dart';
import 'package:koblio_mobile/screens/login_screen.dart';
import 'package:koblio_mobile/screens/shell_screen.dart';
import 'package:koblio_mobile/screens/splash_screen.dart';
import 'package:koblio_mobile/screens/profile_screen.dart';
import 'package:koblio_mobile/screens/practice_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final isAuth = authState.status == AuthStatus.authenticated;
      final isLoading = authState.status == AuthStatus.unknown;
      final isLoginRoute = state.matchedLocation == '/login';

      if (isLoading) return '/';
      if (!isAuth && !isLoginRoute) return '/login';
      if (isAuth && (isLoginRoute || state.matchedLocation == '/')) {
        return '/home';
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) => ShellScreen(child: child),
        routes: [
          GoRoute(
            path: '/home',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: HomeScreen(),
            ),
          ),
          GoRoute(
            path: '/practice',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: PracticeScreen(),
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
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Page not found: ${state.error}'),
      ),
    ),
  );
});
