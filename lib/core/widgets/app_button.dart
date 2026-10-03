import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_dimens.dart';
import '../theme/app_typography.dart';

enum AppButtonVariant {
  primary,
  accent,
  secondary,
  destructive,
  ghost,
}

class AppButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final bool isLoading;
  final Widget? icon;
  final double? width;
  final double height;

  const AppButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.variant = AppButtonVariant.primary,
    this.isLoading = false,
    this.icon,
    this.width,
    this.height = AppDimens.buttonHeight,
  });

  @override
  Widget build(BuildContext context) {
    final isEnabled = onPressed != null && !isLoading;

    Color backgroundColor;
    Color foregroundColor;
    BorderSide borderSide = BorderSide.none;

    switch (variant) {
      case AppButtonVariant.primary:
        backgroundColor = isEnabled ? AppColors.primaryTeal : AppColors.primaryTeal.withValues(alpha: 0.5);
        foregroundColor = Colors.white;
        break;
      case AppButtonVariant.accent:
        backgroundColor = isEnabled ? AppColors.accentTurquoise : AppColors.accentTurquoise.withValues(alpha: 0.5);
        foregroundColor = AppColors.primaryTeal;
        break;
      case AppButtonVariant.secondary:
        backgroundColor = Colors.white;
        foregroundColor = isEnabled ? AppColors.primaryTeal : AppColors.textMuted;
        borderSide = const BorderSide(color: AppColors.borderLight, width: 1.5);
        break;
      case AppButtonVariant.destructive:
        backgroundColor = isEnabled ? AppColors.dangerRed : AppColors.dangerRed.withValues(alpha: 0.5);
        foregroundColor = Colors.white;
        break;
      case AppButtonVariant.ghost:
        backgroundColor = Colors.transparent;
        foregroundColor = isEnabled ? AppColors.primaryTeal : AppColors.textMuted;
        break;
    }

    return SizedBox(
      width: width ?? double.infinity,
      height: height,
      child: Material(
        color: backgroundColor,
        borderRadius: AppDimens.borderRadiusButton,
        child: InkWell(
          onTap: isEnabled ? onPressed : null,
          borderRadius: AppDimens.borderRadiusButton,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: AppDimens.space16),
            decoration: BoxDecoration(
              borderRadius: AppDimens.borderRadiusButton,
              border: borderSide != BorderSide.none ? Border.fromBorderSide(borderSide) : null,
            ),
            alignment: Alignment.center,
            child: isLoading
                ? SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      valueColor: AlwaysStoppedAnimation<Color>(foregroundColor),
                    ),
                  )
                : Row(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (icon != null) ...[
                        icon!,
                        const SizedBox(width: AppDimens.space8),
                      ],
                      Flexible(
                        child: Text(
                          label,
                          overflow: TextOverflow.ellipsis,
                          maxLines: 1,
                          style: AppTypography.bodyLargeBold.copyWith(
                            color: foregroundColor,
                          ),
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}
