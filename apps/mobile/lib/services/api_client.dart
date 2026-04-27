import 'package:dio/dio.dart';
import 'package:koblio_mobile/config/env_config.dart';
import 'package:koblio_mobile/services/auth_interceptor.dart';

class ApiClient {
  ApiClient({
    required this.dio,
    required this.authInterceptor,
  });

  factory ApiClient.create({
    EnvConfig? config,
    AuthInterceptor? authInterceptor,
  }) {
    final env = config ?? EnvConfig.current;
    final interceptor = authInterceptor ?? AuthInterceptor();

    final dio = Dio(
      BaseOptions(
        baseUrl: env.apiBaseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    dio.interceptors.addAll([
      interceptor,
      LogInterceptor(
        requestBody: true,
        responseBody: true,
        logPrint: (_) {},
      ),
    ]);

    return ApiClient(dio: dio, authInterceptor: interceptor);
  }

  final Dio dio;
  final AuthInterceptor authInterceptor;

  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) {
    return dio.get<T>(path, queryParameters: queryParameters);
  }

  Future<Response<T>> post<T>(
    String path, {
    Object? data,
  }) {
    return dio.post<T>(path, data: data);
  }

  Future<Response<T>> patch<T>(
    String path, {
    Object? data,
  }) {
    return dio.patch<T>(path, data: data);
  }

  Future<Response<T>> delete<T>(String path) {
    return dio.delete<T>(path);
  }

  // ─── Student convenience methods ────────────────────────────────────────────

  Future<Response<Map<String, dynamic>>> getProblems(int grade) {
    return get<Map<String, dynamic>>(
      '/content/problems',
      queryParameters: {'grade': grade},
    );
  }

  Future<Response<Map<String, dynamic>>> getDailyChallenge(int grade) {
    return get<Map<String, dynamic>>('/gamification/daily-challenge/$grade');
  }

  Future<Response<Map<String, dynamic>>> submitAnswer({
    required String problemId,
    required String answer,
    required int timeSpentMs,
    bool hintUsed = false,
  }) {
    return post<Map<String, dynamic>>(
      '/attempts',
      data: {
        'problemId': problemId,
        'answer': answer,
        'timeSpentMs': timeSpentMs,
        'hintUsed': hintUsed,
      },
    );
  }

  Future<Response<Map<String, dynamic>>> getStudentStats() {
    return get<Map<String, dynamic>>('/gamification/me');
  }

  Future<Response<List<dynamic>>> getMyBadges() {
    return get<List<dynamic>>('/badges/me');
  }

  // ─── Parent convenience methods ──────────────────────────────────────────────

  /// Returns the list of children linked to the authenticated parent.
  /// GET /parent/children → List<dynamic>
  Future<List<dynamic>> getMyChildren() async {
    final response = await get<List<dynamic>>('/parent/children');
    return response.data ?? [];
  }

  /// Returns the progress snapshot for a specific child.
  /// GET /parent/children/:childId/progress → Map<String, dynamic>
  Future<Map<String, dynamic>> getChildProgress(String childId) async {
    final response =
        await get<Map<String, dynamic>>('/parent/children/$childId/progress');
    return response.data ?? {};
  }
}
