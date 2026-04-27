import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:koblio_mobile/providers/providers.dart';
import 'package:koblio_mobile/theme/app_theme.dart';

/// Entry screen for unauthenticated users.
///
/// Students are routed to the username/password [LoginScreen].
/// Parent and Teacher flows trigger Auth0 PKCE (stubbed until P3-T04).
class RoleSelectScreen extends ConsumerWidget {
  const RoleSelectScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
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
                onTap: () => context.push('/login'),
              ),
              const SizedBox(height: 16),
              _RoleCard(
                icon: Icons.family_restroom_outlined,
                label: 'Parent',
                description: 'I want to track my child\'s progress',
                color: const Color(0xFF4CAF50),
                onTap: () => _handleAuth0Login(context, ref, role: 'PARENT'),
              ),
              const SizedBox(height: 16),
              _RoleCard(
                icon: Icons.person_outline,
                label: 'Teacher',
                description: 'I manage a classroom',
                color: const Color(0xFF26C6DA),
                onTap: () => _handleAuth0Login(context, ref, role: 'TEACHER'),
              ),
              const Spacer(),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _handleAuth0Login(
    BuildContext context,
    WidgetRef ref, {
    required String role,
  }) async {
    try {
      await ref.read(authProvider.notifier).loginWithAuth0(role: role);
    } on UnimplementedError {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Parent / Teacher login coming soon — Auth0 provisioning in progress.',
          ),
          behavior: SnackBarBehavior.floating,
        ),
      );
    } on Exception catch (e) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Login failed: $e'),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }
}

class _RoleCard extends StatelessWidget {
  const _RoleCard({
    required this.icon,
    required this.label,
    required this.description,
    required this.color,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final String description;
  final Color color;
  final VoidCallback onTap;

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
