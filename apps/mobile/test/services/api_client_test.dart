import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:koblio_mobile/config/env_config.dart';
import 'package:koblio_mobile/services/api_client.dart';
import 'package:koblio_mobile/services/auth_interceptor.dart';

void main() {
  group('ApiClient', () {
    test('create sets base URL from config', () {
      final client = ApiClient.create(
        config: EnvConfig.dev,
        authInterceptor: AuthInterceptor(),
      );
      expect(client.dio.options.baseUrl, equals(EnvConfig.dev.apiBaseUrl));
    });

    test('create sets connect timeout to 10 seconds', () {
      final client = ApiClient.create(
        authInterceptor: AuthInterceptor(),
      );
      expect(
        client.dio.options.connectTimeout,
        equals(const Duration(seconds: 10)),
      );
    });

    test('create sets receive timeout to 30 seconds', () {
      final client = ApiClient.create(
        authInterceptor: AuthInterceptor(),
      );
      expect(
        client.dio.options.receiveTimeout,
        equals(const Duration(seconds: 30)),
      );
    });

    test('create sets JSON content type headers', () {
      final client = ApiClient.create(
        authInterceptor: AuthInterceptor(),
      );
      expect(
        client.dio.options.headers['Content-Type'],
        equals('application/json'),
      );
      expect(
        client.dio.options.headers['Accept'],
        equals('application/json'),
      );
    });

    test('create adds auth interceptor', () {
      final interceptor = AuthInterceptor();
      final client = ApiClient.create(authInterceptor: interceptor);
      expect(
        client.dio.interceptors.whereType<AuthInterceptor>().length,
        equals(1),
      );
    });

    test('create adds log interceptor', () {
      final client = ApiClient.create(
        authInterceptor: AuthInterceptor(),
      );
      expect(
        client.dio.interceptors.whereType<LogInterceptor>().length,
        equals(1),
      );
    });

    test('uses staging config when specified', () {
      final client = ApiClient.create(
        config: EnvConfig.staging,
        authInterceptor: AuthInterceptor(),
      );
      expect(client.dio.options.baseUrl, equals(EnvConfig.staging.apiBaseUrl));
    });
  });
}
