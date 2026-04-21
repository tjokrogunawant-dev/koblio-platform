import 'package:flutter_test/flutter_test.dart';
import 'package:koblio_mobile/config/env_config.dart';

void main() {
  group('EnvConfig', () {
    test('dev config has localhost API base URL', () {
      expect(EnvConfig.dev.apiBaseUrl, contains('localhost'));
    });

    test('prod config has production API base URL', () {
      expect(EnvConfig.prod.apiBaseUrl, contains('api.koblio.com'));
    });

    test('staging config has staging API base URL', () {
      expect(EnvConfig.staging.apiBaseUrl, contains('staging'));
    });

    test('all environments have auth0 audience set', () {
      expect(EnvConfig.dev.auth0Audience, isNotEmpty);
      expect(EnvConfig.staging.auth0Audience, isNotEmpty);
      expect(EnvConfig.prod.auth0Audience, isNotEmpty);
    });

    test('current defaults to dev', () {
      expect(EnvConfig.current.apiBaseUrl, equals(EnvConfig.dev.apiBaseUrl));
    });
  });
}
