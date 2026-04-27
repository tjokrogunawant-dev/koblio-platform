import 'package:flutter/material.dart';
import 'package:koblio_mobile/theme/app_theme.dart';

/// Displays the student's current level and XP progress toward the next level.
///
/// Shows a "Level N" label on the left, XP remaining on the right, and a
/// LinearProgressIndicator in between using the app's indigo/purple palette.
class XpProgressBar extends StatelessWidget {
  const XpProgressBar({
    super.key,
    required this.currentXp,
    required this.level,
    required this.progressPercent,
  });

  final int currentXp;
  final int level;

  /// Value between 0.0 and 100.0 (as returned by the API's progressPercent).
  final double progressPercent;

  @override
  Widget build(BuildContext context) {
    // API returns 0–100; LinearProgressIndicator expects 0.0–1.0
    final progress = (progressPercent / 100.0).clamp(0.0, 1.0);

    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.auto_awesome_rounded,
                      size: 18,
                      color: AppColors.primary,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'Level $level',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w800,
                          ),
                    ),
                  ],
                ),
                Text(
                  '$currentXp XP',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                value: progress,
                minHeight: 10,
                backgroundColor: AppColors.background,
                valueColor: const AlwaysStoppedAnimation<Color>(
                  AppColors.primary,
                ),
              ),
            ),
            const SizedBox(height: 6),
            Align(
              alignment: Alignment.centerRight,
              child: Text(
                progressPercent >= 100.0
                    ? 'Max level!'
                    : '${progressPercent.toStringAsFixed(0)}% to Level ${level + 1}',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
