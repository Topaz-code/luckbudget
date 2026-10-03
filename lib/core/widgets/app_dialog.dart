import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_dimens.dart';
import '../theme/app_typography.dart';
import 'app_button.dart';

class AppDialog extends StatelessWidget {
  final String title;
  final String message;
  final String primaryButtonLabel;
  final VoidCallback onPrimaryPressed;
  final String? secondaryButtonLabel;
  final VoidCallback? onSecondaryPressed;
  final bool isDestructive;
  final Widget? icon;

  const AppDialog({
    super.key,
    required this.title,
    required this.message,
    required this.primaryButtonLabel,
    required this.onPrimaryPressed,
    this.secondaryButtonLabel,
    this.onSecondaryPressed,
    this.isDestructive = false,
    this.icon,
  });

  static Future<bool?> showConfirmation({
    required BuildContext context,
    required String title,
    required String message,
    String confirmLabel = 'Confirm',
    String cancelLabel = 'Cancel',
    bool isDestructive = false,
    Widget? icon,
  }) {
    return showDialog<bool>(
      context: context,
      builder: (ctx) => AppDialog(
        title: title,
        message: message,
        primaryButtonLabel: confirmLabel,
        isDestructive: isDestructive,
        icon: icon,
        onPrimaryPressed: () => Navigator.of(ctx).pop(true),
        secondaryButtonLabel: cancelLabel,
        onSecondaryPressed: () => Navigator.of(ctx).pop(false),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: AppColors.cardSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: AppDimens.borderRadiusCard,
      ),
      elevation: 8,
      child: Padding(
        padding: const EdgeInsets.all(AppDimens.space24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            if (icon != null) ...[
              icon!,
              const SizedBox(height: AppDimens.space16),
            ],
            Text(
              title,
              textAlign: TextAlign.center,
              style: AppTypography.titleMedium.copyWith(
                color: isDestructive ? AppColors.dangerRed : AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: AppDimens.space8),
            Text(
              message,
              textAlign: TextAlign.center,
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.textSecondary,
                height: 1.4,
              ),
            ),
            const SizedBox(height: AppDimens.space24),
            AppButton(
              label: primaryButtonLabel,
              onPressed: onPrimaryPressed,
              variant: isDestructive ? AppButtonVariant.destructive : AppButtonVariant.primary,
            ),
            if (secondaryButtonLabel != null) ...[
              const SizedBox(height: AppDimens.space8),
              AppButton(
                label: secondaryButtonLabel!,
                onPressed: onSecondaryPressed ?? () => Navigator.of(context).pop(),
                variant: AppButtonVariant.secondary,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
