class StudentStats {
  const StudentStats({
    required this.coins,
    required this.xp,
    required this.level,
    required this.streakCount,
  });

  final int coins;
  final int xp;
  final int level;
  final int streakCount;

  factory StudentStats.fromJson(Map<String, dynamic> json) {
    return StudentStats(
      coins: (json['coins'] as num?)?.toInt() ?? 0,
      xp: (json['xp'] as num?)?.toInt() ?? 0,
      level: (json['level'] as num?)?.toInt() ?? 1,
      streakCount: (json['streakCount'] as num?)?.toInt() ?? 0,
    );
  }
}
