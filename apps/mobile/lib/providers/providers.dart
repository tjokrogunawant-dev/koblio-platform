import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:koblio_mobile/services/api_client.dart';
import 'package:koblio_mobile/services/auth_interceptor.dart';

enum AuthStatus { unknown, authenticated, unauthenticated }

class AuthState {
  const AuthState({
    this.status = AuthStatus.unknown,
    this.userId,
    this.displayName,
    this.roles = const [],
  });

  final AuthStatus status;
  final String? userId;
  final String? displayName;
  final List<String> roles;

  AuthState copyWith({
    AuthStatus? status,
    String? userId,
    String? displayName,
    List<String>? roles,
  }) {
    return AuthState(
      status: status ?? this.status,
      userId: userId ?? this.userId,
      displayName: displayName ?? this.displayName,
      roles: roles ?? this.roles,
    );
  }

  bool get isStudent => roles.contains('student');
  bool get isParent => roles.contains('parent');
  bool get isTeacher => roles.contains('teacher');
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

  Future<void> checkAuthStatus() async {
    final token = await _authInterceptor.getAccessToken();
    if (token == null) {
      state = state.copyWith(status: AuthStatus.unauthenticated);
      return;
    }

    try {
      final response = await _apiClient.get<Map<String, dynamic>>('/auth/me');
      final data = response.data!;
      state = AuthState(
        status: AuthStatus.authenticated,
        userId: data['userId'] as String?,
        displayName: data['displayName'] as String?,
        roles: List<String>.from(data['roles'] as List? ?? []),
      );
    } on Exception {
      state = state.copyWith(status: AuthStatus.unauthenticated);
    }
  }

  Future<void> login({
    required String username,
    required String password,
  }) async {
    final response = await _apiClient.post<Map<String, dynamic>>(
      '/auth/login',
      data: {'username': username, 'password': password},
    );
    final data = response.data!;
    await _authInterceptor.saveTokens(
      accessToken: data['accessToken'] as String,
      refreshToken: data['refreshToken'] as String?,
    );
    await checkAuthStatus();
  }

  Future<void> loginWithClassCode({required String classCode}) async {
    final response = await _apiClient.post<Map<String, dynamic>>(
      '/auth/login/class-code',
      data: {'classCode': classCode},
    );
    final data = response.data!;
    await _authInterceptor.saveTokens(
      accessToken: data['accessToken'] as String,
      refreshToken: data['refreshToken'] as String?,
    );
    await checkAuthStatus();
  }

  Future<void> logout() async {
    await _authInterceptor.clearTokens();
    state = const AuthState(status: AuthStatus.unauthenticated);
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
