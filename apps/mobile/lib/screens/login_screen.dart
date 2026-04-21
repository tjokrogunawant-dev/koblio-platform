import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:koblio_mobile/providers/providers.dart';
import 'package:koblio_mobile/theme/app_theme.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _classCodeController = TextEditingController();
  bool _isLoading = false;
  bool _isClassCodeMode = false;
  String? _errorMessage;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    _classCodeController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      if (_isClassCodeMode) {
        await ref.read(authProvider.notifier).loginWithClassCode(
              classCode: _classCodeController.text.trim(),
            );
      } else {
        await ref.read(authProvider.notifier).login(
              username: _usernameController.text.trim(),
              password: _passwordController.text,
            );
      }
    } on Exception catch (e) {
      setState(() {
        _errorMessage = 'Login failed. Please check your credentials.';
      });
      debugPrint('Login error: $e');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const SizedBox(height: 48),
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Center(
                  child: Text(
                    'K',
                    style: TextStyle(
                      fontSize: 44,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Welcome to Koblio!',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 8),
              Text(
                'Let\'s start learning math!',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 40),
              _buildModeToggle(),
              const SizedBox(height: 24),
              Form(
                key: _formKey,
                child: _isClassCodeMode
                    ? _buildClassCodeForm()
                    : _buildUsernameForm(),
              ),
              if (_errorMessage != null) ...[
                const SizedBox(height: 16),
                Text(
                  _errorMessage!,
                  style: const TextStyle(
                    color: AppColors.error,
                    fontSize: 14,
                  ),
                ),
              ],
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _handleLogin,
                  child: _isLoading
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : const Text('Log In'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildModeToggle() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
      ),
      padding: const EdgeInsets.all(4),
      child: Row(
        children: [
          Expanded(
            child: _ToggleButton(
              label: 'Username',
              isActive: !_isClassCodeMode,
              onTap: () => setState(() => _isClassCodeMode = false),
            ),
          ),
          Expanded(
            child: _ToggleButton(
              label: 'Class Code',
              isActive: _isClassCodeMode,
              onTap: () => setState(() => _isClassCodeMode = true),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUsernameForm() {
    return Column(
      children: [
        TextFormField(
          controller: _usernameController,
          decoration: const InputDecoration(
            hintText: 'Username',
            prefixIcon: Icon(Icons.person_outline),
          ),
          validator: (value) {
            if (value == null || value.trim().isEmpty) {
              return 'Please enter your username';
            }
            return null;
          },
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _passwordController,
          obscureText: true,
          decoration: const InputDecoration(
            hintText: 'Password',
            prefixIcon: Icon(Icons.lock_outline),
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Please enter your password';
            }
            return null;
          },
        ),
      ],
    );
  }

  Widget _buildClassCodeForm() {
    return TextFormField(
      controller: _classCodeController,
      textCapitalization: TextCapitalization.characters,
      style: const TextStyle(
        fontSize: 24,
        fontWeight: FontWeight.w700,
        letterSpacing: 8,
      ),
      textAlign: TextAlign.center,
      decoration: const InputDecoration(
        hintText: 'ABCD12',
        prefixIcon: Icon(Icons.class_outlined),
      ),
      validator: (value) {
        if (value == null || value.trim().isEmpty) {
          return 'Please enter your class code';
        }
        return null;
      },
    );
  }
}

class _ToggleButton extends StatelessWidget {
  const _ToggleButton({
    required this.label,
    required this.isActive,
    required this.onTap,
  });

  final String label;
  final bool isActive;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isActive ? AppColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              color: isActive ? Colors.white : AppColors.textSecondary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }
}
