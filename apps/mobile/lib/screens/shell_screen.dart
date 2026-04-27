import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:koblio_mobile/providers/providers.dart';
import 'package:koblio_mobile/theme/app_theme.dart';

/// Persistent bottom navigation shell.
///
/// Renders different tabs depending on the authenticated user's role:
///
/// Student / default:
///   0 — Home (/home)
///   1 — Profile (/profile)
///
/// Parent:
///   0 — Dashboard (/parent/home)
///   1 — Profile (/parent/profile)
///
/// Problem solving and child detail screens push on top of this shell
/// (full-screen) and are not listed as tabs.
class ShellScreen extends ConsumerWidget {
  const ShellScreen({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final isParent = authState.isParent;

    final selectedIndex = _currentIndex(context, isParent: isParent);
    final showLogout = authState.status == AuthStatus.authenticated;

    return Scaffold(
      body: child,
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
          selectedIndex: selectedIndex,
          onDestinationSelected: (index) =>
              _onTap(context, index, isParent: isParent),
          backgroundColor: AppColors.surface,
          indicatorColor: AppColors.primary.withAlpha(25),
          height: 70,
          destinations: isParent
              ? const [
                  NavigationDestination(
                    icon: Icon(Icons.dashboard_outlined),
                    selectedIcon:
                        Icon(Icons.dashboard, color: AppColors.primary),
                    label: 'Dashboard',
                  ),
                  NavigationDestination(
                    icon: Icon(Icons.person_outline),
                    selectedIcon:
                        Icon(Icons.person, color: AppColors.primary),
                    label: 'Profile',
                  ),
                ]
              : const [
                  NavigationDestination(
                    icon: Icon(Icons.home_outlined),
                    selectedIcon: Icon(Icons.home, color: AppColors.primary),
                    label: 'Home',
                  ),
                  NavigationDestination(
                    icon: Icon(Icons.person_outline),
                    selectedIcon:
                        Icon(Icons.person, color: AppColors.primary),
                    label: 'Profile',
                  ),
                ],
        ),
      ),
    );
  }

  int _currentIndex(BuildContext context, {required bool isParent}) {
    final location = GoRouterState.of(context).matchedLocation;
    if (isParent) {
      if (location.startsWith('/parent/profile')) return 1;
      return 0;
    }
    if (location.startsWith('/profile')) return 1;
    return 0;
  }

  void _onTap(BuildContext context, int index, {required bool isParent}) {
    if (isParent) {
      switch (index) {
        case 0:
          context.go('/parent/home');
        case 1:
          context.go('/parent/profile');
      }
    } else {
      switch (index) {
        case 0:
          context.go('/home');
        case 1:
          context.go('/profile');
      }
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
      // The router's redirect guard detects unauthenticated state and
      // navigates back to the role select screen automatically.
    }
  }
}
