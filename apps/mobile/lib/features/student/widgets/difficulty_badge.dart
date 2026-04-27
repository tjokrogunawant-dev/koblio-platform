import 'package:flutter/material.dart';

class DifficultyBadge extends StatelessWidget {
  const DifficultyBadge({super.key, required this.difficulty});

  final String difficulty;

  @override
  Widget build(BuildContext context) {
    final upper = difficulty.toUpperCase();
    final Color color;
    switch (upper) {
      case 'EASY':
        color = Colors.green;
      case 'MEDIUM':
        color = Colors.amber.shade700;
      case 'HARD':
        color = Colors.red;
      default:
        color = Colors.grey;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withAlpha(30),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withAlpha(120)),
      ),
      child: Text(
        difficulty,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
