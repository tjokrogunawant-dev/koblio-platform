class EnvConfig {
  const EnvConfig({
    required this.apiBaseUrl,
    required this.auth0Domain,
    required this.auth0ClientId,
    required this.auth0Audience,
  });

  final String apiBaseUrl;
  final String auth0Domain;
  final String auth0ClientId;
  final String auth0Audience;

  /// 10.0.2.2 resolves to the host machine's localhost from the Android emulator.
  static const dev = EnvConfig(
    apiBaseUrl: 'http://10.0.2.2:3001/api',
    auth0Domain: 'YOUR_TENANT.auth0.com',
    auth0ClientId: 'YOUR_CLIENT_ID',
    auth0Audience: 'https://api.koblio.com',
  );

  static const staging = EnvConfig(
    apiBaseUrl: 'https://staging-api.koblio.com/api',
    auth0Domain: 'YOUR_TENANT.auth0.com',
    auth0ClientId: 'YOUR_CLIENT_ID',
    auth0Audience: 'https://api.koblio.com',
  );

  static const prod = EnvConfig(
    apiBaseUrl: 'https://api.koblio.com/api',
    auth0Domain: 'YOUR_TENANT.auth0.com',
    auth0ClientId: 'YOUR_CLIENT_ID',
    auth0Audience: 'https://api.koblio.com',
  );

  static EnvConfig current = dev;
}
