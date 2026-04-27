/// Lightweight reference to a child linked to the authenticated parent.
///
/// Returned by GET /api/parent/children.
class ChildRef {
  const ChildRef({
    required this.id,
    required this.name,
    this.grade,
  });

  final String id;
  final String name;
  final int? grade;

  factory ChildRef.fromJson(Map<String, dynamic> json) {
    return ChildRef(
      id: json['id'] as String,
      name: json['name'] as String? ?? '',
      grade: (json['grade'] as num?)?.toInt(),
    );
  }
}
