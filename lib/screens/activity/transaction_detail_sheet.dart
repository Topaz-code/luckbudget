import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../models/budget_models.dart';

class TransactionDetailSheet extends StatelessWidget {
  final TransactionItem transaction;

  const TransactionDetailSheet({super.key, required this.transaction});

  @override
  Widget build(BuildContext context) {
    final isIncome = transaction.type == TransactionType.income;
    final sign = isIncome ? '+' : '-';
    final amtColor = isIncome ? AppTheme.successGreen : AppTheme.primaryTeal;

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: AppTheme.cardBorder,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 20),

          // Status Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            decoration: BoxDecoration(
              color: AppTheme.accentTurquoiseLight,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: const [
                Icon(Icons.check_circle, size: 16, color: AppTheme.accentTurquoise),
                SizedBox(width: 6),
                Text(
                  'Successful',
                  style: TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.primaryTeal,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Amount
          Text(
            '$sign₦${transaction.amount.toStringAsFixed(0)}',
            style: TextStyle(
              fontSize: 34,
              fontWeight: FontWeight.w800,
              color: amtColor,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            transaction.title,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: AppTheme.textSecondary,
            ),
          ),
          const SizedBox(height: 24),

          // Detail rows
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.background,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.cardBorder),
            ),
            child: Column(
              children: [
                _buildRow('Transaction Type', isIncome ? 'Inflow' : 'Outflow'),
                const Divider(height: 20),
                _buildRow('Reference', transaction.reference ?? 'TX-990218'),
                const Divider(height: 20),
                _buildRow('Date & Time', 'Oct 2, 2026 • ${transaction.timeString}'),
                const Divider(height: 20),
                _buildRow('Category', transaction.category ?? 'General'),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Action Button
          SizedBox(
            width: double.infinity,
            height: 50,
            child: OutlinedButton.icon(
              icon: const Icon(Icons.download_rounded, size: 20),
              label: const Text('Download Receipt'),
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Receipt downloaded to device storage')),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 13.5,
            color: AppTheme.textSecondary,
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: AppTheme.textPrimary,
          ),
        ),
      ],
    );
  }
}
