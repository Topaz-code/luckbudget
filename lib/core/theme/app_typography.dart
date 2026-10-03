import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

/// LockBudget Design System Typography
/// 
/// Strictly grounded in Source Sans 3 verified from Figma/Penpot AST
/// (3,420 instances of Source Sans 3, 262 instances of Source Sans Pro).
class AppTypography {
  AppTypography._();

  static TextStyle get displayHero => GoogleFonts.sourceSans3(
        fontSize: 27.0,
        fontWeight: FontWeight.w700,
        height: 1.15,
        letterSpacing: -0.5,
        color: AppColors.textPrimary,
      );

  static TextStyle get headlineLarge => GoogleFonts.sourceSans3(
        fontSize: 22.0,
        fontWeight: FontWeight.w700,
        height: 1.20,
        letterSpacing: -0.2,
        color: AppColors.textPrimary,
      );

  static TextStyle get titleMedium => GoogleFonts.sourceSans3(
        fontSize: 18.0,
        fontWeight: FontWeight.w700,
        height: 1.25,
        letterSpacing: 0.0,
        color: AppColors.textPrimary,
      );

  static TextStyle get titleSmall => GoogleFonts.sourceSans3(
        fontSize: 15.5,
        fontWeight: FontWeight.w700,
        height: 1.25,
        letterSpacing: 0.0,
        color: AppColors.textPrimary,
      );

  static TextStyle get bodyLargeBold => GoogleFonts.sourceSans3(
        fontSize: 15.0,
        fontWeight: FontWeight.w700,
        height: 1.30,
        letterSpacing: 0.0,
        color: AppColors.textPrimary,
      );

  static TextStyle get bodyLarge => GoogleFonts.sourceSans3(
        fontSize: 15.0,
        fontWeight: FontWeight.w400,
        height: 1.30,
        letterSpacing: 0.0,
        color: AppColors.textPrimary,
      );

  static TextStyle get bodyMedium => GoogleFonts.sourceSans3(
        fontSize: 14.0,
        fontWeight: FontWeight.w400,
        height: 1.30,
        letterSpacing: 0.0,
        color: AppColors.textPrimary,
      );

  static TextStyle get bodyMediumBold => GoogleFonts.sourceSans3(
        fontSize: 14.0,
        fontWeight: FontWeight.w700,
        height: 1.30,
        letterSpacing: 0.0,
        color: AppColors.textPrimary,
      );

  static TextStyle get bodySmall => GoogleFonts.sourceSans3(
        fontSize: 13.5,
        fontWeight: FontWeight.w400,
        height: 1.20,
        letterSpacing: 0.0,
        color: AppColors.textSecondary,
      );

  static TextStyle get bodySmallBold => GoogleFonts.sourceSans3(
        fontSize: 13.5,
        fontWeight: FontWeight.w700,
        height: 1.20,
        letterSpacing: 0.0,
        color: AppColors.textPrimary,
      );

  static TextStyle get captionRegular => GoogleFonts.sourceSans3(
        fontSize: 12.5,
        fontWeight: FontWeight.w400,
        height: 1.20,
        letterSpacing: 0.0,
        color: AppColors.textSecondary,
      );

  static TextStyle get captionSmall => GoogleFonts.sourceSans3(
        fontSize: 11.5,
        fontWeight: FontWeight.w400,
        height: 1.15,
        letterSpacing: 0.0,
        color: AppColors.textSecondary,
      );

  static TextStyle get captionSmallBold => GoogleFonts.sourceSans3(
        fontSize: 11.5,
        fontWeight: FontWeight.w700,
        height: 1.15,
        letterSpacing: 0.0,
        color: AppColors.textPrimary,
      );

  static TextStyle get microTag => GoogleFonts.sourceSans3(
        fontSize: 10.0,
        fontWeight: FontWeight.w700,
        height: 1.10,
        letterSpacing: 0.5,
        color: AppColors.textPrimary,
      );
}
