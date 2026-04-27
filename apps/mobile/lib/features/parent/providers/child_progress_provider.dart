import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:koblio_mobile/features/parent/models/child_progress.dart';
import 'package:koblio_mobile/providers/providers.dart';

/// Fetches progress for a specific child, keyed by childId.
///
/// Maps GET /parent/children/:childId/progress → [ChildProgress].
final childProgressProvider =
    FutureProvider.family<ChildProgress, String>((ref, childId) async {
  final api = ref.watch(apiClientProvider);
  final data = await api.getChildProgress(childId);
  return ChildProgress.fromJson(data);
});
