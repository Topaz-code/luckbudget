import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../theme/app_colors.dart';
import '../theme/app_dimens.dart';
import '../theme/app_typography.dart';

class AllowanceHeroCard extends StatelessWidget {
  final double allowanceAmount;
  final double spentTodayAmount;
  final VoidCallback onSpendPressed;
  final String resetTimeString;

  const AllowanceHeroCard({
    super.key,
    required this.allowanceAmount,
    required this.spentTodayAmount,
    required this.onSpendPressed,
    this.resetTimeString = 'Resets at 00:00',
  });

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat.currency(symbol: '₦', decimalDigits: 2);
    final formattedAmount = currencyFormatter.format(allowanceAmount);

    return Container(
      width: double.infinity,
      padding: AppDimens.heroPadding,
      decoration: BoxDecoration(
        color: AppColors.primaryTeal,
        borderRadius: AppDimens.borderRadiusHero,
        boxShadow: AppDimens.heroShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "TODAY'S ALLOWANCE",
                style: AppTypography.captionSmallBold.copyWith(
                  color: AppColors.accentTurquoise,
                  letterSpacing: 0.5,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primaryTealLight,
                  borderRadius: AppDimens.borderRadiusPill,
                  border: Border.all(color: AppColors.primaryTealLight, width: 0.5),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.timer_outlined, size: 12, color: AppColors.accentTurquoise),
                    const SizedBox(width: 4),
                    Text(
                      resetTimeString,
                      style: AppTypography.microTag.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppDimens.space12),
          Text(
            formattedAmount,
            style: AppTypography.displayHero.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: AppDimens.space6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Spent today: ${currencyFormatter.format(spentTodayAmount)}',
                style: AppTypography.bodySmall.copyWith(
                  color: AppColors.pillBackground,
                ),
              ),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.accentTurquoise,
                  foregroundColor: AppColors.primaryTeal,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                onPressed: onSpendPressed,
                icon: const Icon(Icons.bolt, size: 16),
                label: Text(
                  'Spend',
                  style: AppTypography.bodySmallBold.copyWith(
                    color: AppColors.primaryTeal,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
