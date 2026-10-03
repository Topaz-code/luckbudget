import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../state/app_state.dart';
import '../../widgets/otis_avatar.dart';
import 'budget_recap_screen.dart';

class BudgetScreen extends StatefulWidget {
  final AppState appState;

  const BudgetScreen({super.key, required this.appState});

  @override
  State<BudgetScreen> createState() => _BudgetScreenState();
}

class _BudgetScreenState extends State<BudgetScreen> {
  late TextEditingController _incomeController;
  final List<double> _presetPills = [50000, 150000, 300000];

  final List<Map<String, dynamic>> _fixedExpenses = [
    {'title': 'Food', 'amount': 32000.0, 'icon': Icons.restaurant_outlined},
    {'title': 'Transportation', 'amount': 15000.0, 'icon': Icons.directions_bus_outlined},
    {'title': 'Rent', 'amount': 40000.0, 'icon': Icons.home_outlined},
    {'title': 'Utilities / Internet', 'amount': 10000.0, 'icon': Icons.wifi},
  ];

  @override
  void initState() {
    super.initState();
    _incomeController = TextEditingController(
      text: widget.appState.monthlyIncome.toInt().toString(),
    );
  }

  @override
  void dispose() {
    _incomeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = widget.appState;
    final totalFixed = _fixedExpenses.fold(0.0, (sum, item) => sum + (item['amount'] as double));

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(left: 20, right: 20, top: 12, bottom: 40),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Budget',
              style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w800,
                color: AppTheme.textPrimary,
              ),
            ),
            const Text(
              'October plan',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: AppTheme.textSecondary,
              ),
            ),
            const SizedBox(height: 16),

            // Hero Banner with Otis writing in notepad
            Container(
              width: double.infinity,
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
                      children: const [
                        Text(
                          'MONTHLY BUDGET',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.8,
                            color: Color(0xFF8BA5AA),
                          ),
                        ),
                        SizedBox(height: 6),
                        Text(
                          "Edit this month's plan.",
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                          ),
                        ),
                        SizedBox(height: 6),
                        Text(
                          'Update your income and categories. Daily Allowance follows the plan.',
                          style: TextStyle(
                            fontSize: 12.5,
                            color: Color(0xFFC0D5D8),
                            height: 1.35,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Otis Writing in Book Mascot
                  const OtisAvatar(
                    pose: OtisPose.book,
                    height: 105,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Current Month Chip Card
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.cardBorder),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Flexible(
                    child: Text(
                      'Current month',
                      style: TextStyle(fontSize: 13, color: AppTheme.textSecondary),
                    ),
                  ),
                  Flexible(
                    child: Text(
                      'October 2026 • Auto',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.primaryTeal,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Income Section
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: const [
                Text(
                  'Income',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.textPrimary,
                  ),
                ),
                Text(
                  'Total',
                  style: TextStyle(fontSize: 13, color: AppTheme.textMuted),
                ),
              ],
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
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Monthly income',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.background,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: TextField(
                      controller: _incomeController,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.primaryTeal,
                      ),
                      decoration: const InputDecoration(
                        prefixText: '₦ ',
                        border: InputBorder.none,
                      ),
                      onChanged: (val) {
                        final parsed = double.tryParse(val);
                        if (parsed != null) {
                          state.setMonthlyIncome(parsed);
                        }
                      },
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Quick preset pills
                  Wrap(
                    spacing: 8,
                    children: _presetPills.map((val) {
                      final isSelected = state.monthlyIncome == val;
                      return ChoiceChip(
                        label: Text('₦${val.toInt()}'),
                        selected: isSelected,
                        selectedColor: AppTheme.accentTurquoiseLight,
                        backgroundColor: Colors.white,
                        side: BorderSide(
                          color: isSelected ? AppTheme.accentTurquoise : AppTheme.cardBorder,
                        ),
                        labelStyle: TextStyle(
                          color: isSelected ? AppTheme.primaryTeal : AppTheme.textSecondary,
                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                        ),
                        onSelected: (selected) {
                          if (selected) {
                            setState(() {
                              _incomeController.text = val.toInt().toString();
                              state.setMonthlyIncome(val);
                            });
                          }
                        },
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Fixed Expenses Section
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Flexible(
                  child: Text(
                    'Fixed expenses',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                ),
                Flexible(
                  child: Text(
                    'Total · ₦${totalFixed.toInt()}',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            Material(
              color: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: const BorderSide(color: AppTheme.cardBorder),
              ),
              child: ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _fixedExpenses.length,
                separatorBuilder: (_, _) => const Divider(height: 1, indent: 16, endIndent: 16),
                itemBuilder: (context, idx) {
                  final exp = _fixedExpenses[idx];
                  return ListTile(
                    leading: Icon(exp['icon'] as IconData, color: AppTheme.primaryTeal),
                    title: Text(
                      exp['title'] as String,
                      style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w600),
                    ),
                    trailing: Text(
                      '₦${(exp['amount'] as double).toInt()}',
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppTheme.primaryTeal),
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 28),

            // Bottom Buttons: View Recap & Save Budget
            Row(
              children: [
                Expanded(
                  child: SizedBox(
                    height: 50,
                    child: OutlinedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => BudgetRecapScreen(appState: state),
                          ),
                        );
                      },
                      child: const Text('View recap'),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: SizedBox(
                    height: 50,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: AppTheme.accentTurquoise),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Budget saved! Daily allowance updated.'),
                            backgroundColor: AppTheme.primaryTeal,
                          ),
                        );
                      },
                      child: const Text('Save budget', style: TextStyle(color: Colors.white)),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
