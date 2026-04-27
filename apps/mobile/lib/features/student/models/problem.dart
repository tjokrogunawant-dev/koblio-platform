import 'package:koblio_mobile/features/student/models/problem_option.dart';

class Problem {
  const Problem({
    required this.id,
    required this.grade,
    required this.strand,
    required this.topic,
    required this.difficulty,
    required this.type,
    required this.questionText,
    required this.correctAnswer,
    required this.solution,
    this.options,
    this.hints,
  });

  final String id;
  final int grade;
  final String strand;
  final String topic;
  final String difficulty;
  final String type;
  final String questionText;
  final String correctAnswer;
  final String solution;
  final List<ProblemOption>? options;
  final List<String>? hints;

  factory Problem.fromJson(Map<String, dynamic> json) {
    return Problem(
      id: json['id'] as String,
      grade: (json['grade'] as num).toInt(),
      strand: json['strand'] as String,
      topic: json['topic'] as String,
      difficulty: json['difficulty'] as String,
      type: json['type'] as String,
      questionText: json['questionText'] as String,
      correctAnswer: json['correctAnswer'] as String,
      solution: json['solution'] as String? ?? '',
      options: (json['options'] as List<dynamic>?)
          ?.map((o) => ProblemOption.fromJson(o as Map<String, dynamic>))
          .toList(),
      hints: (json['hints'] as List<dynamic>?)?.cast<String>(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'grade': grade,
        'strand': strand,
        'topic': topic,
        'difficulty': difficulty,
        'type': type,
        'questionText': questionText,
        'correctAnswer': correctAnswer,
        'solution': solution,
        if (options != null) 'options': options!.map((o) => o.toJson()).toList(),
        if (hints != null) 'hints': hints,
      };
}
