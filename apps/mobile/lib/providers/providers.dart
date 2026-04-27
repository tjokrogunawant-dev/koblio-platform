import 'package:flutter_riverpod/flutter_riverpod.dart';
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

  /// Parent / Teacher login — Auth0 PKCE flow via flutter_appauth.
  ///
  /// Auth0 credentials are environment-specific and are loaded from [EnvConfig].
  /// This stub logs the intent and surfaces a not-yet-configured message;
  /// the real implementation will be wired up in P3-T04 once Auth0 is provisioned.
  Future<void> loginWithAuth0({required String role}) async {
    // Auth0 PKCE integration is pending Auth0 tenant provisioning (P3-T04).
    // The full flow will use FlutterAppAuth.authorizeAndExchangeCode() with
    // the redirect URI registered in the Auth0 dashboard.
    throw UnimplementedError(
      'Auth0 PKCE login is not yet configured. '
      'Provision an Auth0 tenant and set EnvConfig auth0* fields to enable.',
    );
  }

  Future<void> logout() async {
    await _authInterceptor.clearTokens();
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
