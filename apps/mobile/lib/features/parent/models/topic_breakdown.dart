/// Per-topic attempt stats returned inside [ChildProgress].
class TopicBreakdown {
  const TopicBreakdown({
    required this.topic,
    required this.attempted,
    required this.correct,
  });

  final String topic;
  final int attempted;
  final int correct;

  factory TopicBreakdown.fromJson(Map<String, dynamic> json) {
    return TopicBreakdown(
      topic: json['topic'] as String? ?? '',
      attempted: (json['attempted'] as num?)?.toInt() ?? 0,
      correct: (json['correct'] as num?)?.toInt() ?? 0,
    );
  }
}
