class AttemptResult {
  const AttemptResult({
    required this.correct,
    required this.correctAnswer,
    required this.solution,
    required this.attemptId,
    required this.coinsEarned,
    required this.xpEarned,
    required this.leveledUp,
    required this.badgesEarned,
  });

  final bool correct;
  final String correctAnswer;
  final String solution;
  final String attemptId;
  final int coinsEarned;
  final int xpEarned;
  final bool leveledUp;
  final List<String> badgesEarned;

  factory AttemptResult.fromJson(Map<String, dynamic> json) {
    return AttemptResult(
      correct: json['correct'] as bool,
      correctAnswer: json['correctAnswer'] as String,
      solution: json['solution'] as String? ?? '',
      attemptId: json['attemptId'] as String,
      coinsEarned: (json['coinsEarned'] as num?)?.toInt() ?? 0,
      xpEarned: (json['xpEarned'] as num?)?.toInt() ?? 0,
      leveledUp: json['leveledUp'] as bool? ?? false,
      badgesEarned: (json['badgesEarned'] as List<dynamic>?)?.cast<String>() ?? [],
    );
  }
}
