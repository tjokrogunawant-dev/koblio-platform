import 'package:flutter_test/flutter_test.dart';
import 'package:koblio_mobile/providers/providers.dart';

void main() {
  group('AuthState', () {
    test('initial status is unknown', () {
      const state = AuthState();
      expect(state.status, equals(AuthStatus.unknown));
    });

    test('initial roles are empty', () {
      const state = AuthState();
      expect(state.roles, isEmpty);
    });

    test('copyWith preserves unchanged fields', () {
      const state = AuthState(
        status: AuthStatus.authenticated,
        userId: 'user-1',
        displayName: 'Test Student',
        roles: ['student'],
      );
      final updated = state.copyWith(displayName: 'New Name');
      expect(updated.status, equals(AuthStatus.authenticated));
      expect(updated.userId, equals('user-1'));
      expect(updated.displayName, equals('New Name'));
      expect(updated.roles, equals(['student']));
    });

    test('copyWith updates specified fields', () {
      const state = AuthState(status: AuthStatus.unknown);
      final updated = state.copyWith(
        status: AuthStatus.authenticated,
        userId: 'user-2',
      );
      expect(updated.status, equals(AuthStatus.authenticated));
      expect(updated.userId, equals('user-2'));
    });

    test('isStudent returns true when roles contain student', () {
      const state = AuthState(roles: ['student']);
      expect(state.isStudent, isTrue);
      expect(state.isTeacher, isFalse);
      expect(state.isParent, isFalse);
    });

    test('isTeacher returns true when roles contain teacher', () {
      const state = AuthState(roles: ['teacher']);
      expect(state.isTeacher, isTrue);
      expect(state.isStudent, isFalse);
    });

    test('isParent returns true when roles contain parent', () {
      const state = AuthState(roles: ['parent']);
      expect(state.isParent, isTrue);
      expect(state.isStudent, isFalse);
    });
  });

  group('AuthStatus', () {
    test('has three possible values', () {
      expect(AuthStatus.values.length, equals(3));
      expect(AuthStatus.values, contains(AuthStatus.unknown));
      expect(AuthStatus.values, contains(AuthStatus.authenticated));
      expect(AuthStatus.values, contains(AuthStatus.unauthenticated));
    });
  });
}
