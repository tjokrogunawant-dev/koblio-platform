import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:koblio_mobile/theme/app_theme.dart';

/// Standard Koblio scaffold with the persistent bottom navigation bar.
///
/// Wraps content in a [Scaffold] and adds the two-tab bottom nav
/// (Home / Profile). Use this in screens that live inside the authenticated
/// [ShellRoute] — i.e., do NOT use it in full-screen overlays such as the
/// problem solver.
///
/// [body]        — The screen content.
/// [appBar]      — Optional app bar. Pass null to suppress it.
/// [floatingActionButton] — Optional FAB.
class KoblioScaffold extends StatelessWidget {
  const KoblioScaffold({
    super.key,
    required this.body,
    this.appBar,
    this.floatingActionButton,
    this.backgroundColor,
  });

  final Widget body;
  final PreferredSizeWidget? appBar;
  final Widget? floatingActionButton;
  final Color? backgroundColor;

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: appBar,
      backgroundColor: backgroundColor ?? AppColors.background,
      floatingActionButton: floatingActionButton,
      body: body,
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
