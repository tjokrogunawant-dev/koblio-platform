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

  /// Redirect URI registered in the Auth0 dashboard for the mobile app.
  /// Must match the intent-filter scheme in AndroidManifest.xml.
  static const auth0RedirectUri = 'com.koblio.app://callback';

  /// Post-logout redirect URI (same scheme).
  static const auth0PostLogoutRedirectUri = 'com.koblio.app://callback';

  /// 10.0.2.2 resolves to the host machine's localhost from the Android emulator.
  static const dev = EnvConfig(
    apiBaseUrl: 'http://10.0.2.2:3001/api',
    auth0Domain: String.fromEnvironment(
      'AUTH0_DOMAIN',
      defaultValue: 'YOUR_TENANT.us.auth0.com',
    ),
    auth0ClientId: String.fromEnvironment(
      'AUTH0_MOBILE_CLIENT_ID',
      defaultValue: 'YOUR_MOBILE_CLIENT_ID',
    ),
    auth0Audience: 'https://api.koblio.com',
  );

  static const staging = EnvConfig(
    apiBaseUrl: 'https://staging-api.koblio.com/api',
    auth0Domain: String.fromEnvironment(
      'AUTH0_DOMAIN',
      defaultValue: 'YOUR_TENANT.us.auth0.com',
    ),
    auth0ClientId: String.fromEnvironment(
      'AUTH0_MOBILE_CLIENT_ID',
      defaultValue: 'YOUR_MOBILE_CLIENT_ID',
    ),
    auth0Audience: 'https://api.koblio.com',
  );

  static const prod = EnvConfig(
    apiBaseUrl: 'https://api.koblio.com/api',
    auth0Domain: String.fromEnvironment(
      'AUTH0_DOMAIN',
      defaultValue: 'YOUR_TENANT.us.auth0.com',
    ),
    auth0ClientId: String.fromEnvironment(
      'AUTH0_MOBILE_CLIENT_ID',
      defaultValue: 'YOUR_MOBILE_CLIENT_ID',
    ),
    auth0Audience: 'https://api.koblio.com',
  );

  static EnvConfig current = dev;
}
