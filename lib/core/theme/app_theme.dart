import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';
import 'app_dimens.dart';
import 'app_typography.dart';

/// LockBudget Canonical Design System ThemeData
class AppTheme {
  AppTheme._();

  // Exported color constants for backwards compatibility with existing screens
  static const Color primaryTeal = AppColors.primaryTeal;
  static const Color primaryTealLight = AppColors.primaryTealLight;
  static const Color primaryTealDark = AppColors.primaryTealDark;

  static const Color accentTurquoise = AppColors.accentTurquoise;
  static const Color accentTurquoiseLight = AppColors.pillBackground;
  static const Color accentTurquoiseSubtle = AppColors.subtleContainer;

  static const Color background = AppColors.background;
  static const Color cardSurface = AppColors.cardSurface;
  static const Color cardBorder = AppColors.borderLight;
  static const Color dividerColor = AppColors.dividerMuted;

  static const Color textPrimary = AppColors.textPrimary;
  static const Color textSecondary = AppColors.textSecondary;
  static const Color textMuted = AppColors.textMuted;

  static const Color successGreen = AppColors.successGreen;
  static const Color warningOrange = AppColors.warningGold;
  static const Color dangerRed = AppColors.dangerRed;

  static ThemeData get lightTheme {
    final baseTextTheme = GoogleFonts.sourceSans3TextTheme();

    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: AppColors.background,
      primaryColor: AppColors.primaryTeal,
      colorScheme: const ColorScheme.light(
        primary: AppColors.primaryTeal,
        secondary: AppColors.accentTurquoise,
        surface: AppColors.cardSurface,
        onSurface: AppColors.textPrimary,
        error: AppColors.dangerRed,
      ),
      textTheme: baseTextTheme.copyWith(
        displayLarge: AppTypography.displayHero,
        headlineMedium: AppTypography.headlineLarge,
        titleLarge: AppTypography.titleMedium,
        titleMedium: AppTypography.titleSmall,
        bodyLarge: AppTypography.bodyLarge,
        bodyMedium: AppTypography.bodyMedium,
        bodySmall: AppTypography.bodySmall,
        labelLarge: AppTypography.bodyLargeBold,
        labelMedium: AppTypography.captionSmallBold,
        labelSmall: AppTypography.microTag,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        scrolledUnderElevation: 0,
        iconTheme: IconThemeData(color: AppColors.textPrimary),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primaryTeal,
          foregroundColor: Colors.white,
          minimumSize: const Size(64, AppDimens.buttonHeight),
          shape: const RoundedRectangleBorder(
            borderRadius: AppDimens.borderRadiusButton,
          ),
          elevation: 0,
          textStyle: GoogleFonts.sourceSans3(
            fontSize: 15.0,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primaryTeal,
          minimumSize: const Size(64, AppDimens.buttonHeight),
          side: const BorderSide(color: AppColors.borderLight, width: 1.5),
          shape: const RoundedRectangleBorder(
            borderRadius: AppDimens.borderRadiusButton,
          ),
          textStyle: GoogleFonts.sourceSans3(
            fontSize: 15.0,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      cardTheme: const CardThemeData(
        color: AppColors.cardSurface,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: AppDimens.borderRadiusCard,
          side: BorderSide(color: AppColors.borderLight, width: 1.0),
        ),
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: AppColors.cardSurface,
        elevation: 16,
        shape: RoundedRectangleBorder(
          borderRadius: AppDimens.borderRadiusSheet,
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.borderLight,
        thickness: 1.0,
        space: 1.0,
      ),
    );
  }
}
