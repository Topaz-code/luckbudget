import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../theme/app_colors.dart';
import '../theme/app_dimens.dart';
import '../theme/app_typography.dart';

class GoalProgressCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final double currentAmount;
  final double targetAmount;
  final String unlockDate;
  final VoidCallback onTap;
  final VoidCallback? onTopUpTap;

  const GoalProgressCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.currentAmount,
    required this.targetAmount,
    required this.unlockDate,
    required this.onTap,
    this.onTopUpTap,
  });

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat.currency(symbol: '₦', decimalDigits: 0);
    final progress = targetAmount > 0 ? (currentAmount / targetAmount).clamp(0.0, 1.0) : 0.0;
    final percentage = (progress * 100).toInt();

    return Material(
      color: AppColors.cardSurface,
      borderRadius: AppDimens.borderRadiusCard,
      child: InkWell(
        onTap: onTap,
        borderRadius: AppDimens.borderRadiusCard,
        child: Container(
          padding: AppDimens.cardPadding,
          decoration: BoxDecoration(
            borderRadius: AppDimens.borderRadiusCard,
            border: Border.all(color: AppColors.borderLight, width: 1.0),
            boxShadow: AppDimens.cardShadow,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 38,
                        height: 38,
                        decoration: const BoxDecoration(
                          color: AppColors.pillBackground,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.lock_clock, size: 20, color: AppColors.primaryTeal),
                      ),
                      const SizedBox(width: AppDimens.space10),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            title,
                            style: AppTypography.bodyMediumBold.copyWith(
                              color: AppColors.textPrimary,
                            ),
                          ),
                          Text(
                            subtitle,
                            style: AppTypography.captionRegular.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.subtleContainer,
                      borderRadius: AppDimens.borderRadiusPill,
                    ),
                    child: Text(
                      'Unlocks $unlockDate',
                      style: AppTypography.microTag.copyWith(
                        color: AppColors.primaryTeal,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppDimens.space16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Text(
                    currencyFormatter.format(currentAmount),
                    style: AppTypography.titleMedium.copyWith(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  Text(
                    'of ${currencyFormatter.format(targetAmount)} ($percentage%)',
                    style: AppTypography.captionSmallBold.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppDimens.space8),
              ClipRRect(
                borderRadius: AppDimens.borderRadiusPill,
                child: LinearProgressIndicator(
                  value: progress,
                  minHeight: 8.0,
                  backgroundColor: AppColors.borderLight,
                  valueColor: const AlwaysStoppedAnimation<Color>(AppColors.accentTurquoise),
                ),
              ),
              if (onTopUpTap != null) ...[
                const SizedBox(height: AppDimens.space12),
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton.icon(
                    style: TextButton.styleFrom(
                      padding: EdgeInsets.zero,
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      foregroundColor: AppColors.accentTurquoiseDark,
                    ),
                    onPressed: onTopUpTap,
                    icon: const Icon(Icons.add_circle_outline, size: 16),
                    label: Text('Top up goal', style: AppTypography.captionSmallBold),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
