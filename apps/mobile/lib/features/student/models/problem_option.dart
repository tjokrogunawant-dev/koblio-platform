class ProblemOption {
  const ProblemOption({
    required this.label,
    required this.text,
  });

  final String label;
  final String text;

  factory ProblemOption.fromJson(Map<String, dynamic> json) {
    return ProblemOption(
      label: json['label'] as String,
      text: json['text'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'label': label,
        'text': text,
      };
}
