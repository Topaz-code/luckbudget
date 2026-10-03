import 'dart:io';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lockbudget_app/core/theme/app_theme.dart';
import 'package:lockbudget_app/screens/onboarding/onboarding_intro_screen.dart';
import 'package:lockbudget_app/screens/onboarding/onboarding_budget_setup_screen.dart';
import 'package:lockbudget_app/screens/onboarding/first_funding_prompt_screen.dart';

void main() {
  setUpAll(() {
    GoogleFonts.config.allowRuntimeFetching = false;
    Directory('test_renders').createSync(recursive: true);
  });

  testWidgets('Render Onboarding Intro Screen', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(390, 844);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    final key = GlobalKey();
    await tester.pumpWidget(MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: RepaintBoundary(key: key, child: const OnboardingIntroScreen()),
    ));
    await tester.pump();

    await tester.runAsync(() async {
      final boundary = key.currentContext!.findRenderObject()! as RenderRepaintBoundary;
      final image = await boundary.toImage();
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      File('test_renders/onboarding_intro.png').writeAsBytesSync(byteData!.buffer.asUint8List());
    });
  });

  testWidgets('Render Onboarding Budget Setup Screen', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(390, 844);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    final key = GlobalKey();
    await tester.pumpWidget(MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: RepaintBoundary(key: key, child: const OnboardingBudgetSetupScreen()),
    ));
    await tester.pump();

    await tester.runAsync(() async {
      final boundary = key.currentContext!.findRenderObject()! as RenderRepaintBoundary;
      final image = await boundary.toImage();
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      File('test_renders/onboarding_budget.png').writeAsBytesSync(byteData!.buffer.asUint8List());
    });
  });

  testWidgets('Render First Funding Prompt Screen', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(390, 844);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    final key = GlobalKey();
    await tester.pumpWidget(MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: RepaintBoundary(key: key, child: const FirstFundingPromptScreen()),
    ));
    await tester.pump();

    await tester.runAsync(() async {
      final boundary = key.currentContext!.findRenderObject()! as RenderRepaintBoundary;
      final image = await boundary.toImage();
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      File('test_renders/onboarding_funding.png').writeAsBytesSync(byteData!.buffer.asUint8List());
    });
  });
}
