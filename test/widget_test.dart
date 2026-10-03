import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lockbudget_app/main.dart';

void main() {
  testWidgets('Onboarding flow proceeds from Intro to Budget to Funding to Dashboard', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(412, 915);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await tester.pumpWidget(const LockBudgetApp(initialOnboarded: false));
    await tester.pumpAndSettle();

    // 1. Onboarding Intro Screen
    expect(find.text('Let’s get to know you!'), findsOneWidget);
    expect(find.text('Introduce yourself.'), findsOneWidget);
    expect(find.text('Surname'), findsOneWidget);
    expect(find.text('First name'), findsOneWidget);

    // Tap Continue
    await tester.tap(find.text('Continue'));
    await tester.pumpAndSettle();

    // 2. Budget Setup Screen
    expect(find.text('Your monthly budget'), findsOneWidget);
    expect(find.text('Lock it in.'), findsOneWidget);

    // Tap Lock it in.
    await tester.tap(find.text('Lock it in.'));
    await tester.pumpAndSettle();

    // 3. First Funding Prompt Screen
    expect(find.text('Fund your account'), findsOneWidget);
    expect(find.text('0234 567 890'), findsOneWidget);
    expect(find.text('I have made the transfer'), findsOneWidget);

    // Tap I have made the transfer
    await tester.tap(find.text('I have made the transfer'));
    await tester.pumpAndSettle();

    // 4. Arrived at Dashboard
    expect(find.text('Hi, Yakubu manage'), findsOneWidget);
    expect(find.text("TODAY'S ALLOWANCE"), findsOneWidget);
  });

  testWidgets('LockBudgetApp loads home screen with key Figma elements', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(412, 915);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await tester.pumpWidget(const LockBudgetApp(initialOnboarded: true));
    await tester.pumpAndSettle();

    // Verify greeting and Otis presence
    expect(find.text('Hi, Yakubu manage'), findsOneWidget);
    expect(find.text("TODAY'S ALLOWANCE"), findsOneWidget);
    expect(find.text('Total in LockBudget'), findsOneWidget);

    // Verify Quick Spend category tiles
    expect(find.text('Food'), findsOneWidget);
    expect(find.text('Airtime'), findsOneWidget);
    expect(find.text('Electricity'), findsOneWidget);
    expect(find.text('Internet'), findsOneWidget);

    // Verify Spend & Top up CTAs
    expect(find.text('Spend'), findsOneWidget);
    expect(find.text('Top up'), findsOneWidget);
  });

  testWidgets('Bottom navigation switches between all 4 Figma tabs', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(412, 915);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await tester.pumpWidget(const LockBudgetApp(initialOnboarded: true));
    await tester.pumpAndSettle();

    // Tap Save tab
    await tester.tap(find.text('Save'));
    await tester.pumpAndSettle();
    expect(find.text('saved this month'), findsOneWidget);
    expect(find.text('Save for a year'), findsOneWidget);
    expect(find.text('Save till goal'), findsOneWidget);

    // Tap Budget tab
    await tester.tap(find.text('Budget'));
    await tester.pumpAndSettle();
    expect(find.text('Income'), findsOneWidget);
    expect(find.text('Save budget'), findsOneWidget);
    expect(find.text('View recap'), findsOneWidget);

    // Tap Activity tab
    await tester.tap(find.text('Activity'));
    await tester.pumpAndSettle();
    expect(find.text('Income'), findsOneWidget);
    expect(find.text('Expenses'), findsOneWidget);
    expect(find.text('Airtime release'), findsOneWidget);

    // Tap Home tab back
    await tester.tap(find.text('Home'));
    await tester.pumpAndSettle();
    expect(find.text("TODAY'S ALLOWANCE"), findsOneWidget);
  });

  testWidgets('Top-up bottom sheet opens with Wema Bank details and funding', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(412, 915);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await tester.pumpWidget(const LockBudgetApp(initialOnboarded: true));
    await tester.pumpAndSettle();

    // Tap Top up
    await tester.tap(find.text('Top up'));
    await tester.pumpAndSettle();

    // Check bottom sheet contents
    expect(find.text('Top up LockBudget'), findsOneWidget);
    expect(find.text('LockBudget Account Details'), findsOneWidget);
    expect(find.text('0234 567 890 • Wema Bank'), findsOneWidget);
    expect(find.text('Complete Top-up'), findsOneWidget);

    // Close bottom sheet
    await tester.tap(find.text('Complete Top-up'));
    await tester.pumpAndSettle();
    expect(find.text('Top up LockBudget'), findsNothing);
  });

  testWidgets('Quick spend sheet can be launched from quick spend tile', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(412, 915);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await tester.pumpWidget(const LockBudgetApp(initialOnboarded: true));
    await tester.pumpAndSettle();

    // Scroll to and tap Food tile
    await tester.ensureVisible(find.text('Food'));
    await tester.tap(find.text('Food'));
    await tester.pumpAndSettle();

    // Check quick spend screen
    expect(find.text('Quick Spend'), findsOneWidget);
    expect(find.text('Select budget line'), findsOneWidget);
    expect(find.text('Review Release'), findsOneWidget);
  });
}
