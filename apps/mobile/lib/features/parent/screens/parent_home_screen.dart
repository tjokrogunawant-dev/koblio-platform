import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:koblio_mobile/features/parent/models/child_ref.dart';
import 'package:koblio_mobile/features/parent/providers/child_progress_provider.dart';
import 'package:koblio_mobile/features/parent/providers/children_provider.dart';
import 'package:koblio_mobile/providers/providers.dart';
import 'package:koblio_mobile/theme/app_theme.dart';

/// Parent dashboard — lists all children linked to the authenticated parent,
/// each with a quick-stats card (accuracy, total attempts).
///
/// Route: /parent/home (ShellRoute)
class ParentHomeScreen extends ConsumerWidget {
  const ParentHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final displayName = auth.displayName ?? 'Parent';
    final childrenAsync = ref.watch(childrenProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(childrenProvider);
          },
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: [
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 24, 20, 8),
                sliver: SliverToBoxAdapter(
                  child: _ParentGreeting(displayName: displayName),
                ),
              ),
              childrenAsync.when(
                data: (children) {
                  if (children.isEmpty) {
                    return const SliverFillRemaining(
                      hasScrollBody: false,
                      child: _EmptyChildrenState(),
                    );
                  }
                  return SliverPadding(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final child = children[index];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 16),
                            child: _ChildCard(child: child),
                          );
                        },
                        childCount: children.length,
                      ),
                    ),
                  );
                },
                loading: () => const SliverFillRemaining(
                  hasScrollBody: false,
                  child: Center(child: CircularProgressIndicator()),
                ),
                error: (error, _) => SliverFillRemaining(
                  hasScrollBody: false,
                  child: Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Text(
                        'Could not load children: $error',
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Greeting ──────────────────────────────────────────────────────────────────

class _ParentGreeting extends StatelessWidget {
  const _ParentGreeting({required this.displayName});

  final String displayName;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 52,
          height: 52,
          decoration: BoxDecoration(
            color: AppColors.primaryLight,
            borderRadius: BorderRadius.circular(16),
          ),
          child: const Center(
            child: Icon(Icons.family_restroom, color: Colors.white, size: 28),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Welcome, $displayName!',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              Text(
                "Your children's progress at a glance",
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ─── Empty state ───────────────────────────────────────────────────────────────

class _EmptyChildrenState extends StatelessWidget {
  const _EmptyChildrenState();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.child_care_outlined,
              size: 64,
              color: AppColors.textSecondary,
            ),
            const SizedBox(height: 16),
            Text(
              'No children linked yet.',
              style: Theme.of(context).textTheme.titleLarge,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              "Ask your child's teacher to link your account.",
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Child card ────────────────────────────────────────────────────────────────

/// Card for a single child — loads the child's progress inline.
class _ChildCard extends ConsumerWidget {
  const _ChildCard({required this.child});

  final ChildRef child;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final progressAsync = ref.watch(childProgressProvider(child.id));

    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => context.push(
          '/parent/children/${child.id}',
          extra: child,
        ),
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Header row ───────────────────────────────────────────────
              Row(
                children: [
                  Expanded(
                    child: Text(
                      child.name,
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                  ),
                  if (child.grade != null)
                    _GradeBadge(grade: child.grade!),
                ],
              ),
              const SizedBox(height: 14),
              // ── Stats row ────────────────────────────────────────────────
              progressAsync.when(
                data: (progress) => _ProgressSummary(progress: progress),
                loading: () => const _CardProgressSkeleton(),
                error: (_, __) => Text(
                  'Could not load progress',
                  style: Theme.of(context)
                      .textTheme
                      .bodyMedium
                      ?.copyWith(color: AppColors.error),
                ),
              ),
              const SizedBox(height: 12),
              // ── Tap hint ─────────────────────────────────────────────────
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(
                    'View details',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  const SizedBox(width: 4),
                  const Icon(
                    Icons.chevron_right,
                    color: AppColors.primary,
                    size: 18,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Supporting widgets ────────────────────────────────────────────────────────

class _GradeBadge extends StatelessWidget {
  const _GradeBadge({required this.grade});

  final int grade;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.primary.withAlpha(25),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        'Grade $grade',
        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.w700,
            ),
      ),
    );
  }
}

class _ProgressSummary extends StatelessWidget {
  const _ProgressSummary({required this.progress});

  final dynamic progress;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _StatPill(
          icon: Icons.check_circle_outline,
          label: '${progress.totalAttempts} attempts',
          color: AppColors.primary,
        ),
        const SizedBox(width: 10),
        _StatPill(
          icon: Icons.percent,
          label: '${progress.accuracyPercent.toStringAsFixed(0)}% accuracy',
          color: AppColors.success,
        ),
      ],
    );
  }
}

class _StatPill extends StatelessWidget {
  const _StatPill({
    required this.icon,
    required this.label,
    required this.color,
  });

  final IconData icon;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withAlpha(20),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: color,
                  fontWeight: FontWeight.w600,
                ),
          ),
        ],
      ),
    );
  }
}

class _CardProgressSkeleton extends StatelessWidget {
  const _CardProgressSkeleton();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(
        2,
        (i) => Padding(
          padding: EdgeInsets.only(right: i == 0 ? 10 : 0),
          child: Container(
            height: 28,
            width: 110,
            decoration: BoxDecoration(
              color: const Color(0xFFE8E8F0),
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      ),
    );
  }
}
