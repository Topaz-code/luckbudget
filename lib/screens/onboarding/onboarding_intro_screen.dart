import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import 'onboarding_budget_setup_screen.dart';

class OnboardingIntroScreen extends StatefulWidget {
  final VoidCallback? onLoginTap;
  final VoidCallback? onComplete;

  const OnboardingIntroScreen({
    super.key,
    this.onLoginTap,
    this.onComplete,
  });

  @override
  State<OnboardingIntroScreen> createState() => _OnboardingIntroScreenState();
}

class _OnboardingIntroScreenState extends State<OnboardingIntroScreen> {
  final TextEditingController _surnameController = TextEditingController(text: 'Yakubu');
  final TextEditingController _firstNameController = TextEditingController(text: 'Manage');
  final TextEditingController _emailController = TextEditingController(text: 'you@example.com');

  @override
  void dispose() {
    _surnameController.dispose();
    _firstNameController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  void _handleContinue() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => OnboardingBudgetSetupScreen(
          userName: '${_firstNameController.text.trim()} ${_surnameController.text.trim()}',
          onComplete: widget.onComplete,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Bar with Logo & Login CTA
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Image.asset(
                        'assets/images/02_otis_tux.png',
                        height: 32,
                        width: 32,
                        errorBuilder: (_, _, _) => const Icon(Icons.pets, color: AppTheme.accentTurquoise, size: 28),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'Lockbudget',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.primaryTeal,
                          letterSpacing: -0.3,
                        ),
                      ),
                    ],
                  ),
                  TextButton(
                    onPressed: widget.onLoginTap ?? _handleContinue,
                    child: const Text(
                      'Login',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.primaryTeal,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 36),

              // Title & Subtitle
              const Text(
                'Let’s get to know you!',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.primaryTeal,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Introduce yourself.',
                style: TextStyle(
                  fontSize: 16,
                  color: AppTheme.textSecondary,
                  fontWeight: FontWeight.w500,
                ),
              ),

              const SizedBox(height: 32),

              // Surname & First Name row
              Row(
                children: [
                  Expanded(
                    child: _buildInputField(
                      label: 'Surname',
                      controller: _surnameController,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: _buildInputField(
                      label: 'First name',
                      controller: _firstNameController,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Email field
              _buildInputField(
                label: 'Email',
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
              ),

              const SizedBox(height: 28),

              // "or" Divider
              Row(
                children: const [
                  Expanded(child: Divider(color: Color(0xFFE2E8F0), thickness: 1)),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 14),
                    child: Text(
                      'or',
                      style: TextStyle(fontSize: 13, color: AppTheme.textMuted, fontWeight: FontWeight.w500),
                    ),
                  ),
                  Expanded(child: Divider(color: Color(0xFFE2E8F0), thickness: 1)),
                ],
              ),

              const SizedBox(height: 24),

              // Google Auth Button
              SizedBox(
                width: double.infinity,
                height: 54,
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    side: const BorderSide(color: Color(0xFFE2E8F0), width: 1.2),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(28),
                    ),
                  ),
                  onPressed: _handleContinue,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 22,
                        height: 22,
                        decoration: const BoxDecoration(shape: BoxShape.circle),
                        child: const Center(
                          child: Text(
                            'G',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF4285F4),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      const Text(
                        'Continue with Google',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 20),

              // Security notice
              const Center(
                child: Text(
                  'We’ll never share or sell your data. · Bank-level security.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 12,
                    color: AppTheme.textMuted,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),

              const SizedBox(height: 32),

              // Continue CTA
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryTeal,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(28),
                    ),
                  ),
                  onPressed: _handleContinue,
                  child: const Text(
                    'Continue',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInputField({
    required String label,
    required TextEditingController controller,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F5),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppTheme.textSecondary,
            ),
          ),
          const SizedBox(height: 2),
          TextField(
            controller: controller,
            keyboardType: keyboardType,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: AppTheme.textPrimary,
            ),
            decoration: const InputDecoration(
              isDense: true,
              border: InputBorder.none,
              contentPadding: EdgeInsets.zero,
            ),
          ),
        ],
      ),
    );
  }
}
