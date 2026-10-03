import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimens.dart';
import '../../core/widgets/app_button.dart';
import '../main_navigation_shell.dart';

/// Screen 3: First Account Funding Prompt (Figma `first-funding-prompt 1` / `68:6904`)
class FirstFundingPromptScreen extends StatelessWidget {
  final String userName;
  final VoidCallback? onComplete;

  const FirstFundingPromptScreen({
    super.key,
    this.userName = 'Yakubu manage',
    this.onComplete,
  });

  void _navigateToDashboard(BuildContext context) {
    if (onComplete != null) {
      onComplete!();
    }
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (context) => const MainNavigationShell()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        automaticallyImplyLeading: false,
        centerTitle: true,
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.asset(
              'assets/images/02_otis_tux.png',
              height: 28,
              width: 28,
              errorBuilder: (_, _, _) => const Icon(
                Icons.pets,
                color: AppColors.accentTurquoise,
                size: 24,
              ),
            ),
            const SizedBox(width: AppDimens.space8),
            Text(
              'Lockbudget',
              style: GoogleFonts.sourceSans3(
                fontSize: 17.0,
                fontWeight: FontWeight.w800,
                color: AppColors.primaryTeal,
              ),
            ),
          ],
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppDimens.space24,
            vertical: AppDimens.space8,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: AppDimens.space12),

                      // Hero Header: Otis with Money Bowl + Headline
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Image.asset(
                            'assets/images/03_otis_money.png',
                            height: 90,
                            width: 90,
                            fit: BoxFit.contain,
                            errorBuilder: (_, _, _) => Container(
                              height: 80,
                              width: 80,
                              decoration: const BoxDecoration(
                                color: AppColors.pillBackground,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.savings,
                                color: AppColors.primaryTeal,
                                size: 36,
                              ),
                            ),
                          ),
                          const SizedBox(width: AppDimens.space16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Fund your account',
                                  style: GoogleFonts.sourceSans3(
                                    fontSize: 24.0,
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.primaryTeal,
                                    letterSpacing: -0.5,
                                  ),
                                ),
                                const SizedBox(height: AppDimens.space6),
                                Text(
                                  'Transfer to your LockBudget account to start your daily allowance.',
                                  style: GoogleFonts.sourceSans3(
                                    fontSize: 14.0,
                                    fontWeight: FontWeight.w400,
                                    color: AppColors.textSecondary,
                                    height: 1.4,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: AppDimens.space28),

                      // Transfer Account Card (Dark Teal Card #0E3039)
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(AppDimens.space20),
                        decoration: BoxDecoration(
                          color: AppColors.primaryTeal,
                          borderRadius: BorderRadius.circular(AppDimens.radiusSheet),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x1A0E3039),
                              offset: Offset(0, 8),
                              blurRadius: 16.0,
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'TRANSFER ACCOUNT',
                                  style: GoogleFonts.sourceSans3(
                                    fontSize: 11.5,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 0.8,
                                    color: const Color(0xFF8BA5AA),
                                  ),
                                ),
                                GestureDetector(
                                  onTap: () {
                                    Clipboard.setData(const ClipboardData(text: '0234567890'));
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                        content: Text('Account number copied to clipboard!'),
                                        duration: Duration(seconds: 2),
                                      ),
                                    );
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFF1F5F5),
                                      borderRadius: BorderRadius.circular(AppDimens.radiusFull),
                                    ),
                                    child: Text(
                                      'Copy',
                                      style: GoogleFonts.sourceSans3(
                                        fontSize: 13.0,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.primaryTeal,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),

                            const SizedBox(height: AppDimens.space12),

                            // Account Number
                            Text(
                              '0234 567 890',
                              style: GoogleFonts.sourceSans3(
                                fontSize: 28.0,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                                letterSpacing: 1.5,
                              ),
                            ),

                            const SizedBox(height: AppDimens.space16),
                            const Divider(color: Color(0xFF1D454F), thickness: 1.0),
                            const SizedBox(height: AppDimens.space12),

                            // Name & Bank Details Grid
                            Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Name',
                                        style: GoogleFonts.sourceSans3(
                                          fontSize: 12.0,
                                          color: const Color(0xFF8BA5AA),
                                        ),
                                      ),
                                      const SizedBox(height: AppDimens.space2),
                                      Text(
                                        userName,
                                        style: GoogleFonts.sourceSans3(
                                          fontSize: 14.0,
                                          fontWeight: FontWeight.w700,
                                          color: Colors.white,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Bank',
                                        style: GoogleFonts.sourceSans3(
                                          fontSize: 12.0,
                                          color: const Color(0xFF8BA5AA),
                                        ),
                                      ),
                                      const SizedBox(height: AppDimens.space2),
                                      Text(
                                        'Partner bank',
                                        style: GoogleFonts.sourceSans3(
                                          fontSize: 14.0,
                                          fontWeight: FontWeight.w700,
                                          color: Colors.white,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: AppDimens.space28),

                      // "What happens next" step guide
                      Text(
                        'What happens next',
                        style: GoogleFonts.sourceSans3(
                          fontSize: 16.0,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: AppDimens.space16),

                      _buildNextStep(
                        step: '1',
                        description: 'Send money from your banking app to the account above.',
                      ),
                      const SizedBox(height: AppDimens.space12),
                      _buildNextStep(
                        step: '2',
                        description: 'Come back here so we can check for confirmation.',
                      ),

                      const SizedBox(height: AppDimens.space24),
                    ],
                  ),
                ),
              ),

              // Action Buttons
              AppButton(
                label: 'I have made the transfer',
                onPressed: () => _navigateToDashboard(context),
                variant: AppButtonVariant.primary,
              ),
              const SizedBox(height: AppDimens.space12),
              AppButton(
                label: 'I will fund later',
                onPressed: () => _navigateToDashboard(context),
                variant: AppButtonVariant.secondary,
              ),
              const SizedBox(height: AppDimens.space8),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNextStep({required String step, required String description}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 24,
          height: 24,
          decoration: const BoxDecoration(
            color: AppColors.pillBackground,
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              step,
              style: GoogleFonts.sourceSans3(
                fontSize: 12.5,
                fontWeight: FontWeight.w700,
                color: AppColors.primaryTeal,
              ),
            ),
          ),
        ),
        const SizedBox(width: AppDimens.space12),
        Expanded(
          child: Text(
            description,
            style: GoogleFonts.sourceSans3(
              fontSize: 14.0,
              fontWeight: FontWeight.w400,
              color: AppColors.textSecondary,
              height: 1.35,
            ),
          ),
        ),
      ],
    );
  }
}
