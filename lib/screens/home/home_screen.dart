import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../state/app_state.dart';
import '../../models/budget_models.dart';
import '../quickspend/quickspend_flow.dart';
import 'top_up_sheet.dart';
import '../edge_cases/offline_banner.dart';
import '../activity/transaction_detail_sheet.dart';

class HomeScreen extends StatefulWidget {
  final AppState appState;
  final VoidCallback onViewAllActivity;

  const HomeScreen({
    super.key,
    required this.appState,
    required this.onViewAllActivity,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _selectedPeriod = 'Day';

  @override
  Widget build(BuildContext context) {
    final state = widget.appState;

    return SingleChildScrollView(
      padding: const EdgeInsets.only(bottom: 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Offline banner if toggled
          if (state.isOffline)
            OfflineBanner(
              onRetry: () {
                state.toggleOfflineSimulation();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Synced offline transactions with server!')),
                );
              },
            ),

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. TODAY'S ALLOWANCE HERO CARD
                _buildTodayAllowanceCard(context, state),

                const SizedBox(height: 16),

                // 2. TOTAL IN LOCKBUDGET CARD
                _buildTotalBalanceCard(context, state),

                const SizedBox(height: 24),

                // 3. QUICK SPEND TILES
                _buildQuickSpendSection(context, state),

                const SizedBox(height: 24),

                // 4. RECENT ACTIVITY
                _buildRecentActivitySection(context, state),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTodayAllowanceCard(BuildContext context, AppState state) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppTheme.primaryTeal,
        borderRadius: BorderRadius.circular(24),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF0E3039),
            Color(0xFF14434F),
          ],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "TODAY'S ALLOWANCE",
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.8,
              color: Color(0xFF8BA5AA),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '₦ ${state.dailyAllowance.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}',
            style: const TextStyle(
              fontSize: 38,
              fontWeight: FontWeight.w800,
              color: Colors.white,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'This is what you can spend freely today.',
            style: TextStyle(
              fontSize: 14,
              color: Color(0xFFC0D5D8),
            ),
          ),
          const SizedBox(height: 24),

          // Action Buttons: Spend & Top up
          Row(
            children: [
              // Spend button
              Expanded(
                child: SizedBox(
                  height: 48,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: AppTheme.primaryTeal,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => QuickSpendFlow(appState: state),
                        ),
                      );
                    },
                    child: const Text(
                      'Spend',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.primaryTeal,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),

              // Top up button
              Expanded(
                child: SizedBox(
                  height: 48,
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      backgroundColor: Colors.white.withValues(alpha: 0.12),
                      side: BorderSide(color: Colors.white.withValues(alpha: 0.2), width: 1.2),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    onPressed: () {
                      showModalBottomSheet(
                        context: context,
                        isScrollControlled: true,
                        backgroundColor: Colors.transparent,
                        builder: (context) => TopUpSheet(appState: state),
                      );
                    },
                    child: const Text(
                      'Top up',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTotalBalanceCard(BuildContext context, AppState state) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.cardBorder, width: 1.2),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Total in LockBudget',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: AppTheme.textSecondary,
                  ),
                ),
                const SizedBox(height: 4),
                FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.centerLeft,
                  child: Text(
                    '₦${state.totalBalance.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}',
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.primaryTeal,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Filter chips: Day | Week | Month
          Row(
            mainAxisSize: MainAxisSize.min,
            children: ['Day', 'Week', 'Month'].map((p) {
              final isSel = _selectedPeriod == p;
              return GestureDetector(
                onTap: () => setState(() => _selectedPeriod = p),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  margin: const EdgeInsets.only(left: 4),
                  decoration: BoxDecoration(
                    color: isSel ? AppTheme.accentTurquoiseLight : Colors.transparent,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    p,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: isSel ? FontWeight.w700 : FontWeight.w500,
                      color: isSel ? AppTheme.primaryTeal : AppTheme.textMuted,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickSpendSection(BuildContext context, AppState state) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: const [
            Flexible(
              child: Text(
                'Quick spend',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textPrimary,
                ),
              ),
            ),
            Flexible(
              child: Text(
                'From budget lines',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: AppTheme.textMuted,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),

        // 2x2 Grid of Categories
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.32,
          ),
          itemCount: state.categories.length,
          itemBuilder: (context, index) {
            final cat = state.categories[index];
            IconData iconData = Icons.restaurant_outlined;
            if (cat.id == 'airtime') iconData = Icons.bolt;
            if (cat.id == 'electricity') iconData = Icons.lightbulb_outline;
            if (cat.id == 'internet') iconData = Icons.wifi;

            return GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => QuickSpendFlow(
                      appState: state,
                      initialCategoryId: cat.id,
                    ),
                  ),
                );
              },
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppTheme.cardBorder, width: 1.2),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Icon(
                      iconData,
                      color: AppTheme.primaryTeal,
                      size: 22,
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          cat.title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '₦${cat.remainingAmount.toStringAsFixed(0)} left',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: AppTheme.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildRecentActivitySection(BuildContext context, AppState state) {
    final recent = state.transactions.take(3).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Flexible(
              child: Text(
                'Recent activity',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textPrimary,
                ),
              ),
            ),
            GestureDetector(
              onTap: widget.onViewAllActivity,
              child: const Text(
                'View all',
                style: TextStyle(
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
            side: const BorderSide(color: AppTheme.cardBorder, width: 1.2),
          ),
          child: ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: recent.length,
            separatorBuilder: (_, _) => const Divider(
              height: 1,
              indent: 16,
              endIndent: 16,
              color: AppTheme.dividerColor,
            ),
            itemBuilder: (context, index) {
              final tx = recent[index];
              final isIncome = tx.type == TransactionType.income;
              final sign = isIncome ? '+' : '-';
              final amtColor = isIncome ? AppTheme.successGreen : AppTheme.primaryTeal;

              return ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                title: Text(
                  tx.title,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.textPrimary,
                  ),
                ),
                subtitle: Text(
                  tx.subtitle,
                  style: const TextStyle(
                    fontSize: 12.5,
                    color: AppTheme.textSecondary,
                  ),
                ),
                trailing: Text(
                  '$sign₦${tx.amount.toStringAsFixed(0)}',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                    color: amtColor,
                  ),
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
    );
  }
}
