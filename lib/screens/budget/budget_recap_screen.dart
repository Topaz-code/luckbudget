import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../state/app_state.dart';
import '../../widgets/otis_avatar.dart';

class BudgetRecapScreen extends StatelessWidget {
  final AppState appState;

  const BudgetRecapScreen({super.key, required this.appState});

  @override
  Widget build(BuildContext context) {
    const fixedTotal = 43000.0;
    final income = appState.monthlyIncome;
    final dailyAllowance = ((income - fixedTotal) / 30).clamp(0.0, double.infinity);

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text(
          'October Budget Recap',
          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero card with Otis Grow pose
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppTheme.primaryTeal,
                borderRadius: BorderRadius.circular(24),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'DAILY ALLOWANCE RESULT',
                          style: TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.6,
                            color: Color(0xFF8BA5AA),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          '₦${dailyAllowance.toStringAsFixed(0)} / day',
                          style: const TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Calculated across 30 days after deducting fixed expenses.',
                          style: TextStyle(
                            fontSize: 12.5,
                            color: Color(0xFFC0D5D8),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  const OtisAvatar(
                    pose: OtisPose.tux,
                    height: 80,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),
            const Text(
              'Plan Breakdown',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 12),

            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.cardBorder),
              ),
              child: Column(
                children: [
                  _row('Monthly Expected Income', '₦${income.toStringAsFixed(0)}'),
                  const Divider(height: 24),
                  _row('Fixed Commitments Total', '₦${fixedTotal.toStringAsFixed(0)}'),
                  const Divider(height: 24),
                  _row('Spendable Remainder', '₦${(income - fixedTotal).toStringAsFixed(0)}', isBold: true),
                  const Divider(height: 24),
                  _row('Target Savings Rate', '15% (Recommended)'),
                ],
              ),
            ),

            const SizedBox(height: 32),

            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.accentTurquoise,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                onPressed: () => Navigator.pop(context),
                child: const Text(
                  'Accept Plan',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _row(String label, String value, {bool isBold = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 14, color: AppTheme.textSecondary)),
        Text(
          value,
          style: TextStyle(
            fontSize: 15,
            fontWeight: isBold ? FontWeight.w800 : FontWeight.w600,
            color: isBold ? AppTheme.primaryTeal : AppTheme.textPrimary,
          ),
        ),
      ],
    );
  }
}
