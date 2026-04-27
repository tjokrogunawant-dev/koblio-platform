import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:koblio_mobile/features/parent/models/child_progress.dart';
import 'package:koblio_mobile/features/parent/models/child_ref.dart';
import 'package:koblio_mobile/features/parent/providers/child_progress_provider.dart';
import 'package:koblio_mobile/theme/app_theme.dart';

/// Detailed progress view for a single child.
///
/// Route: /parent/children/:childId  (extra: ChildRef)
class ChildDetailScreen extends ConsumerWidget {
  const ChildDetailScreen({super.key, required this.child});

  final ChildRef child;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final progressAsync = ref.watch(childProgressProvider(child.id));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        elevation: 0,
        leading: const BackButton(color: AppColors.textPrimary),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              child.name,
              style: Theme.of(context).textTheme.titleLarge,
            ),
            if (child.grade != null)
              Text(
                'Grade ${child.grade}',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
          ],
        ),
        titleSpacing: 0,
      ),
      body: progressAsync.when(
        data: (progress) => _ProgressBody(child: child, progress: progress),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.error_outline,
                  size: 48,
                  color: AppColors.error,
                ),
                const SizedBox(height: 12),
                Text(
                  'Could not load progress.',
                  style: Theme.of(context).textTheme.titleLarge,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  error.toString(),
                  style: Theme.of(context).textTheme.bodyMedium,
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Progress body ─────────────────────────────────────────────────────────────

class _ProgressBody extends StatelessWidget {
  const _ProgressBody({required this.child, required this.progress});

  final ChildRef child;
  final ChildProgress progress;

  @override
  Widget build(BuildContext context) {
    final accuracy = progress.accuracyPercent / 100.0;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Accuracy card ──────────────────────────────────────────────
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Accuracy',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Text(
                        '${progress.accuracyPercent.toStringAsFixed(0)}%',
                        style: Theme.of(context)
                            .textTheme
                            .headlineLarge
                            ?.copyWith(color: AppColors.primary),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '${progress.correctAttempts} / ${progress.totalAttempts} correct',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: LinearProgressIndicator(
                      value: accuracy.clamp(0.0, 1.0),
                      minHeight: 12,
                      backgroundColor: const Color(0xFFE8E8F0),
                      valueColor: const AlwaysStoppedAnimation<Color>(
                        AppColors.success,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // ── Stats grid ────────────────────────────────────────────────
          Row(
            children: [
              Expanded(
                child: _StatCard(
                  icon: Icons.assignment_turned_in_outlined,
                  value: progress.totalAttempts.toString(),
                  label: 'Total Attempts',
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _StatCard(
                  icon: Icons.local_fire_department_rounded,
                  value: progress.streakCount.toString(),
                  label: 'Day Streak',
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _StatCard(
                  icon: Icons.monetization_on_rounded,
                  value: progress.coins.toString(),
                  label: 'Coins',
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _StatCard(
                  icon: Icons.emoji_events_rounded,
                  value: 'Lv ${progress.level}',
                  label: '${progress.xp} XP',
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // ── Topics attempted ──────────────────────────────────────────
          Text(
            'Topics Attempted',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 12),
          if (progress.topicsAttempted.isEmpty)
            Text(
              'No topics attempted yet.',
              style: Theme.of(context).textTheme.bodyMedium,
            )
          else
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: progress.topicBreakdown.map((tb) {
                return Chip(
                  label: Text(
                    tb.topic,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  avatar: CircleAvatar(
                    backgroundColor: AppColors.primary.withAlpha(30),
                    child: Text(
                      '${tb.correct}/${tb.attempted}',
                      style: const TextStyle(
                        fontSize: 9,
                        color: AppColors.primary,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  backgroundColor: AppColors.surface,
                  side: const BorderSide(color: Color(0xFFE8E8F0)),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                );
              }).toList(),
            ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

// ─── Stat card ─────────────────────────────────────────────────────────────────

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.icon,
    required this.value,
    required this.label,
  });

  final IconData icon;
  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppColors.primary.withAlpha(25),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: AppColors.primary, size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    value,
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  Text(
                    label,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
