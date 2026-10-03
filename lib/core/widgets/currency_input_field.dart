import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import '../theme/app_colors.dart';
import '../theme/app_dimens.dart';
import '../theme/app_typography.dart';

class CurrencyInputField extends StatelessWidget {
  final TextEditingController controller;
  final String? label;
  final String? helperText;
  final String? errorText;
  final ValueChanged<String>? onChanged;
  final bool autoFocus;

  const CurrencyInputField({
    super.key,
    required this.controller,
    this.label,
    this.helperText,
    this.errorText,
    this.onChanged,
    this.autoFocus = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label != null) ...[
          Text(
            label!,
            style: AppTypography.bodySmallBold.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: AppDimens.space8),
        ],
        Container(
          height: 64,
          padding: const EdgeInsets.symmetric(horizontal: AppDimens.space16),
          decoration: BoxDecoration(
            color: AppColors.cardSurface,
            borderRadius: AppDimens.borderRadiusCard,
            border: Border.all(
              color: errorText != null ? AppColors.dangerRed : AppColors.borderLight,
              width: errorText != null ? 1.5 : 1.0,
            ),
            boxShadow: AppDimens.cardShadow,
          ),
          child: Row(
            children: [
              Text(
                '₦',
                style: AppTypography.headlineLarge.copyWith(
                  color: AppColors.accentTurquoise,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(width: AppDimens.space8),
              Expanded(
                child: TextField(
                  controller: controller,
                  autofocus: autoFocus,
                  keyboardType: TextInputType.number,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    _CurrencyInputFormatter(),
                  ],
                  onChanged: onChanged,
                  style: AppTypography.headlineLarge.copyWith(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w700,
                  ),
                  decoration: InputDecoration(
                    border: InputBorder.none,
                    hintText: '0',
                    hintStyle: AppTypography.headlineLarge.copyWith(color: AppColors.textMuted),
                    isDense: true,
                    contentPadding: EdgeInsets.zero,
                  ),
                ),
              ),
              if (controller.text.isNotEmpty)
                IconButton(
                  icon: const Icon(Icons.close, size: 18, color: AppColors.textMuted),
                  onPressed: () {
                    controller.clear();
                    if (onChanged != null) onChanged!('');
                  },
                ),
            ],
          ),
        ),
        if (errorText != null) ...[
          const SizedBox(height: AppDimens.space4),
          Text(
            errorText!,
            style: AppTypography.captionSmallBold.copyWith(color: AppColors.dangerRed),
          ),
        ] else if (helperText != null) ...[
          const SizedBox(height: AppDimens.space4),
          Text(
            helperText!,
            style: AppTypography.captionRegular.copyWith(color: AppColors.textSecondary),
          ),
        ],
      ],
    );
  }
}

class _CurrencyInputFormatter extends TextInputFormatter {
  final NumberFormat _formatter = NumberFormat('#,###');

  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    if (newValue.text.isEmpty) {
      return newValue.copyWith(text: '');
    }

    final cleanText = newValue.text.replaceAll(',', '');
    final number = int.tryParse(cleanText);
    if (number == null) return oldValue;

    final newFormatted = _formatter.format(number);
    return TextEditingValue(
      text: newFormatted,
      selection: TextSelection.collapsed(offset: newFormatted.length),
    );
  }
}
