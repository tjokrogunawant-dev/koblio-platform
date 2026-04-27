import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:koblio_mobile/providers/providers.dart';
import 'package:koblio_mobile/theme/app_theme.dart';

/// Persistent bottom navigation shell wrapping the student's main tabs.
///
/// Tabs:
///   0 — Home (/home)   — StudentHomeScreen
///   1 — Profile (/profile) — ProfileScreen
///
/// Problem solving (/student/problems, /student/problems/solve) is accessed
/// via push navigation and renders full-screen outside this shell.
class ShellScreen extends ConsumerWidget {
  const ShellScreen({super.key, required this.child});

  final Widget child;

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    if (location.startsWith('/profile')) return 1;
    return 0;
  }

  void _onTap(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/home');
      case 1:
        context.go('/profile');
    }
  }

  Future<void> _handleLogout(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Log out?'),
        content: const Text('You will need to log in again to continue.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Log out'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await ref.read(authProvider.notifier).logout();
      // The router's redirect guard will detect unauthenticated state and
      // navigate back to the role select screen automatically.
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    // Show the logout button for all authenticated users; it is especially
    // useful for Parents and Teachers who used Auth0 PKCE to sign in.
    final showLogout = authState.status == AuthStatus.authenticated;

    return Scaffold(
      body: child,
      // Logout button — positioned above the navigation bar so it doesn't
      // overlap nav items (floatingActionButtonLocation handles the offset).
      floatingActionButton: showLogout
          ? FloatingActionButton.small(
              heroTag: 'logout_fab',
              tooltip: 'Log out',
              backgroundColor: AppColors.surface,
              foregroundColor: AppColors.textSecondary,
              elevation: 2,
              onPressed: () => _handleLogout(context, ref),
              child: const Icon(Icons.logout, size: 20),
            )
          : null,
      floatingActionButtonLocation: FloatingActionButtonLocation.endDocked,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Color(0x0D000000),
              blurRadius: 10,
              offset: Offset(0, -2),
            ),
          ],
        ),
        child: NavigationBar(
          selectedIndex: _currentIndex(context),
          onDestinationSelected: (index) => _onTap(context, index),
          backgroundColor: AppColors.surface,
          indicatorColor: AppColors.primary.withAlpha(25),
          height: 70,
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.home_outlined),
              selectedIcon: Icon(Icons.home, color: AppColors.primary),
              label: 'Home',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline),
              selectedIcon: Icon(Icons.person, color: AppColors.primary),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}
