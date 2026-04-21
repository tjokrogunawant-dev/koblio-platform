import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:koblio_mobile/providers/providers.dart';
import 'package:koblio_mobile/router/app_router.dart';
import 'package:koblio_mobile/services/api_client.dart';
import 'package:koblio_mobile/services/auth_interceptor.dart';

void main() {
  group('AppRouter', () {
    testWidgets('shows splash when auth status is unknown', (tester) async {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final router = container.read(routerProvider);

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: MaterialApp.router(routerConfig: router),
        ),
      );
      await tester.pump();

      expect(
        router.routerDelegate.currentConfiguration.uri.toString(),
        equals('/'),
      );
    });

    testWidgets('routerProvider creates GoRouter instance', (tester) async {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final router = container.read(routerProvider);
      expect(router, isA<GoRouter>());
    });

    testWidgets('routerProvider redirects unauthenticated to login',
        (tester) async {
      final container = ProviderContainer(
        overrides: [
          authProvider.overrideWith(
            (ref) => _FakeAuthNotifier(
              const AuthState(status: AuthStatus.unauthenticated),
            ),
          ),
        ],
      );
      addTearDown(container.dispose);

      final router = container.read(routerProvider);

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: MaterialApp.router(routerConfig: router),
        ),
      );
      await tester.pumpAndSettle();

      expect(
        router.routerDelegate.currentConfiguration.uri.toString(),
        equals('/login'),
      );
    });

    testWidgets('routerProvider redirects authenticated to home',
        (tester) async {
      final container = ProviderContainer(
        overrides: [
          authProvider.overrideWith(
            (ref) => _FakeAuthNotifier(
              const AuthState(status: AuthStatus.authenticated),
            ),
          ),
        ],
      );
      addTearDown(container.dispose);

      final router = container.read(routerProvider);

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: MaterialApp.router(routerConfig: router),
        ),
      );
      await tester.pumpAndSettle();

      expect(
        router.routerDelegate.currentConfiguration.uri.toString(),
        equals('/home'),
      );
    });
  });
}

class _FakeAuthNotifier extends AuthNotifier {
  _FakeAuthNotifier(AuthState initialState)
      : super(
          authInterceptor: AuthInterceptor(),
          apiClient: ApiClient.create(authInterceptor: AuthInterceptor()),
        ) {
    state = initialState;
  }

  @override
  Future<void> checkAuthStatus() async {}
}
