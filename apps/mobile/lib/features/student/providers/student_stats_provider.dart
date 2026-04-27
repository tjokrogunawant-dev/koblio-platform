import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:koblio_mobile/features/student/models/student_stats.dart';
import 'package:koblio_mobile/providers/providers.dart';

/// Fetches the current student's gamification profile from GET /gamification/me
/// Returns: { coins, xp, level, streakCount, levelInfo }
final studentStatsProvider = FutureProvider<StudentStats>((ref) async {
  final api = ref.watch(apiClientProvider);
  final response =
      await api.get<Map<String, dynamic>>('/gamification/me');
  return StudentStats.fromJson(response.data!);
});
