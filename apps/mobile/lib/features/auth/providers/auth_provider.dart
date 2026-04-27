/// Auth state and providers for the auth feature.
///
/// The canonical implementation lives in `providers/providers.dart` using
/// manual [StateNotifierProvider] for broad compatibility. This barrel
/// re-exports all auth symbols so feature-scoped code can import from a
/// single location.
///
/// Migration note: When the codebase moves fully to Riverpod codegen
/// (post-MVP), the [AuthNotifier] implementation will be moved here and
/// annotated with @riverpod.
library;

export 'package:koblio_mobile/providers/providers.dart'
    show
        AuthNotifier,
        AuthState,
        AuthStatus,
        authProvider,
        authInterceptorProvider,
        apiClientProvider;
