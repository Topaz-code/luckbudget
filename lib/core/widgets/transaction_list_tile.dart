import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../theme/app_colors.dart';
import '../theme/app_dimens.dart';
import '../theme/app_typography.dart';
import 'status_badge.dart';

enum TransactionItemType {
  income,
  expense,
  save,
}

class TransactionListTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final double amount;
  final TransactionItemType type;
  final StatusBadgeType status;
  final IconData icon;
  final VoidCallback onTap;

  const TransactionListTile({
    super.key,
    required this.title,
    required this.subtitle,
    required this.amount,
    required this.type,
    required this.status,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat.currency(symbol: '₦', decimalDigits: 2);
    final isIncome = type == TransactionItemType.income;
    final prefix = isIncome ? '+' : '-';
    final amountColor = isIncome ? AppColors.successGreen : AppColors.textPrimary;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppDimens.space12,
            vertical: AppDimens.space10,
          ),
          child: Row(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: isIncome ? AppColors.successGreenLight : AppColors.pillBackground,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  icon,
                  size: 20,
                  color: isIncome ? AppColors.successGreen : AppColors.primaryTeal,
                ),
              ),
              const SizedBox(width: AppDimens.space12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: AppTypography.bodyMediumBold.copyWith(
                        color: AppColors.textPrimary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: AppTypography.captionRegular.copyWith(
                        color: AppColors.textSecondary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: AppDimens.space12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '$prefix${currencyFormatter.format(amount)}',
                    style: AppTypography.bodyMediumBold.copyWith(
                      color: amountColor,
                    ),
                  ),
                  const SizedBox(height: 4),
                  StatusBadge(type: status),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
