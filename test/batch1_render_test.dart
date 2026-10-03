import 'dart:io';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lockbudget_app/core/theme/app_theme.dart';
import 'package:lockbudget_app/screens/onboarding/onboarding_intro_screen.dart';
import 'package:lockbudget_app/screens/onboarding/onboarding_budget_setup_screen.dart';
import 'package:lockbudget_app/screens/onboarding/first_funding_prompt_screen.dart';

class LocalAssetBundle extends CachingAssetBundle {
  @override
  Future<ByteData> load(String key) async {
    final file = File(key);
    if (file.existsSync()) {
      final bytes = await file.readAsBytes();
      return ByteData.view(bytes.buffer);
    }
    final buildFile = File('build/unit_test_assets/$key');
    if (buildFile.existsSync()) {
      final bytes = await buildFile.readAsBytes();
      return ByteData.view(bytes.buffer);
    }
    return rootBundle.load(key);
  }
}

void main() {
  setUpAll(() async {
    Directory('test_renders').createSync(recursive: true);

    final fontLoader = FontLoader('SourceSans3');
    for (final weight in ['Regular', 'Bold']) {
      final file = File('assets/fonts/SourceSans3-$weight.ttf');
      if (file.existsSync()) {
        fontLoader.addFont(file.readAsBytes().then((b) => ByteData.view(b.buffer)));
      }
    }
    await fontLoader.load();

    const matIconsPath = '/home/topaz/snap/flutter/common/flutter/bin/cache/artifacts/material_fonts/MaterialIcons-Regular.otf';
    final matFile = File(matIconsPath);
    if (matFile.existsSync()) {
      final matLoader = FontLoader('MaterialIcons');
      matLoader.addFont(matFile.readAsBytes().then((b) => ByteData.view(b.buffer)));
      await matLoader.load();
    }
  });

  testWidgets('Render Onboarding Intro Screen', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(780, 1688);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    final key = GlobalKey();
    final bundle = LocalAssetBundle();
    await tester.pumpWidget(
      DefaultAssetBundle(
        bundle: bundle,
        child: MaterialApp(
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme,
          home: RepaintBoundary(key: key, child: const OnboardingIntroScreen()),
        ),
      ),
    );

    await tester.pump();

    await tester.runAsync(() async {
      final boundary = key.currentContext!.findRenderObject()! as RenderRepaintBoundary;
      final image = await boundary.toImage(pixelRatio: 2.0);
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      File('test_renders/onboarding_intro.png').writeAsBytesSync(byteData!.buffer.asUint8List());
    });
  });

  testWidgets('Render Onboarding Budget Setup Screen', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(780, 1688);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    final key = GlobalKey();
    await tester.pumpWidget(
      DefaultAssetBundle(
        bundle: LocalAssetBundle(),
        child: MaterialApp(
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme,
          home: RepaintBoundary(key: key, child: const OnboardingBudgetSetupScreen()),
        ),
      ),
    );
    await tester.pumpAndSettle();

    await tester.runAsync(() async {
      final boundary = key.currentContext!.findRenderObject()! as RenderRepaintBoundary;
      final image = await boundary.toImage(pixelRatio: 2.0);
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      File('test_renders/onboarding_budget.png').writeAsBytesSync(byteData!.buffer.asUint8List());
    });
  });

  testWidgets('Render First Funding Prompt Screen', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(780, 1688);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    final key = GlobalKey();
    final bundle = LocalAssetBundle();
    await tester.pumpWidget(
      DefaultAssetBundle(
        bundle: bundle,
        child: MaterialApp(
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme,
          home: RepaintBoundary(key: key, child: const FirstFundingPromptScreen()),
        ),
      ),
    );

    await tester.pump();

    await tester.runAsync(() async {
      final boundary = key.currentContext!.findRenderObject()! as RenderRepaintBoundary;
      final image = await boundary.toImage(pixelRatio: 2.0);
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      File('test_renders/onboarding_funding.png').writeAsBytesSync(byteData!.buffer.asUint8List());
    });
  });
}
