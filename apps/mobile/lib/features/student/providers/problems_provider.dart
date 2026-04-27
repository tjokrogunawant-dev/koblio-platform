import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:koblio_mobile/features/student/models/problem.dart';
import 'package:koblio_mobile/providers/providers.dart';

/// Fetches problems for a given grade from GET /content/problems?grade=$grade
final problemsProvider =
    FutureProvider.family<List<Problem>, int>((ref, grade) async {
  final api = ref.watch(apiClientProvider);
  final response = await api.get<Map<String, dynamic>>(
    '/content/problems',
    queryParameters: {'grade': grade},
  );
  final data = response.data!;
  final list = data['data'] as List<dynamic>;
  return list
      .map((item) => Problem.fromJson(item as Map<String, dynamic>))
      .toList();
});

/// Fetches the daily challenge problem for a grade from
/// GET /gamification/daily-challenge/$grade
final dailyChallengeProvider =
    FutureProvider.family<Problem?, int>((ref, grade) async {
  final api = ref.watch(apiClientProvider);
  final response = await api.get<Map<String, dynamic>>(
    '/gamification/daily-challenge/$grade',
  );
  final data = response.data;
  if (data == null) return null;
  return Problem.fromJson(data);
});
