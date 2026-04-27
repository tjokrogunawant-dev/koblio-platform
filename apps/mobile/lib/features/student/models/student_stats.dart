class LevelInfo {
  const LevelInfo({
    required this.currentLevel,
    required this.xpToNextLevel,
    required this.progressPercent,
  });

  final int currentLevel;
  final int xpToNextLevel;
  final double progressPercent;

  factory LevelInfo.fromJson(Map<String, dynamic> json) {
    return LevelInfo(
      currentLevel: (json['level'] as num?)?.toInt() ?? 1,
      xpToNextLevel: (json['xpToNextLevel'] as num?)?.toInt() ?? 0,
      progressPercent: (json['progressPercent'] as num?)?.toDouble() ?? 0.0,
    );
  }

  static const empty = LevelInfo(
    currentLevel: 1,
    xpToNextLevel: 100,
    progressPercent: 0.0,
  );
}

class StudentStats {
  const StudentStats({
    required this.coins,
    required this.xp,
    required this.level,
    required this.streakCount,
    required this.levelInfo,
  });

  final int coins;
  final int xp;
  final int level;
  final int streakCount;
  final LevelInfo levelInfo;

  factory StudentStats.fromJson(Map<String, dynamic> json) {
    final levelInfoJson = json['levelInfo'] as Map<String, dynamic>?;
    return StudentStats(
      coins: (json['coins'] as num?)?.toInt() ?? 0,
      xp: (json['xp'] as num?)?.toInt() ?? 0,
      level: (json['level'] as num?)?.toInt() ?? 1,
      streakCount: (json['streakCount'] as num?)?.toInt() ?? 0,
      levelInfo: levelInfoJson != null
          ? LevelInfo.fromJson(levelInfoJson)
          : LevelInfo.empty,
    );
  }
}
