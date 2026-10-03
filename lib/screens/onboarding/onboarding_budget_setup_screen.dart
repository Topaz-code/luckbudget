import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import 'first_funding_prompt_screen.dart';

class OnboardingBudgetSetupScreen extends StatefulWidget {
  final String userName;
  final VoidCallback? onComplete;

  const OnboardingBudgetSetupScreen({
    super.key,
    this.userName = 'Yakubu manage',
    this.onComplete,
  });

  @override
  State<OnboardingBudgetSetupScreen> createState() => _OnboardingBudgetSetupScreenState();
}

class _OnboardingBudgetSetupScreenState extends State<OnboardingBudgetSetupScreen> {
  double _monthlyIncome = 50000;
  final List<double> _incomeChips = [50000, 150000, 300000];

  final List<Map<String, dynamic>> _fixedExpenses = [
    {'title': 'Food', 'amount': 32000.0},
    {'title': 'Internet', 'amount': 2000.0},
    {'title': 'Transportation', 'amount': 4000.0},
    {'title': 'Netflix', 'amount': 0.0},
    {'title': 'Debt', 'amount': 5000.0},
  ];

  final List<Map<String, dynamic>> _variableExpenses = [
    {'title': 'Miscellaneous', 'amount': 0.0},
    {'title': 'Gift', 'amount': 0.0},
  ];

  double get _totalFixed => _fixedExpenses.fold(0.0, (sum, item) => sum + (item['amount'] as double));
  double get _totalVariable => _variableExpenses.fold(0.0, (sum, item) => sum + (item['amount'] as double));
  double get _totalExpenses => _totalFixed + _totalVariable;
  double get _remaining => _monthlyIncome - _totalExpenses;

  void _handleLockItIn() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => FirstFundingPromptScreen(
          userName: widget.userName,
          onComplete: widget.onComplete,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.menu, color: AppTheme.primaryTeal),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Your monthly budget',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: AppTheme.primaryTeal,
          ),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Headline
                    const Text(
                      'Fill this in, feel good',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.primaryTeal,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Pre-filled from the student plan. Tweak anything. Takes 30 seconds.',
                      style: TextStyle(
                        fontSize: 14.5,
                        color: AppTheme.textSecondary,
                        height: 1.4,
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Income Highlight Box
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F5),
                        borderRadius: BorderRadius.circular(18),
                      ),
                      child: Text(
                        '₦ ${_monthlyIncome.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}',
                        style: const TextStyle(
                          fontSize: 26,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.primaryTeal,
                        ),
                      ),
                    ),

                    const SizedBox(height: 12),

                    // Income Quick Chips
                    Row(
                      children: _incomeChips.map((val) {
                        final isSel = _monthlyIncome == val;
                        return Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _monthlyIncome = val),
                            child: Container(
                              margin: const EdgeInsets.symmetric(horizontal: 4),
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: isSel ? AppTheme.accentTurquoiseLight : Colors.white,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                  color: isSel ? AppTheme.accentTurquoise : const Color(0xFFE2E8F0),
                                  width: 1.2,
                                ),
                              ),
                              child: Center(
                                child: Text(
                                  '₦ ${val.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}',
                                  style: TextStyle(
                                    fontSize: 12.5,
                                    fontWeight: isSel ? FontWeight.w700 : FontWeight.w600,
                                    color: isSel ? AppTheme.primaryTeal : AppTheme.textPrimary,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),

                    const SizedBox(height: 28),

                    // Fixed Expenses Header
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Expanded(
                          child: Text(
                            'Fixed expenses',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                        ),
                        Text(
                          'Total · ₦ ${_totalFixed.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}',
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.textSecondary,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 10),

                    // Fixed Expenses Card
                    _buildExpenseGroupCard(_fixedExpenses),

                    const SizedBox(height: 24),

                    // Variable Expenses Header
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Expanded(
                          child: Text(
                            'Variable expenses',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                        ),
                        Text(
                          'Total · ₦ ${_totalVariable.toInt()}',
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.textSecondary,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 10),

                    // Variable Expenses Card
                    _buildExpenseGroupCard(_variableExpenses),

                    const SizedBox(height: 24),

                    // Totals Summary Card
                    Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Column(
                        children: [
                          _buildSummaryRow(
                            'Total income',
                            '₦ ${_monthlyIncome.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}',
                            isBold: true,
                          ),
                          const SizedBox(height: 10),
                          _buildSummaryRow(
                            'Total expenses',
                            '₦ ${_totalExpenses.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}',
                          ),
                          const SizedBox(height: 10),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: AppTheme.accentTurquoiseLight,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: _buildSummaryRow(
                              'Remaining',
                              '₦ ${_remaining.toInt()}',
                              isBold: true,
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),

            // Bottom CTA: Lock it in.
            Padding(
              padding: const EdgeInsets.all(20),
              child: SizedBox(
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
                  onPressed: _handleLockItIn,
                  child: const Text(
                    'Lock it in.',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildExpenseGroupCard(List<Map<String, dynamic>> items) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        children: items.map((item) {
          final isLast = items.indexOf(item) == items.length - 1;
          final amt = (item['amount'] as double).toInt();
          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      item['title'] as String,
                      style: const TextStyle(
                        fontSize: 14.5,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F5),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        amt.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},'),
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.primaryTeal,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              if (!isLast) const Divider(height: 1, indent: 16, endIndent: 16, color: Color(0xFFE2E8F0)),
            ],
          );
        }).toList(),
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isBold = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Text(
            label,
            style: TextStyle(
              fontSize: 14,
              fontWeight: isBold ? FontWeight.w700 : FontWeight.w500,
              color: AppTheme.primaryTeal,
            ),
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 15,
            fontWeight: isBold ? FontWeight.w800 : FontWeight.w600,
            color: AppTheme.primaryTeal,
          ),
        ),
      ],
    );
  }
}
