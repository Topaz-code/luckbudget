import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../theme/app_colors.dart';
import '../theme/app_dimens.dart';
import '../theme/app_typography.dart';

class QuickSpendCategoryTile extends StatelessWidget {
  final String title;
  final double remainingAmount;
  final IconData icon;
  final VoidCallback onTap;

  const QuickSpendCategoryTile({
    super.key,
    required this.title,
    required this.remainingAmount,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat.currency(symbol: '₦', decimalDigits: 0);

    return Material(
      color: AppColors.cardSurface,
      borderRadius: AppDimens.borderRadiusCard,
      child: InkWell(
        onTap: onTap,
        borderRadius: AppDimens.borderRadiusCard,
        child: Container(
          padding: const EdgeInsets.all(AppDimens.space12),
          decoration: BoxDecoration(
            borderRadius: AppDimens.borderRadiusCard,
            border: Border.all(color: AppColors.borderLight, width: 1.0),
            boxShadow: AppDimens.cardShadow,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: const BoxDecoration(
                      color: AppColors.pillBackground,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(icon, size: 20, color: AppColors.primaryTeal),
                  ),
                  const Icon(Icons.arrow_forward_ios, size: 12, color: AppColors.textMuted),
                ],
              ),
              const SizedBox(height: AppDimens.space12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppTypography.bodySmallBold.copyWith(
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: AppDimens.space2),
                  Text(
                    '${currencyFormatter.format(remainingAmount)} left',
                    style: AppTypography.captionSmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
