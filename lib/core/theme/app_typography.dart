import 'package:flutter/material.dart';
import 'app_colors.dart';

/// LockBudget Design System Typography
/// 
/// Strictly grounded in Source Sans 3 verified from Figma/Penpot AST.
/// Uses the bundled TrueType (TTF) font family 'SourceSans3' (weights 400 and 700).
class AppTypography {
  AppTypography._();

  static const String fontFamily = 'SourceSans3';

  static const TextStyle displayHero = TextStyle(
    fontFamily: fontFamily,
    fontSize: 27.0,
    fontWeight: FontWeight.w700,
    height: 1.15,
    letterSpacing: -0.5,
    color: AppColors.textPrimary,
  );

  static const TextStyle headlineLarge = TextStyle(
    fontFamily: fontFamily,
    fontSize: 22.0,
    fontWeight: FontWeight.w700,
    height: 1.20,
    letterSpacing: -0.2,
    color: AppColors.textPrimary,
  );

  static const TextStyle titleMedium = TextStyle(
    fontFamily: fontFamily,
    fontSize: 18.0,
    fontWeight: FontWeight.w700,
    height: 1.25,
    letterSpacing: 0.0,
    color: AppColors.textPrimary,
  );

  static const TextStyle titleSmall = TextStyle(
    fontFamily: fontFamily,
    fontSize: 15.5,
    fontWeight: FontWeight.w700,
    height: 1.25,
    letterSpacing: 0.0,
    color: AppColors.textPrimary,
  );

  static const TextStyle bodyLargeBold = TextStyle(
    fontFamily: fontFamily,
    fontSize: 15.0,
    fontWeight: FontWeight.w700,
    height: 1.30,
    letterSpacing: 0.0,
    color: AppColors.textPrimary,
  );

  static const TextStyle bodyLarge = TextStyle(
    fontFamily: fontFamily,
    fontSize: 15.0,
    fontWeight: FontWeight.w400,
    height: 1.30,
    letterSpacing: 0.0,
    color: AppColors.textPrimary,
  );

  static const TextStyle bodyMedium = TextStyle(
    fontFamily: fontFamily,
    fontSize: 14.0,
    fontWeight: FontWeight.w400,
    height: 1.30,
    letterSpacing: 0.0,
    color: AppColors.textPrimary,
  );

  static const TextStyle bodyMediumBold = TextStyle(
    fontFamily: fontFamily,
    fontSize: 14.0,
    fontWeight: FontWeight.w700,
    height: 1.30,
    letterSpacing: 0.0,
    color: AppColors.textPrimary,
  );

  static const TextStyle bodySmall = TextStyle(
    fontFamily: fontFamily,
    fontSize: 13.5,
    fontWeight: FontWeight.w400,
    height: 1.20,
    letterSpacing: 0.0,
    color: AppColors.textSecondary,
  );

  static const TextStyle bodySmallBold = TextStyle(
    fontFamily: fontFamily,
    fontSize: 13.5,
    fontWeight: FontWeight.w700,
    height: 1.20,
    letterSpacing: 0.0,
    color: AppColors.textPrimary,
  );

  static const TextStyle captionRegular = TextStyle(
    fontFamily: fontFamily,
    fontSize: 12.5,
    fontWeight: FontWeight.w400,
    height: 1.20,
    letterSpacing: 0.0,
    color: AppColors.textSecondary,
  );

  static const TextStyle captionSmall = TextStyle(
    fontFamily: fontFamily,
    fontSize: 11.5,
    fontWeight: FontWeight.w400,
    height: 1.15,
    letterSpacing: 0.0,
    color: AppColors.textSecondary,
  );

  static const TextStyle captionSmallBold = TextStyle(
    fontFamily: fontFamily,
    fontSize: 11.5,
    fontWeight: FontWeight.w700,
    height: 1.15,
    letterSpacing: 0.0,
    color: AppColors.textPrimary,
  );

  static const TextStyle microTag = TextStyle(
    fontFamily: fontFamily,
    fontSize: 10.0,
    fontWeight: FontWeight.w700,
    height: 1.10,
    letterSpacing: 0.5,
    color: AppColors.textPrimary,
  );
}
