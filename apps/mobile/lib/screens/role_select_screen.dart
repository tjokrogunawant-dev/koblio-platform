import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:koblio_mobile/providers/providers.dart';
import 'package:koblio_mobile/theme/app_theme.dart';

/// Entry screen for unauthenticated users.
///
/// Students are routed to the username/password [LoginScreen].
/// Parent and Teacher flows trigger Auth0 Authorization Code + PKCE via
/// [FlutterAppAuth]. A loading overlay is shown while the browser session
/// is open; errors are surfaced in a floating [SnackBar].
class RoleSelectScreen extends ConsumerWidget {
  const RoleSelectScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLoading = ref.watch(authProvider).isLoading;

    return Stack(
      children: [
        Scaffold(
          backgroundColor: AppColors.background,
          body: SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                children: [
                  const SizedBox(height: 60),
                  // Brand header
                  Container(
                    width: 96,
                    height: 96,
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(28),
                    ),
                    child: const Center(
                      child: Text(
                        'K',
                        style: TextStyle(
                          fontSize: 54,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    'Koblio',
                    style: Theme.of(context).textTheme.headlineLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Math learning, made fun',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 60),
                  Text(
                    'Who are you?',
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Choose your role to get started',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 32),
                  _RoleCard(
                    icon: Icons.school_outlined,
                    label: 'Student',
                    description: 'I want to learn math',
                    color: AppColors.primary,
                    onTap: isLoading ? null : () => context.push('/login'),
                  ),
                  const SizedBox(height: 16),
                  _RoleCard(
                    icon: Icons.family_restroom_outlined,
                    label: 'Parent',
                    description: "I want to track my child's progress",
                    color: const Color(0xFF4CAF50),
                    onTap: isLoading
                        ? null
                        : () => _handleAuth0Login(context, ref, role: 'PARENT'),
                  ),
                  const SizedBox(height: 16),
                  _RoleCard(
                    icon: Icons.person_outline,
                    label: 'Teacher',
                    description: 'I manage a classroom',
                    color: const Color(0xFF26C6DA),
                    onTap: isLoading
                        ? null
                        : () =>
                            _handleAuth0Login(context, ref, role: 'TEACHER'),
                  ),
                  const Spacer(),
                ],
              ),
            ),
          ),
        ),
        // Loading overlay — shown while Auth0 browser session is in progress.
        if (isLoading)
          const ColoredBox(
            color: Color(0x80000000),
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CircularProgressIndicator(color: Colors.white),
                  SizedBox(height: 16),
                  Text(
                    'Opening login…',
                    style: TextStyle(color: Colors.white, fontSize: 16),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }

  Future<void> _handleAuth0Login(
    BuildContext context,
    WidgetRef ref, {
    required String role,
  }) async {
    try {
      await ref.read(authProvider.notifier).loginWithAuth0(role: role);
      // On success the router's redirect logic will navigate away automatically.
    } catch (e) {
      if (!context.mounted) return;
      final message = _friendlyError(e);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  /// Converts a raw exception into a user-friendly message.
  String _friendlyError(Object e) {
    final raw = e.toString();
    // User cancelled the browser session — not an error worth alarming about.
    if (raw.contains('UserCanceled') ||
        raw.contains('user_cancelled') ||
        raw.contains('org.openid.appauth')) {
      return 'Login cancelled.';
    }
    // Placeholder credentials — expected in dev without a real Auth0 tenant.
    if (raw.contains('YOUR_TENANT') || raw.contains('YOUR_MOBILE_CLIENT_ID')) {
      return 'Auth0 is not yet configured for this build. '
          'Set AUTH0_DOMAIN and AUTH0_MOBILE_CLIENT_ID to enable login.';
    }
    return 'Login failed — please try again. ($raw)';
  }
}

class _RoleCard extends StatelessWidget {
  const _RoleCard({
    required this.icon,
    required this.label,
    required this.description,
    required this.color,
    this.onTap,
  });

  final IconData icon;
  final String label;
  final String description;
  final Color color;

  /// Null disables interaction (used while auth is loading).
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: color.withAlpha(30),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(icon, color: color, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label,
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      description,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.arrow_forward_ios,
                size: 16,
                color: AppColors.textSecondary,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
