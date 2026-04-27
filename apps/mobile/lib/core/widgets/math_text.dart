import 'package:flutter/material.dart';
import 'package:flutter_math_fork/flutter_math_fork.dart';

/// A widget that renders a string which may contain inline LaTeX expressions
/// delimited by `$...$` (e.g. `Solve $\frac{1}{2} + \frac{1}{4}$`).
///
/// Segments between `$` delimiters are rendered with [Math.tex]; plain-text
/// segments are rendered with [Text]. All segments are laid out horizontally
/// using a [Wrap] so they reflow correctly on narrow screens.
///
/// If the [text] contains no `$` characters the widget falls back to a plain
/// [Text] for performance.
class MathText extends StatelessWidget {
  const MathText({super.key, required this.text, this.style});

  final String text;
  final TextStyle? style;

  @override
  Widget build(BuildContext context) {
    if (text.isEmpty) {
      return const SizedBox.shrink();
    }

    // Fast path: no LaTeX delimiters present.
    if (!text.contains(r'$')) {
      return Text(text, style: style);
    }

    final parts = text.split(r'$');
    final children = <Widget>[];

    for (var i = 0; i < parts.length; i++) {
      final segment = parts[i];
      if (segment.isEmpty) continue;

      if (i.isOdd) {
        // LaTeX expression — strip delimiters (already stripped by split).
        children.add(
          Math.tex(
            segment,
            textStyle: style,
            onErrorFallback: (FlutterError error) {
              return Text(
                segment,
                style: const TextStyle(
                  color: Colors.red,
                  fontSize: 12,
                ),
              );
            },
          ),
        );
      } else {
        // Plain text segment.
        children.add(Text(segment, style: style));
      }
    }

    if (children.isEmpty) {
      return const SizedBox.shrink();
    }

    if (children.length == 1) {
      return children.first;
    }

    return Wrap(
      crossAxisAlignment: WrapCrossAlignment.center,
      children: children,
    );
  }
}
