import 'package:koblio_mobile/features/parent/models/topic_breakdown.dart';

/// Detailed progress snapshot for a linked child.
///
/// Returned by GET /api/parent/children/:childId/progress.
/// Shape mirrors [ParentService.getChildProgress] in the NestJS backend.
class ChildProgress {
  const ChildProgress({
    required this.totalAttempts,
    required this.correctAttempts,
    required this.accuracyPercent,
    required this.streakCount,
    required this.coins,
    required this.xp,
    required this.level,
    required this.topicBreakdown,
  });

  final int totalAttempts;
  final int correctAttempts;
  final double accuracyPercent;
  final int streakCount;
  final int coins;
  final int xp;
  final int level;

  /// Per-topic attempt breakdown.
  final List<TopicBreakdown> topicBreakdown;

  /// Convenience accessor: unique topic names attempted.
  List<String> get topicsAttempted =>
      topicBreakdown.map((t) => t.topic).toList();

  factory ChildProgress.fromJson(Map<String, dynamic> json) {
    final breakdownList =
        (json['topicBreakdown'] as List<dynamic>? ?? [])
            .map((item) =>
                TopicBreakdown.fromJson(item as Map<String, dynamic>))
            .toList();

    return ChildProgress(
      totalAttempts: (json['totalAttempts'] as num?)?.toInt() ?? 0,
      correctAttempts: (json['correctAttempts'] as num?)?.toInt() ?? 0,
      accuracyPercent:
          (json['accuracyPercent'] as num?)?.toDouble() ?? 0.0,
      streakCount: (json['streakCount'] as num?)?.toInt() ?? 0,
      coins: (json['coins'] as num?)?.toInt() ?? 0,
      xp: (json['xp'] as num?)?.toInt() ?? 0,
      level: (json['level'] as num?)?.toInt() ?? 1,
      topicBreakdown: breakdownList,
    );
  }
}
