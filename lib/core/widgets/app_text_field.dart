import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_colors.dart';
import '../theme/app_dimens.dart';

class AppTextField extends StatelessWidget {
  final TextEditingController? controller;
  final String? label;
  final String? hintText;
  final String? errorText;
  final bool obscureText;
  final TextInputType keyboardType;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final ValueChanged<String>? onChanged;
  final bool readOnly;
  final VoidCallback? onTap;

  const AppTextField({
    super.key,
    this.controller,
    this.label,
    this.hintText,
    this.errorText,
    this.obscureText = false,
    this.keyboardType = TextInputType.text,
    this.prefixIcon,
    this.suffixIcon,
    this.onChanged,
    this.readOnly = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label != null) ...[
          Text(
            label!,
            style: GoogleFonts.sourceSans3(
              fontSize: 14.0,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: AppDimens.space6),
        ],
        TextField(
          controller: controller,
          obscureText: obscureText,
          keyboardType: keyboardType,
          readOnly: readOnly,
          onTap: onTap,
          onChanged: onChanged,
          style: GoogleFonts.sourceSans3(
            fontSize: 15.0,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
          decoration: InputDecoration(
            hintText: hintText,
            errorText: errorText,
            prefixIcon: prefixIcon,
            suffixIcon: suffixIcon,
            filled: true,
            fillColor: AppColors.cardSurface,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: AppDimens.space16,
              vertical: AppDimens.space12,
            ),
            border: const OutlineInputBorder(
              borderRadius: AppDimens.borderRadiusButton,
              borderSide: BorderSide(color: AppColors.borderLight, width: 1.2),
            ),
            enabledBorder: const OutlineInputBorder(
              borderRadius: AppDimens.borderRadiusButton,
              borderSide: BorderSide(color: AppColors.borderLight, width: 1.2),
            ),
            focusedBorder: const OutlineInputBorder(
              borderRadius: AppDimens.borderRadiusButton,
              borderSide: BorderSide(color: AppColors.primaryTeal, width: 1.8),
            ),
            errorBorder: const OutlineInputBorder(
              borderRadius: AppDimens.borderRadiusButton,
              borderSide: BorderSide(color: AppColors.dangerRed, width: 1.2),
            ),
          ),
        ),
      ],
    );
  }
}
