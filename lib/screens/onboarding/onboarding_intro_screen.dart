import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimens.dart';
import '../../core/widgets/app_button.dart';
import 'onboarding_budget_setup_screen.dart';

/// Screen 1: Onboarding Intro & User Identification (Figma `Group 4` / `38:187`)
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
          padding: const EdgeInsets.symmetric(
            horizontal: AppDimens.space24,
            vertical: AppDimens.space16,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Bar with LockBudget Logo & Login CTA
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Image.asset(
                        'assets/images/02_otis_tux.png',
                        height: 30,
                        width: 30,
                        errorBuilder: (_, _, _) => const Icon(
                          Icons.pets,
                          color: AppColors.accentTurquoise,
                          size: 26,
                        ),
                      ),
                      const SizedBox(width: AppDimens.space8),
                      Text(
                        'Lockbudget',
                        style: TextStyle(fontFamily: 'SourceSans3', 
                          fontSize: 18.0,
                          fontWeight: FontWeight.w800,
                          color: AppColors.primaryTeal,
                          letterSpacing: -0.3,
                        ),
                      ),
                    ],
                  ),
                  TextButton(
                    onPressed: widget.onLoginTap ?? _handleContinue,
                    child: Text(
                      'Login',
                      style: TextStyle(fontFamily: 'SourceSans3', 
                        fontSize: 15.0,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primaryTeal,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: AppDimens.space32),

              // Title & Subtitle
              Text(
                'Let’s get to know you!',
                style: TextStyle(fontFamily: 'SourceSans3', 
                  fontSize: 27.0,
                  fontWeight: FontWeight.w800,
                  color: AppColors.primaryTeal,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: AppDimens.space6),
              Text(
                'Introduce yourself.',
                style: TextStyle(fontFamily: 'SourceSans3', 
                  fontSize: 15.5,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textSecondary,
                ),
              ),

              const SizedBox(height: AppDimens.space32),

              // Surname & First Name row (Exact Figma 2-column layout)
              Row(
                children: [
                  Expanded(
                    child: _buildInputField(
                      label: 'Surname',
                      controller: _surnameController,
                    ),
                  ),
                  const SizedBox(width: AppDimens.space12),
                  Expanded(
                    child: _buildInputField(
                      label: 'First name',
                      controller: _firstNameController,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: AppDimens.space16),

              // Email field
              _buildInputField(
                label: 'Email',
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
              ),

              const SizedBox(height: AppDimens.space24),

              // "or" Divider
              Row(
                children: [
                  const Expanded(child: Divider(color: AppColors.borderLight, thickness: 1.0)),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: AppDimens.space12),
                    child: Text(
                      'or',
                      style: TextStyle(fontFamily: 'SourceSans3', 
                        fontSize: 13.0,
                        fontWeight: FontWeight.w500,
                        color: AppColors.textMuted,
                      ),
                    ),
                  ),
                  const Expanded(child: Divider(color: AppColors.borderLight, thickness: 1.0)),
                ],
              ),

              const SizedBox(height: AppDimens.space24),

              // Continue with Google Button
              SizedBox(
                width: double.infinity,
                height: AppDimens.buttonHeight,
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: AppDimens.space16),
                    side: const BorderSide(color: AppColors.borderLight, width: 1.2),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppDimens.radiusFull),
                    ),
                  ),
                  onPressed: _handleContinue,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 20,
                        height: 20,
                        decoration: const BoxDecoration(shape: BoxShape.circle),
                        child: const Center(
                          child: Text(
                            'G',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF4285F4),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: AppDimens.space10),
                      Text(
                        'Continue with Google',
                        style: TextStyle(fontFamily: 'SourceSans3', 
                          fontSize: 15.0,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: AppDimens.space20),

              // Security notice
              Center(
                child: Text(
                  'We’ll never share or sell your data. · Bank-level security.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontFamily: 'SourceSans3', 
                    fontSize: 12.0,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textMuted,
                  ),
                ),
              ),

              const SizedBox(height: AppDimens.space32),

              // Continue CTA Button
              AppButton(
                label: 'Continue',
                onPressed: _handleContinue,
                variant: AppButtonVariant.primary,
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
      padding: const EdgeInsets.symmetric(
        horizontal: AppDimens.space16,
        vertical: AppDimens.space10,
      ),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F5),
        borderRadius: BorderRadius.circular(AppDimens.radiusButton),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(fontFamily: 'SourceSans3', 
              fontSize: 12.0,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: AppDimens.space2),
          TextField(
            controller: controller,
            keyboardType: keyboardType,
            style: TextStyle(fontFamily: 'SourceSans3', 
              fontSize: 15.0,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
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
