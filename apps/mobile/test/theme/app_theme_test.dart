import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:koblio_mobile/theme/app_theme.dart';

void main() {
  group('AppColors', () {
    test('primary color is defined', () {
      expect(AppColors.primary, isNotNull);
      expect(AppColors.primary, isA<Color>());
    });

    test('background is light', () {
      expect(AppColors.background.computeLuminance(), greaterThan(0.5));
    });

    test('surface is white', () {
      expect(AppColors.surface, equals(const Color(0xFFFFFFFF)));
    });
  });

  group('AppTheme', () {
    test('light theme uses Material 3', () {
      final theme = AppTheme.light;
      expect(theme.useMaterial3, isTrue);
    });

    test('light theme has correct scaffold background', () {
      final theme = AppTheme.light;
      expect(theme.scaffoldBackgroundColor, equals(AppColors.background));
    });

    test('elevated button has rounded corners', () {
      final theme = AppTheme.light;
      final buttonTheme = theme.elevatedButtonTheme.style!;
      final shape = buttonTheme.shape!.resolve({}) as RoundedRectangleBorder;
      expect(
        shape.borderRadius,
        equals(BorderRadius.circular(16)),
      );
    });

    test('card theme has rounded corners', () {
      final theme = AppTheme.light;
      final cardShape = theme.cardTheme.shape as RoundedRectangleBorder;
      expect(
        cardShape.borderRadius,
        equals(BorderRadius.circular(20)),
      );
    });

    test('card theme has zero elevation', () {
      final theme = AppTheme.light;
      expect(theme.cardTheme.elevation, equals(0));
    });

    test('input decoration has rounded borders', () {
      final theme = AppTheme.light;
      final inputBorder =
          theme.inputDecorationTheme.border as OutlineInputBorder;
      expect(
        inputBorder.borderRadius,
        equals(BorderRadius.circular(16)),
      );
    });
  });
}
