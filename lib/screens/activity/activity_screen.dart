import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../state/app_state.dart';
import '../../models/budget_models.dart';
import 'transaction_detail_sheet.dart';

class ActivityScreen extends StatefulWidget {
  final AppState appState;

  const ActivityScreen({super.key, required this.appState});

  @override
  State<ActivityScreen> createState() => _ActivityScreenState();
}

class _ActivityScreenState extends State<ActivityScreen> {
  String _selectedFilter = 'All';

  @override
  Widget build(BuildContext context) {
    final state = widget.appState;

    // Filter transactions
    List<TransactionItem> filtered = state.transactions;
    if (_selectedFilter == 'Releases') {
      filtered = filtered.where((t) => t.type == TransactionType.expense).toList();
    } else if (_selectedFilter == 'Saves') {
      filtered = filtered.where((t) => t.type == TransactionType.save).toList();
    } else if (_selectedFilter == 'Pending') {
      filtered = filtered.where((t) => t.status != TransactionStatus.done).toList();
    }

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(left: 20, right: 20, top: 12, bottom: 40),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Activity',
              style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w800,
                color: AppTheme.textPrimary,
              ),
            ),
            const Text(
              'Your LockBudget money trail',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: AppTheme.textSecondary,
              ),
            ),
            const SizedBox(height: 16),

            // Inflow vs Expenses Badges
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.cardBorder),
              ),
              child: Row(
                children: [
                  // Income badge
                  Expanded(
                    child: Row(
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: AppTheme.accentTurquoiseLight,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.arrow_downward,
                            color: AppTheme.primaryTeal,
                            size: 20,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '₦ ${state.totalIncomeToday.toInt()}',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                                color: AppTheme.primaryTeal,
                              ),
                            ),
                            const Text(
                              'Income',
                              style: TextStyle(fontSize: 12.5, color: AppTheme.textSecondary),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  Container(
                    height: 36,
                    width: 1.2,
                    color: AppTheme.dividerColor,
                  ),

                  // Expense badge
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(left: 12),
                      child: Row(
                        children: [
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: const Color(0xFFFEE2E2),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.arrow_upward,
                              color: Color(0xFFDC2626),
                              size: 20,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '₦ ${state.totalExpensesToday.toInt()}',
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w800,
                                  color: AppTheme.primaryTeal,
                                ),
                              ),
                              const Text(
                                'Expenses',
                                style: TextStyle(fontSize: 12.5, color: AppTheme.textSecondary),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Money Trail & Filter Tabs
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: const [
                Text(
                  'Money trail',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.textPrimary,
                  ),
                ),
                Text(
                  'Latest first',
                  style: TextStyle(fontSize: 13, color: AppTheme.textMuted),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Filter Tabs: All, Releases, Saves, Pending
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: ['All', 'Releases', 'Saves', 'Pending'].map((filter) {
                  final isSelected = _selectedFilter == filter;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedFilter = filter),
                    child: Container(
                      margin: const EdgeInsets.only(right: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected ? AppTheme.accentTurquoise : Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected ? AppTheme.accentTurquoise : AppTheme.cardBorder,
                        ),
                      ),
                      child: Text(
                        filter,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                          color: isSelected ? Colors.white : AppTheme.textSecondary,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: 20),

            // Transaction List
            Material(
              color: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: const BorderSide(color: AppTheme.cardBorder),
              ),
              child: filtered.isEmpty
                  ? const Padding(
                      padding: EdgeInsets.all(32),
                      child: Center(
                        child: Text(
                          'No transactions found in this filter',
                          style: TextStyle(color: AppTheme.textSecondary),
                        ),
                      ),
                    )
                  : ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: filtered.length,
                      separatorBuilder: (_, _) => const Divider(height: 1, indent: 16, endIndent: 16),
                      itemBuilder: (context, index) {
                        final tx = filtered[index];
                        final isIncome = tx.type == TransactionType.income;
                        final sign = isIncome ? '+' : '-';
                        final amtColor = isIncome ? AppTheme.successGreen : AppTheme.primaryTeal;

                        return ListTile(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 6),
                          title: Text(
                            tx.title,
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                          ),
                          subtitle: Text(
                            tx.subtitle,
                            style: const TextStyle(fontSize: 12.5, color: AppTheme.textSecondary),
                          ),
                          trailing: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                '$sign₦${tx.amount.toInt()}',
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w800,
                                  color: amtColor,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                tx.status == TransactionStatus.syncDelayed ? 'Queued' : 'Done',
                                style: TextStyle(
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.w600,
                                  color: tx.status == TransactionStatus.syncDelayed
                                      ? AppTheme.warningOrange
                                      : AppTheme.accentTurquoise,
                                ),
                              ),
                            ],
                          ),
                          onTap: () {
                            showModalBottomSheet(
                              context: context,
                              isScrollControlled: true,
                              backgroundColor: Colors.transparent,
                              builder: (context) => TransactionDetailSheet(transaction: tx),
                            );
                          },
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
