import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:koblio_mobile/features/student/models/attempt_result.dart';
import 'package:koblio_mobile/features/student/models/problem.dart';
import 'package:koblio_mobile/providers/providers.dart';
import 'package:koblio_mobile/theme/app_theme.dart';

class ProblemSolverScreen extends ConsumerStatefulWidget {
  const ProblemSolverScreen({super.key, required this.problem});

  final Problem problem;

  @override
  ConsumerState<ProblemSolverScreen> createState() =>
      _ProblemSolverScreenState();
}

class _ProblemSolverScreenState extends ConsumerState<ProblemSolverScreen> {
  String? _selectedAnswer;
  final TextEditingController _textController = TextEditingController();
  bool _isSubmitting = false;
  AttemptResult? _result;

  // Timer state
  int _elapsedSeconds = 0;
  Timer? _timer;
  final Stopwatch _stopwatch = Stopwatch();

  @override
  void initState() {
    super.initState();
    _stopwatch.start();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) {
        setState(() => _elapsedSeconds = _stopwatch.elapsed.inSeconds);
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _stopwatch.stop();
    _textController.dispose();
    super.dispose();
  }

  String get _problemType => widget.problem.type.toUpperCase();

  String? get _currentAnswer {
    if (_problemType == 'FILL_BLANK') {
      return _textController.text.trim().isEmpty
          ? null
          : _textController.text.trim();
    }
    return _selectedAnswer;
  }

  bool get _canSubmit => _currentAnswer != null && !_isSubmitting;

  Future<void> _submit() async {
    final answer = _currentAnswer;
    if (answer == null) return;

    setState(() => _isSubmitting = true);
    _stopwatch.stop();
    _timer?.cancel();

    try {
      final api = ref.read(apiClientProvider);
      final response = await api.post<Map<String, dynamic>>(
        '/attempts',
        data: {
          'problemId': widget.problem.id,
          'answer': answer,
          'timeSpentMs': _stopwatch.elapsed.inMilliseconds,
          'hintUsed': false,
        },
      );
      final result = AttemptResult.fromJson(response.data!);
      setState(() => _result = result);
    } on Exception catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Submission failed: $e')),
        );
        // Restart stopwatch so user can retry
        _stopwatch.start();
        _timer = Timer.periodic(const Duration(seconds: 1), (_) {
          if (mounted) {
            setState(() => _elapsedSeconds = _stopwatch.elapsed.inSeconds);
          }
        });
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  void _tryAgain() {
    setState(() {
      _result = null;
      _selectedAnswer = null;
      _textController.clear();
      _elapsedSeconds = 0;
      _stopwatch
        ..reset()
        ..start();
      _timer?.cancel();
      _timer = Timer.periodic(const Duration(seconds: 1), (_) {
        if (mounted) {
          setState(() => _elapsedSeconds = _stopwatch.elapsed.inSeconds);
        }
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        title: Text(
          widget.problem.topic,
          style: Theme.of(context).textTheme.titleLarge,
        ),
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          onPressed: () => context.pop(),
        ),
        actions: [
          // Timer chip
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Center(
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.primary.withAlpha(20),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.timer_outlined,
                        size: 16, color: AppColors.primary),
                    const SizedBox(width: 4),
                    Text(
                      _formatTime(_elapsedSeconds),
                      style: const TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Question card
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.problem.questionText,
                          style: Theme.of(context)
                              .textTheme
                              .bodyLarge
                              ?.copyWith(
                                fontSize: 18,
                                fontWeight: FontWeight.w500,
                              ),
                        ),
                        if (widget.problem.hints?.isNotEmpty ?? false) ...[
                          const SizedBox(height: 12),
                          _HintRow(hints: widget.problem.hints!),
                        ],
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                // Answer input
                Text(
                  'Your Answer',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 12),
                _buildAnswerInput(),
                const SizedBox(height: 24),
                // Submit button
                if (_result == null)
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _canSubmit ? _submit : null,
                      child: _isSubmitting
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Text('Submit Answer'),
                    ),
                  ),
                const SizedBox(height: 80), // space for overlay clearance
              ],
            ),
          ),
          // Result overlay
          if (_result != null) _ResultOverlay(result: _result!, problem: widget.problem, onTryAgain: _tryAgain),
        ],
      ),
    );
  }

  Widget _buildAnswerInput() {
    switch (_problemType) {
      case 'MCQ':
        return _McqOptions(
          options: widget.problem.options ?? [],
          selected: _selectedAnswer,
          onSelect: _result == null
              ? (val) => setState(() => _selectedAnswer = val)
              : null,
        );
      case 'TRUE_FALSE':
        return _TrueFalseButtons(
          selected: _selectedAnswer,
          onSelect: _result == null
              ? (val) => setState(() => _selectedAnswer = val)
              : null,
        );
      case 'FILL_BLANK':
      default:
        return TextField(
          controller: _textController,
          enabled: _result == null,
          keyboardType: TextInputType.text,
          textCapitalization: TextCapitalization.none,
          onChanged: (_) => setState(() {}),
          decoration: const InputDecoration(
            hintText: 'Type your answer…',
          ),
        );
    }
  }

  String _formatTime(int seconds) {
    final m = seconds ~/ 60;
    final s = seconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }
}

// ─── MCQ options ──────────────────────────────────────────────────────────────

