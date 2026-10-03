import 'package:flutter/material.dart';

/// LockBudget Design System Color Tokens
/// 
/// Exact hex tokens verified from Penpot AST extraction (6,925 nodes)
/// and Figma canvas inspection.
class AppColors {
  AppColors._();

  // ─── BRAND PRIMARY & SECONDARY ─────────────────────────────────────────────
  /// Deep dark teal / brand primary (2,319 occurrences)
  static const Color primaryTeal = Color(0xFF0E3039);
  static const Color primaryTealLight = Color(0xFF143B45);
  static const Color primaryTealDark = Color(0xFF071B20);

  /// Secondary muted sage teal (1,635 occurrences)
  static const Color sageMuted = Color(0xFF48645F);
  static const Color sageLight = Color(0xFF7A9792);

  // ─── ACCENTS ───────────────────────────────────────────────────────────────
  /// Otis turquoise brand accent (220 occurrences)
  static const Color accentTurquoise = Color(0xFF37B1A7);

  /// Dark turquoise / pressed state / high-contrast tag (216 occurrences)
  static const Color accentTurquoiseDark = Color(0xFF1F7D76);

  /// Soft pill background / subtle container tint (155 occurrences)
  static const Color pillBackground = Color(0xFFE3F2F0);
  static const Color subtleContainer = Color(0xFFEBF7F6);

  // ─── SURFACES & BACKGROUNDS ────────────────────────────────────────────────
  /// Card and container white surface (1,122 occurrences)
  static const Color cardSurface = Color(0xFFFFFFFF);

  /// Application canvas background (114 occurrences)
  static const Color background = Color(0xFFFBFDFD);
  static const Color backgroundAlt = Color(0xFFF7F9F9);

  /// Secondary card surface / soft container (123 occurrences)
  static const Color cardSurfaceSecondary = Color(0xFFE4EBEA);
  static const Color cardSurfaceSoft = Color(0xFFEEF3F2);

  // ─── BORDERS & DIVIDERS ────────────────────────────────────────────────────
  /// Primary card border & container outline (558 occurrences)
  static const Color borderLight = Color(0xFFE1EAE8);

  /// Soft hairline divider (87 occurrences)
  static const Color dividerMuted = Color(0xFFF1F4F4);

  // ─── TEXT EMPHASIS ─────────────────────────────────────────────────────────
  static const Color textPrimary = Color(0xFF0E3039);
  static const Color textSecondary = Color(0xFF48645F);
  static const Color textMuted = Color(0xFF8B9FA3);
  static const Color textOnDark = Color(0xFFFFFFFF);

  // ─── FUNCTIONAL / SEMANTIC STATUS ──────────────────────────────────────────
  /// Done / Success status green (12 occurrences)
  static const Color successGreen = Color(0xFF00A870);
  static const Color successGreenLight = Color(0xFFE9FFF6);

  /// Pending / Warning status gold (48 occurrences)
  static const Color warningGold = Color(0xFFF2B32A);
  static const Color warningGoldDark = Color(0xFF9B6A00);
  static const Color warningGoldLight = Color(0xFFFEF8E7);

  /// Failed / Danger status red (38 occurrences)
  static const Color dangerRed = Color(0xFFC7574E);
  static const Color dangerRedDark = Color(0xFF8B2C24);
  static const Color dangerRedLight = Color(0xFFFDEEEB);

  /// Sync Delayed neutral status
  static const Color syncDelayedGray = Color(0xFF6B7280);
  static const Color syncDelayedLight = Color(0xFFF3F4F6);
}
