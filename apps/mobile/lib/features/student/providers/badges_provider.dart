import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:koblio_mobile/features/student/models/badge_model.dart';
import 'package:koblio_mobile/providers/providers.dart';

/// Fetches the current student's earned badges from GET /badges/me
/// Returns an array of badge objects: [{ type, slug, name, description, iconEmoji, awardedAt }]
final badgesProvider = FutureProvider<List<BadgeModel>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final response = await api.getMyBadges();
  final list = response.data ?? [];
  return list
      .map((item) => BadgeModel.fromJson(item as Map<String, dynamic>))
      .toList();
});
