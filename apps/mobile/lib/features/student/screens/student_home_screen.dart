import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:koblio_mobile/features/student/models/problem.dart';
import 'package:koblio_mobile/features/student/providers/problems_provider.dart';
import 'package:koblio_mobile/features/student/providers/student_stats_provider.dart';
import 'package:koblio_mobile/features/student/widgets/stat_card.dart';
import 'package:koblio_mobile/providers/providers.dart';
import 'package:koblio_mobile/theme/app_theme.dart';

class StudentHomeScreen extends ConsumerWidget {
  const StudentHomeScreen({super.key});

  // Default grade — in future this will come from the student's profile
  static const int _defaultGrade = 2;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final displayName = auth.displayName ?? 'Student';
    final statsAsync = ref.watch(studentStatsProvider);
    final dailyAsync = ref.watch(dailyChallengeProvider(_defaultGrade));

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(studentStatsProvider);
            ref.invalidate(dailyChallengeProvider(_defaultGrade));
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildGreeting(context, displayName),
                const SizedBox(height: 24),
                // Stats row
                statsAsync.when(
                  data: (stats) => Row(
                    children: [
                      Expanded(
                        child: StatCard(
                          icon: Icons.local_fire_department_rounded,
                          value: stats.streakCount.toString(),
                          label: 'Streak',
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: StatCard(
                          icon: Icons.monetization_on_rounded,
                          value: stats.coins.toString(),
                          label: 'Coins',
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: StatCard(
                          icon: Icons.emoji_events_rounded,
                          value: 'Lv ${stats.level}',
                          label: '${stats.xp} XP',
                        ),
                      ),
                    ],
                  ),
                  loading: () => const _StatsPlaceholder(),
                  error: (_, __) => const _StatsPlaceholder(),
                ),
                const SizedBox(height: 24),
                Text(
                  'Daily Challenge',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 12),
                dailyAsync.when(
                  data: (problem) => _DailyChallengeCard(problem: problem),
                  loading: () => _buildDailyLoading(),
                  error: (_, __) => _DailyChallengeCard(problem: null),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () => context.push('/student/problems'),
                    icon: const Icon(Icons.list_alt_rounded),
                    label: const Text('Browse Problems'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildGreeting(BuildContext context, String name) {
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
            child: Text('🎓', style: TextStyle(fontSize: 26)),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Hi, $name!',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              Text(
                'Ready to learn today?',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDailyLoading() {
    return Card(
      color: AppColors.accent,
      child: const Padding(
        padding: EdgeInsets.all(20),
        child: Center(
          child: SizedBox(
            height: 24,
            width: 24,
            child: CircularProgressIndicator(strokeWidth: 2),
          ),
        ),
      ),
    );
  }
}

class _DailyChallengeCard extends StatelessWidget {
  const _DailyChallengeCard({required this.problem});

  final Problem? problem;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: AppColors.accent,
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: problem != null
            ? () => context.push('/student/problems/solve', extra: problem)
            : null,
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      problem?.topic ?? 'Daily Challenge',
                      style:
                          Theme.of(context).textTheme.titleLarge?.copyWith(
                                color: AppColors.textPrimary,
                              ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      problem != null
                          ? 'Tap to solve — earn bonus coins!'
                          : 'No challenge available today',
                      style: const TextStyle(color: AppColors.textPrimary),
                    ),
                  ],
                ),
              ),
              if (problem != null)
                ElevatedButton(
                  onPressed: () =>
                      context.push('/student/problems/solve', extra: problem),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    minimumSize: const Size(80, 40),
                  ),
                  child: const Text('Solve'),
                )
              else
                const Icon(
                  Icons.star_rounded,
                  size: 40,
                  color: AppColors.textPrimary,
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatsPlaceholder extends StatelessWidget {
  const _StatsPlaceholder();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(
        3,
        (i) => Expanded(
          child: Padding(
            padding: EdgeInsets.only(left: i == 0 ? 0 : 12),
            child: Card(
              child: const SizedBox(height: 88),
            ),
          ),
        ),
      ),
    );
  }
}
