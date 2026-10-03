import 'package:flutter/material.dart';

/// LockBudget Design System Dimension & Radii Constants
/// 
/// Extracted from Figma / Penpot vector curves and layout grids.
class AppDimens {
  AppDimens._();

  // ─── CORNER RADII ──────────────────────────────────────────────────────────
  /// Universal button border radius: 14.0px
  static const double radiusButton = 14.0;
  static const BorderRadius borderRadiusButton = BorderRadius.all(Radius.circular(radiusButton));

  /// Standard card border radius: 18.0px
  static const double radiusCard = 18.0;
  static const BorderRadius borderRadiusCard = BorderRadius.all(Radius.circular(radiusCard));

  /// Hero card border radius: 21.0px
  static const double radiusHero = 21.0;
  static const BorderRadius borderRadiusHero = BorderRadius.all(Radius.circular(radiusHero));

  /// Bottom sheet top corners: 24.0px
  static const double radiusSheet = 24.0;
  static const BorderRadius borderRadiusSheet = BorderRadius.vertical(top: Radius.circular(radiusSheet));

  /// Status badge & category chip: Stadium pill (999.0px)
  static const double radiusPill = 999.0;
  static const BorderRadius borderRadiusPill = BorderRadius.all(Radius.circular(radiusPill));

  // ─── HEIGHTS & VIEWPORT METRICS ───────────────────────────────────────────
  /// Primary & secondary button height: 50.0px
  static const double buttonHeight = 50.0;
  static const double inputHeight = 52.0;

  // ─── SPACING SCALE (4PX BASE GRID) ────────────────────────────────────────
  static const double space2 = 2.0;
  static const double space4 = 4.0;
  static const double space6 = 6.0;
  static const double space8 = 8.0;
  static const double space10 = 10.0;
  static const double space12 = 12.0;
  static const double space16 = 16.0;
  static const double space20 = 20.0; // Universal screen horizontal margin
  static const double space24 = 24.0;
  static const double space28 = 28.0;
  static const double space32 = 32.0;
  static const double space40 = 40.0;
  static const double space48 = 48.0;

  // ─── PADDING SHORTCUTS ────────────────────────────────────────────────────
  static const EdgeInsets screenPadding = EdgeInsets.symmetric(horizontal: space20);
  static const EdgeInsets cardPadding = EdgeInsets.all(space16);
  static const EdgeInsets heroPadding = EdgeInsets.all(space20);

  // ─── SHADOWS ──────────────────────────────────────────────────────────────
  static const List<BoxShadow> cardShadow = [
    BoxShadow(
      color: Color(0x0D0E3039), // 5% opacity primaryTeal
      offset: Offset(0, 2),
      blurRadius: 8.0,
      spreadRadius: 0.0,
    ),
  ];

  static const List<BoxShadow> heroShadow = [
    BoxShadow(
      color: Color(0x1A0E3039), // 10% opacity primaryTeal
      offset: Offset(0, 4),
      blurRadius: 14.0,
      spreadRadius: 0.0,
    ),
  ];
}
