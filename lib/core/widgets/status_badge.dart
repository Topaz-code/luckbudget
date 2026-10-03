import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_dimens.dart';
import '../theme/app_typography.dart';

enum StatusBadgeType {
  done,
  pending,
  failed,
  syncDelayed,
}

class StatusBadge extends StatelessWidget {
  final StatusBadgeType type;
  final String? customLabel;

  const StatusBadge({
    super.key,
    required this.type,
    this.customLabel,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    String label;
    IconData? icon;

    switch (type) {
      case StatusBadgeType.done:
        bg = AppColors.successGreenLight;
        fg = AppColors.successGreen;
        label = customLabel ?? 'DONE';
        icon = Icons.check_circle_outline;
        break;
      case StatusBadgeType.pending:
        bg = AppColors.warningGoldLight;
        fg = AppColors.warningGoldDark;
        label = customLabel ?? 'PENDING';
        icon = Icons.schedule;
        break;
      case StatusBadgeType.failed:
        bg = AppColors.dangerRedLight;
        fg = AppColors.dangerRed;
        label = customLabel ?? 'FAILED';
        icon = Icons.error_outline;
        break;
      case StatusBadgeType.syncDelayed:
        bg = AppColors.syncDelayedLight;
        fg = AppColors.syncDelayedGray;
        label = customLabel ?? 'SYNC DELAYED';
        icon = Icons.sync_problem;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppDimens.space10,
        vertical: AppDimens.space4,
      ),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: AppDimens.borderRadiusPill,
        border: Border.all(
          color: fg.withValues(alpha: 0.25),
          width: 0.8,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: fg),
          const SizedBox(width: AppDimens.space4),
          Text(
            label,
            style: AppTypography.microTag.copyWith(
              color: fg,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}
