import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:koblio_mobile/features/parent/models/child_ref.dart';
import 'package:koblio_mobile/providers/providers.dart';

/// Fetches the list of children linked to the authenticated parent.
///
/// Maps GET /parent/children → [List<ChildRef>].
final childrenProvider = FutureProvider<List<ChildRef>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final raw = await api.getMyChildren();
  return raw
      .map((item) => ChildRef.fromJson(item as Map<String, dynamic>))
      .toList();
});
