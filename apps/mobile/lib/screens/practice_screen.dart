import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:koblio_mobile/theme/app_theme.dart';

class PracticeScreen extends ConsumerWidget {
  const PracticeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Practice',
                style: Theme.of(context).textTheme.headlineLarge,
              ),
              const SizedBox(height: 8),
              Text(
                'Choose a topic to start solving',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 24),
              Expanded(
                child: GridView.count(
                  crossAxisCount: 2,
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                  children: const [
                    _TopicCard(
                      icon: Icons.pin_outlined,
                      title: 'Numbers',
                      color: Color(0xFF6C63FF),
                    ),
                    _TopicCard(
                      icon: Icons.add_circle_outline,
                      title: 'Addition',
                      color: Color(0xFF4CAF50),
                    ),
                    _TopicCard(
                      icon: Icons.remove_circle_outline,
                      title: 'Subtraction',
                      color: Color(0xFFFF6B6B),
                    ),
                    _TopicCard(
                      icon: Icons.grid_on,
                      title: 'Multiplication',
                      color: Color(0xFFFFD93D),
                    ),
                    _TopicCard(
                      icon: Icons.pie_chart_outline,
                      title: 'Fractions',
                      color: Color(0xFF26C6DA),
                    ),
                    _TopicCard(
                      icon: Icons.square_foot,
                      title: 'Geometry',
                      color: Color(0xFFAB47BC),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _TopicCard extends StatelessWidget {
  const _TopicCard({
    required this.icon,
    required this.title,
    required this.color,
  });

  final IconData icon;
  final String title;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: () {},
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: color.withAlpha(25),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(icon, color: color, size: 32),
              ),
              const SizedBox(height: 12),
              Text(
                title,
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontSize: 16,
                    ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
