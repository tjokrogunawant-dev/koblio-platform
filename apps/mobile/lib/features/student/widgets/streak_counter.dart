import 'package:flutter/material.dart';
import 'package:koblio_mobile/theme/app_theme.dart';

/// Displays the student's current daily learning streak.
///
/// - 0-day streak: gray flame + "Start your streak!"
/// - 1–6 days: orange/primary flame + count
/// - 7+ days: golden flame + count (bonus color)
class StreakCounter extends StatelessWidget {
  const StreakCounter({
    super.key,
    required this.streakCount,
  });

  final int streakCount;

  @override
  Widget build(BuildContext context) {
    final isGolden = streakCount >= 7;
    final isEmpty = streakCount == 0;

    final Color flameColor = isEmpty
        ? AppColors.textSecondary
        : isGolden
            ? const Color(0xFFFFB300) // golden amber
            : AppColors.secondary;

    final String label = isEmpty
        ? 'Start your streak!'
        : '$streakCount ${streakCount == 1 ? 'day' : 'days'}';

    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
        child: Row(
          children: [
            Text(
              '🔥',
              style: TextStyle(
                fontSize: 28,
                color: isEmpty ? null : null, // emoji color is intrinsic
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isEmpty ? 'No streak yet' : 'Learning Streak',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  Text(
                    label,
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          color: flameColor,
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                ],
              ),
            ),
            if (isGolden)
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 8,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF8E1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: const Color(0xFFFFB300),
                    width: 1,
                  ),
                ),
                child: Text(
                  'Bonus x1.5',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: const Color(0xFFE65100),
                        fontWeight: FontWeight.w700,
                        fontSize: 11,
                      ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
