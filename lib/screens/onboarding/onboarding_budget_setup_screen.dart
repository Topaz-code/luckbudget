import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimens.dart';
import '../../core/widgets/app_button.dart';
import 'first_funding_prompt_screen.dart';

/// Screen 2: Monthly Budget Setup & Allocation (Figma `Group 3` / `32:4`)
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
  final _currencyFormat = NumberFormat('#,##0', 'en_US');
  double _monthlyIncome = 50000;
  final List<double> _incomeChips = [50000, 150000, 300000];

  final List<Map<String, dynamic>> _fixedExpenses = [
    {'title': 'Food', 'amount': 32000.0, 'icon': Icons.restaurant_outlined},
    {'title': 'Internet', 'amount': 2000.0, 'icon': Icons.wifi_outlined},
    {'title': 'Transportation', 'amount': 4000.0, 'icon': Icons.directions_bus_outlined},
    {'title': 'Netflix', 'amount': 0.0, 'icon': Icons.movie_outlined},
    {'title': 'Debt', 'amount': 5000.0, 'icon': Icons.credit_card_outlined},
  ];

  final List<Map<String, dynamic>> _variableExpenses = [
    {'title': 'Miscellaneous', 'amount': 0.0, 'icon': Icons.category_outlined},
    {'title': 'Gift', 'amount': 0.0, 'icon': Icons.card_giftcard_outlined},
  ];

  double get _totalFixed => _fixedExpenses.fold(0.0, (sum, item) => sum + (item['amount'] as double));
  double get _totalVariable => _variableExpenses.fold(0.0, (sum, item) => sum + (item['amount'] as double));
  double get _totalExpenses => _totalFixed + _totalVariable;
  double get _remaining => (_monthlyIncome - _totalExpenses).clamp(0.0, double.infinity);

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
          icon: const Icon(Icons.arrow_back_ios_new, size: 20, color: AppColors.primaryTeal),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Your monthly budget',
          style: GoogleFonts.sourceSans3(
            fontSize: 16.0,
            fontWeight: FontWeight.w700,
            color: AppColors.primaryTeal,
          ),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppDimens.space24,
                  vertical: AppDimens.space8,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Headline & Subtitle
                    Text(
                      'Fill this in, feel good',
                      style: GoogleFonts.sourceSans3(
                        fontSize: 27.0,
                        fontWeight: FontWeight.w800,
                        color: AppColors.primaryTeal,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: AppDimens.space6),
                    Text(
                      'Pre-filled from the student plan. Tweak anything. Takes 30 seconds.',
                      style: GoogleFonts.sourceSans3(
                        fontSize: 14.5,
                        fontWeight: FontWeight.w400,
                        color: AppColors.textSecondary,
                        height: 1.4,
                      ),
                    ),

                    const SizedBox(height: AppDimens.space24),

                    // Income Highlight Box (Figma `#F1F5F5` container)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppDimens.space20,
                        vertical: AppDimens.space16,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.background,
                        borderRadius: BorderRadius.circular(AppDimens.radiusCard),
                        border: Border.all(color: AppColors.borderLight, width: 1.0),
                      ),
                      child: Text(
                        '₦ ${_currencyFormat.format(_monthlyIncome)}',
                        style: GoogleFonts.sourceSans3(
                          fontSize: 26.0,
                          fontWeight: FontWeight.w800,
                          color: AppColors.primaryTeal,
                        ),
                      ),
                    ),

                    const SizedBox(height: AppDimens.space12),

                    // Income Quick Preset Chips (₦50,000, ₦150,000, ₦300,000)
                    Row(
                      children: _incomeChips.map((val) {
                        final isSel = _monthlyIncome == val;
                        return Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _monthlyIncome = val),
                            child: Container(
                              margin: const EdgeInsets.symmetric(horizontal: AppDimens.space4),
                              padding: const EdgeInsets.symmetric(vertical: AppDimens.space10),
                              decoration: BoxDecoration(
                                color: isSel ? AppColors.pillBackground : Colors.white,
                                borderRadius: BorderRadius.circular(AppDimens.radiusFull),
                                border: Border.all(
                                  color: isSel ? AppColors.accentTurquoise : AppColors.borderLight,
                                  width: 1.2,
                                ),
                              ),
                              child: Center(
                                child: Text(
                                  '₦ ${_currencyFormat.format(val)}',
                                  style: GoogleFonts.sourceSans3(
                                    fontSize: 12.5,
                                    fontWeight: isSel ? FontWeight.w700 : FontWeight.w600,
                                    color: isSel ? AppColors.primaryTeal : AppColors.textPrimary,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),

                    const SizedBox(height: AppDimens.space28),

                    // Fixed Expenses Header
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            'Fixed expenses',
                            style: GoogleFonts.sourceSans3(
                              fontSize: 15.0,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ),
                        Text(
                          'Total · ₦ ${_currencyFormat.format(_totalFixed)}',
                          style: GoogleFonts.sourceSans3(
                            fontSize: 13.0,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: AppDimens.space10),

                    // Fixed Expenses Card
                    _buildExpenseGroupCard(_fixedExpenses),

                    const SizedBox(height: AppDimens.space24),

                    // Variable Expenses Header
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            'Variable expenses',
                            style: GoogleFonts.sourceSans3(
                              fontSize: 15.0,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ),
                        Text(
                          'Total · ₦ ${_currencyFormat.format(_totalVariable)}',
                          style: GoogleFonts.sourceSans3(
                            fontSize: 13.0,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: AppDimens.space10),

                    // Variable Expenses Card
                    _buildExpenseGroupCard(_variableExpenses),

                    const SizedBox(height: AppDimens.space20),

                    // Summary Card: Total Income / Total Expenses / Remaining
                    Container(
                      padding: const EdgeInsets.all(AppDimens.space16),
                      decoration: BoxDecoration(
                        color: AppColors.background,
                        borderRadius: BorderRadius.circular(AppDimens.radiusCard),
                        border: Border.all(color: AppColors.borderLight, width: 1.0),
                      ),
                      child: Column(
                        children: [
                          _buildSummaryRow('Total income', _monthlyIncome, isBold: false),
                          const SizedBox(height: AppDimens.space8),
                          _buildSummaryRow('Total expenses', _totalExpenses, isBold: false),
                          const Divider(height: AppDimens.space20, color: AppColors.borderLight),
                          _buildSummaryRow(
                            'Remaining',
                            _remaining,
                            isBold: true,
                            highlightColor: _remaining > 0 ? AppColors.successGreen : AppColors.primaryTeal,
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: AppDimens.space24),
                  ],
                ),
              ),
            ),

            // Bottom Fixed Action: "Lock it in."
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppDimens.space24,
                vertical: AppDimens.space16,
              ),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: AppColors.borderLight, width: 1.0)),
              ),
              child: AppButton(
                label: 'Lock it in.',
                onPressed: _handleLockItIn,
                variant: AppButtonVariant.primary,
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
        borderRadius: BorderRadius.circular(AppDimens.radiusCard),
        border: Border.all(color: AppColors.borderLight, width: 1.2),
      ),
      child: Column(
        children: List.generate(items.length, (idx) {
          final item = items[idx];
          final isLast = idx == items.length - 1;
          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppDimens.space16,
                  vertical: AppDimens.space12,
                ),
                child: Row(
                  children: [
                    Icon(item['icon'] as IconData, size: 18, color: AppColors.accentTurquoise),
                    const SizedBox(width: AppDimens.space12),
                    Expanded(
                      child: Text(
                        item['title'] as String,
                        style: GoogleFonts.sourceSans3(
                          fontSize: 14.5,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ),
                    Text(
                      '₦ ${_currencyFormat.format(item['amount'])}',
                      style: GoogleFonts.sourceSans3(
                        fontSize: 14.5,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ],
                ),
              ),
              if (!isLast) const Divider(height: 1, color: AppColors.borderLight, indent: 46),
            ],
          );
        }),
      ),
    );
  }

  Widget _buildSummaryRow(String label, double amount, {bool isBold = false, Color? highlightColor}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: GoogleFonts.sourceSans3(
            fontSize: 14.0,
            fontWeight: isBold ? FontWeight.w700 : FontWeight.w500,
            color: isBold ? AppColors.textPrimary : AppColors.textSecondary,
          ),
        ),
        Text(
          '₦ ${_currencyFormat.format(amount)}',
          style: GoogleFonts.sourceSans3(
            fontSize: 14.5,
            fontWeight: isBold ? FontWeight.w800 : FontWeight.w600,
            color: highlightColor ?? AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}
