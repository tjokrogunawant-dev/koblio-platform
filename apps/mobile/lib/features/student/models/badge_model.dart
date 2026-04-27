class BadgeModel {
  const BadgeModel({
    required this.id,
    required this.type,
    required this.awardedAt,
    required this.name,
    required this.description,
    required this.iconEmoji,
  });

  final String id;
  final String type;
  final DateTime awardedAt;
  final String name;
  final String description;
  final String iconEmoji;

  factory BadgeModel.fromJson(Map<String, dynamic> json) {
    return BadgeModel(
      // The API doesn't return a top-level `id` — use slug/type as identifier
      id: (json['slug'] as String?) ?? (json['type'] as String? ?? ''),
      type: (json['type'] as String?) ?? '',
      awardedAt: json['awardedAt'] != null
          ? DateTime.parse(json['awardedAt'] as String)
          : DateTime.now(),
      name: (json['name'] as String?) ?? '',
      description: (json['description'] as String?) ?? '',
      iconEmoji: (json['iconEmoji'] as String?) ?? '🏅',
    );
  }
}
