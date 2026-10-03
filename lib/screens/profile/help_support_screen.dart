import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class HelpSupportScreen extends StatelessWidget {
  const HelpSupportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Help & Support', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'How can we assist you?',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
            ),
            const SizedBox(height: 6),
            const Text(
              'Reach 24/7 dedicated LockBudget support or view dispute status.',
              style: TextStyle(color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 24),

            // Live Chat Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppTheme.primaryTeal,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.12),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.chat_bubble_outline, color: Colors.white),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text(
                          'Live Agent Chat',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Typical response time: 2 mins',
                          style: TextStyle(fontSize: 13, color: Color(0xFFC0D5D8)),
                        ),
                      ],
                    ),
                  ),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.accentTurquoise,
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      minimumSize: Size.zero,
                    ),
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Starting live support session...')),
                      );
                    },
                    child: const Text('Chat Now', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            const Text(
              'Frequently Asked Questions',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppTheme.textPrimary),
            ),
            const SizedBox(height: 12),

            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.cardBorder),
              ),
              child: Column(
                children: [
                  _faqItem('How is my daily allowance calculated?', 'Daily allowance is computed automatically by subtracting your fixed expenses from your monthly income and dividing the remainder across 30 days.'),
                  const Divider(height: 1),
                  _faqItem('Can I unlock my Year Save early?', 'Year Save locks funds for 365 days. Emergency early unlocks require a 48-hour cooldown and guarantor confirmation to prevent impulsive spending.'),
                  const Divider(height: 1),
                  _faqItem('What happens when I make an offline release?', 'LockBudget queues your release locally. When your connection is restored, it reconciles with the server without double deductions.'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _faqItem(String question, String answer) {
    return ExpansionTile(
      title: Text(question, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 16, right: 16, bottom: 16),
          child: Text(answer, style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary, height: 1.4)),
        ),
      ],
    );
  }
}
