import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../theme/app_colors.dart';
import '../theme/app_dimens.dart';
import '../theme/app_typography.dart';

class TotalBalanceCard extends StatelessWidget {
  final double totalBalance;
  final double totalSaved;
  final VoidCallback onTopUpPressed;

  const TotalBalanceCard({
    super.key,
    required this.totalBalance,
    required this.totalSaved,
    required this.onTopUpPressed,
  });

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat.currency(symbol: '₦', decimalDigits: 2);

    return Container(
      width: double.infinity,
      padding: AppDimens.cardPadding,
      decoration: BoxDecoration(
        color: AppColors.cardSurface,
        borderRadius: AppDimens.borderRadiusCard,
        border: Border.all(color: AppColors.borderLight, width: 1.0),
        boxShadow: AppDimens.cardShadow,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'TOTAL IN LOCKBUDGET',
                  style: AppTypography.captionSmallBold.copyWith(
                    color: AppColors.textSecondary,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: AppDimens.space6),
                Text(
                  currencyFormatter.format(totalBalance),
                  style: AppTypography.headlineLarge.copyWith(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: AppDimens.space4),
                Text(
                  'Total saved: ${currencyFormatter.format(totalSaved)}',
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.sageMuted,
                  ),
                ),
              ],
            ),
          ),
          OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.primaryTeal,
              side: const BorderSide(color: AppColors.primaryTeal, width: 1.2),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            onPressed: onTopUpPressed,
            icon: const Icon(Icons.add, size: 16),
            label: Text(
              'Top up',
              style: AppTypography.bodySmallBold.copyWith(
                color: AppColors.primaryTeal,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