class _McqOptions extends StatelessWidget {
  const _McqOptions({
    required this.options,
    required this.selected,
    required this.onSelect,
  });

  final List<dynamic> options;
  final String? selected;
  final void Function(String)? onSelect;

  @override
  Widget build(BuildContext context) {
    if (options.isEmpty) {
      return const Text('No options available.');
    }
    return Column(
      children: options.map<Widget>((opt) {
        final label = opt.label as String;
        final text = opt.text as String;
        final isSelected = selected == label;
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: GestureDetector(
            onTap: onSelect != null ? () => onSelect!(label) : null,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              decoration: BoxDecoration(
                color: isSelected
                    ? AppColors.primary.withAlpha(20)
                    : AppColors.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color:
                      isSelected ? AppColors.primary : const Color(0xFFE8E8F0),
                  width: isSelected ? 2 : 1,
                ),
              ),
              child: Row(
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isSelected ? AppColors.primary : const Color(0xFFE8E8F0),
                    ),
                    child: Center(
                      child: Text(
                        label,
                        style: TextStyle(
                          color: isSelected ? Colors.white : AppColors.textSecondary,
                          fontWeight: FontWeight.w700,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      text,
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            fontWeight: isSelected
                                ? FontWeight.w600
                                : FontWeight.normal,
                          ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}

// ─── True / False buttons ─────────────────────────────────────────────────────

class _TrueFalseButtons extends StatelessWidget {
  const _TrueFalseButtons({
    required this.selected,
    required this.onSelect,
  });

  final String? selected;
  final void Function(String)? onSelect;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _TFButton(
            label: 'True',
            value: 'true',
            selected: selected,
            onSelect: onSelect,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _TFButton(
            label: 'False',
            value: 'false',
            selected: selected,
            onSelect: onSelect,
          ),
        ),
      ],
    );
  }
}

class _TFButton extends StatelessWidget {
  const _TFButton({
    required this.label,
    required this.value,
    required this.selected,
    required this.onSelect,
  });

  final String label;
  final String value;
  final String? selected;
  final void Function(String)? onSelect;

  @override
  Widget build(BuildContext context) {
    final isSelected = selected == value;
    return GestureDetector(
      onTap: onSelect != null ? () => onSelect!(value) : null,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        height: 72,
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? AppColors.primary : const Color(0xFFE8E8F0),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              color: isSelected ? Colors.white : AppColors.textPrimary,
              fontSize: 18,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Hints row ────────────────────────────────────────────────────────────────

class _HintRow extends StatefulWidget {
  const _HintRow({required this.hints});

  final List<String> hints;

  @override
  State<_HintRow> createState() => _HintRowState();
}

class _HintRowState extends State<_HintRow> {
  bool _showHints = false;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextButton.icon(
          onPressed: () => setState(() => _showHints = !_showHints),
          icon: Icon(_showHints ? Icons.lightbulb : Icons.lightbulb_outline),
          label: Text(_showHints ? 'Hide hints' : 'Show hint'),
          style: TextButton.styleFrom(
            foregroundColor: AppColors.accent,
            padding: EdgeInsets.zero,
          ),
        ),
        if (_showHints)
          ...widget.hints.map(
            (hint) => Padding(
              padding: const EdgeInsets.only(top: 6),
              child: Text(
                '• $hint',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ),
          ),
      ],
    );
  }
}

// ─── Result overlay ───────────────────────────────────────────────────────────

class _ResultOverlay extends StatelessWidget {
  const _ResultOverlay({
    required this.result,
    required this.problem,
    required this.onTryAgain,
  });

  final AttemptResult result;
  final Problem problem;
  final VoidCallback onTryAgain;

  @override
  Widget build(BuildContext context) {
    final correct = result.correct;

    return Positioned(
      left: 0,
      right: 0,
      bottom: 0,
      child: Container(
        decoration: BoxDecoration(
          color: correct
              ? AppColors.success.withAlpha(245)
              : AppColors.error.withAlpha(245),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          boxShadow: const [
            BoxShadow(
              color: Colors.black26,
              blurRadius: 16,
              offset: Offset(0, -4),
            ),
          ],
        ),
        padding: const EdgeInsets.fromLTRB(24, 24, 24, 40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  correct ? Icons.check_circle_rounded : Icons.cancel_rounded,
                  color: Colors.white,
                  size: 28,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    correct
                        ? 'Correct! +${result.coinsEarned} coins · +${result.xpEarned} XP'
                        : 'Incorrect — Correct answer: ${result.correctAnswer}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
            if (result.leveledUp) ...[
              const SizedBox(height: 8),
              const Row(
                children: [
                  Icon(Icons.emoji_events_rounded, color: Colors.white, size: 20),
                  SizedBox(width: 6),
                  Text(
                    'Level up!',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ],
            if (result.solution.isNotEmpty) ...[
              const SizedBox(height: 12),
              const Text(
                'Solution',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                result.solution,
                style: const TextStyle(color: Colors.white, fontSize: 14),
              ),
            ],
            const SizedBox(height: 20),
            Row(
              children: [
                if (!correct)
                  Expanded(
                    child: OutlinedButton(
                      onPressed: onTryAgain,
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: Colors.white54),
                        minimumSize: const Size(0, 48),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text('Try Again'),
                    ),
                  ),
                if (!correct) const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => context.pop(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor:
                          correct ? AppColors.success : AppColors.error,
                      minimumSize: const Size(0, 48),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text('Next Problem'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
