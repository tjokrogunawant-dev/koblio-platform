import 'package:flutter_appauth/flutter_appauth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:koblio_mobile/config/env_config.dart';
import 'package:koblio_mobile/services/api_client.dart';
import 'package:koblio_mobile/services/auth_interceptor.dart';

enum AuthStatus { unknown, authenticated, unauthenticated }

/// Canonical auth state shared across the app.
///
/// [token]  — raw JWT access token (null when unauthenticated).
/// [role]   — primary role string: 'STUDENT' | 'PARENT' | 'TEACHER' (null when unauthenticated).
/// [userId] — UUID of the authenticated user (null when unauthenticated).
class AuthState {
  const AuthState({
    this.status = AuthStatus.unknown,
    this.token,
    this.userId,
    this.displayName,
    this.role,
    this.isLoading = false,
  });

  final AuthStatus status;
  final String? token;
  final String? userId;
  final String? displayName;

  /// Primary role: 'STUDENT' | 'PARENT' | 'TEACHER'
  final String? role;

  final bool isLoading;

  AuthState copyWith({
    AuthStatus? status,
    String? token,
    String? userId,
    String? displayName,
    String? role,
    bool? isLoading,
  }) {
    return AuthState(
      status: status ?? this.status,
      token: token ?? this.token,
      userId: userId ?? this.userId,
      displayName: displayName ?? this.displayName,
      role: role ?? this.role,
      isLoading: isLoading ?? this.isLoading,
    );
  }

  bool get isStudent => role == 'STUDENT';
  bool get isParent => role == 'PARENT';
  bool get isTeacher => role == 'TEACHER';
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier({
    required AuthInterceptor authInterceptor,
    required ApiClient apiClient,
  })  : _authInterceptor = authInterceptor,
        _apiClient = apiClient,
        super(const AuthState());

  final AuthInterceptor _authInterceptor;
  final ApiClient _apiClient;

  /// Called on app startup to restore session from secure storage.
  Future<void> checkAuthStatus() async {
    final token = await _authInterceptor.getAccessToken();
    if (token == null) {
      state = state.copyWith(status: AuthStatus.unauthenticated);
      return;
    }

    try {
      final response = await _apiClient.get<Map<String, dynamic>>('/auth/me');
      final data = response.data!;
      final roles = List<String>.from(data['roles'] as List? ?? []);
      state = AuthState(
        status: AuthStatus.authenticated,
        token: token,
        userId: data['userId'] as String?,
        displayName: data['displayName'] as String?,
        role: _primaryRole(roles),
      );
    } on Exception {
      await _authInterceptor.clearTokens();
      state = state.copyWith(status: AuthStatus.unauthenticated);
    }
  }

  /// Student login — calls POST /api/auth/login/student (HS256 JWT, no email).
  Future<void> loginStudent({
    required String username,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true);
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/auth/login/student',
        data: {'username': username, 'password': password},
      );
      final data = response.data!;
      final accessToken = data['access_token'] as String;
      await _authInterceptor.saveTokens(
        accessToken: accessToken,
        refreshToken: data['refresh_token'] as String?,
      );
      await checkAuthStatus();
    } finally {
      if (mounted) state = state.copyWith(isLoading: false);
    }
  }

  /// Parent / Teacher login — Auth0 Authorization Code + PKCE flow.
  ///
  /// Opens the Auth0 universal login page in a secure browser session.
  /// On success, stores the access token via [AuthInterceptor] and updates
  /// state to authenticated.
  ///
  /// When [EnvConfig] credentials are still placeholder values the PKCE
  /// exchange will fail — the error propagates so the UI can show a SnackBar.
  Future<void> loginWithAuth0({required String role}) async {
    state = state.copyWith(isLoading: true);
    try {
      const appAuth = FlutterAppAuth();
      final result = await appAuth.authorizeAndExchangeCode(
        AuthorizationTokenRequest(
          EnvConfig.current.auth0ClientId,
          EnvConfig.auth0RedirectUri,
          issuer: 'https://${EnvConfig.current.auth0Domain}',
          scopes: ['openid', 'profile', 'email', 'offline_access'],
          additionalParameters: {
            // Pass the desired role as a login_hint so the Auth0 action can
            // pre-select the correct connection or apply role-based rules.
            'login_hint': role.toLowerCase(),
          },
        ),
      );

      if (result?.accessToken == null) {
        throw Exception('Auth0 returned no access token');
      }

      final accessToken = result!.accessToken!;
      final refreshToken = result.refreshToken;

      // Persist tokens through the shared AuthInterceptor so all Dio calls
      // automatically include the Authorization header.
      await _authInterceptor.saveTokens(
        accessToken: accessToken,
        refreshToken: refreshToken,
      );

      // Also persist the role so it survives cold restarts (read back in
      // checkAuthStatus via /auth/me; stored here as a fast-path cache).
      const storage = FlutterSecureStorage();
      await storage.write(key: 'auth_role', value: role);

      // Verify against the API and populate full state (userId, displayName).
      await checkAuthStatus();
    } catch (_) {
      state = state.copyWith(isLoading: false);
      rethrow;
    }
  }

  /// Clears all stored tokens and resets auth state to unauthenticated.
  Future<void> logout() async {
    const storage = FlutterSecureStorage();
    await _authInterceptor.clearTokens();
    await storage.delete(key: 'auth_role');
    await storage.delete(key: 'auth_user_id');
    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  /// Maps a list of role strings to the primary role constant.
  String? _primaryRole(List<String> roles) {
    if (roles.contains('STUDENT')) return 'STUDENT';
    if (roles.contains('TEACHER')) return 'TEACHER';
    if (roles.contains('PARENT')) return 'PARENT';
    if (roles.isNotEmpty) return roles.first.toUpperCase();
    return null;
  }
}

final authInterceptorProvider = Provider<AuthInterceptor>((ref) {
  return AuthInterceptor();
});

final apiClientProvider = Provider<ApiClient>((ref) {
  final interceptor = ref.watch(authInterceptorProvider);
  return ApiClient.create(authInterceptor: interceptor);
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    authInterceptor: ref.watch(authInterceptorProvider),
    apiClient: ref.watch(apiClientProvider),
  );
});
