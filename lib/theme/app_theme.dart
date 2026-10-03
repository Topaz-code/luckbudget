import 'package:flutter/material.dart';

class AppTheme {
  // Brand Colors matching Figma designs
  static const Color primaryTeal = Color(0xFF0E3039); // Deep dark teal/emerald
  static const Color primaryTealLight = Color(0xFF143B45);
  static const Color primaryTealDark = Color(0xFF0A2228);

  static const Color accentTurquoise = Color(0xFF37B1A7); // Otis turquoise
  static const Color accentTurquoiseLight = Color(0xFFE2F4F2); // Soft pill background
  static const Color accentTurquoiseSubtle = Color(0xFFEBF7F6);

  static const Color background = Color(0xFFF7F9F9);
  static const Color cardSurface = Colors.white;
  static const Color cardBorder = Color(0xFFE5ECEC);
  static const Color dividerColor = Color(0xFFEEF2F2);

  static const Color textPrimary = Color(0xFF0E2328);
  static const Color textSecondary = Color(0xFF5D7074);
  static const Color textMuted = Color(0xFF8B9FA3);

  static const Color successGreen = Color(0xFF10B981);
  static const Color warningOrange = Color(0xFFF59E0B);
  static const Color dangerRed = Color(0xFFEF4444);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: background,
      primaryColor: primaryTeal,
      colorScheme: ColorScheme.light(
        primary: primaryTeal,
        secondary: accentTurquoise,
        surface: cardSurface,
        onSurface: textPrimary,
      ),
      fontFamily: 'Roboto',
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: primaryTeal),
      ),
      cardTheme: CardThemeData(
        color: cardSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: cardBorder, width: 1.2),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: accentTurquoise,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: primaryTeal,
          side: const BorderSide(color: cardBorder, width: 1.2),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          textStyle: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}
