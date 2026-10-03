import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../theme/app_theme.dart';
import '../main_navigation_shell.dart';

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
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.asset(
              'assets/images/02_otis_tux.png',
              height: 28,
              width: 28,
              errorBuilder: (_, _, _) => const Icon(Icons.pets, color: AppTheme.accentTurquoise, size: 24),
            ),
            const SizedBox(width: 8),
            const Text(
              'Lockbudget',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w800,
                color: AppTheme.primaryTeal,
              ),
            ),
          ],
        ),
      ),

      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 12),

              // Hero: Otis with Money Bowl + Headline
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Image.asset(
                    'assets/images/03_otis_money.png',
                    height: 100,
                    width: 100,
                    fit: BoxFit.contain,
                    errorBuilder: (_, _, _) => Container(
                      height: 80,
                      width: 80,
                      decoration: const BoxDecoration(
                        color: AppTheme.accentTurquoiseLight,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.savings, color: AppTheme.primaryTeal, size: 36),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text(
                          'Fund your account',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.primaryTeal,
                            letterSpacing: -0.5,
                          ),
                        ),
                        SizedBox(height: 6),
                        Text(
                          'Transfer to your LockBudget account to start your daily allowance.',
                          style: TextStyle(
                            fontSize: 14,
                            color: AppTheme.textSecondary,
                            height: 1.4,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 28),

              // Transfer Account Card (Dark Teal Card)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  color: AppTheme.primaryTeal,
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'TRANSFER ACCOUNT',
                          style: TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.8,
                            color: Color(0xFF8BA5AA),
                          ),
                        ),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: AppTheme.primaryTeal,
                            elevation: 0,
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          ),
                          onPressed: () {
                            Clipboard.setData(const ClipboardData(text: '0234567890'));
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Account number copied!'),
                                duration: Duration(seconds: 2),
                              ),
                            );
                          },
                          child: const Text('Copy', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    const Text(
                      '0234 567 890',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 14),
                    const Divider(color: Color(0xFF1F4A54), height: 1),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Name', style: TextStyle(fontSize: 11, color: Color(0xFF8BA5AA))),
                            const SizedBox(height: 2),
                            Text(
                              userName,
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white),
                            ),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text('Bank', style: TextStyle(fontSize: 11, color: Color(0xFF8BA5AA))),
                            SizedBox(height: 2),
                            Text(
                              'Wema Bank',
                              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 28),

              // "What happens next"
              const Text(
                'What happens next',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.primaryTeal,
                ),
              ),
              const SizedBox(height: 14),

              _buildStepItem(
                number: '1',
                text: 'Send money from your bank app to the account above.',
              ),
              const SizedBox(height: 12),
              _buildStepItem(
                number: '2',
                text: 'Come back here so we can check for confirmation.',
              ),

              const Spacer(),

              // Primary CTA: I have made the transfer
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
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Checking transfer confirmation... Success!'),
                        backgroundColor: AppTheme.primaryTeal,
                      ),
                    );
                    _navigateToDashboard(context);
                  },
                  child: const Text(
                    'I have made the transfer',
                    style: TextStyle(
                      fontSize: 15.5,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 12),

              // Secondary CTA: I will fund later
              SizedBox(
                width: double.infinity,
                height: 54,
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFFE2E8F0), width: 1.2),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(28),
                    ),
                  ),
                  onPressed: () => _navigateToDashboard(context),
                  child: const Text(
                    'I will fund later',
                    style: TextStyle(
                      fontSize: 15.5,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStepItem({required String number, required String text}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 24,
          height: 24,
          decoration: BoxDecoration(
            color: const Color(0xFFE2F4F2),
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              number,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w800,
                color: AppTheme.primaryTeal,
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(
              fontSize: 14,
              color: AppTheme.textSecondary,
              height: 1.35,
            ),
          ),
        ),
      ],
    );
  }
}
