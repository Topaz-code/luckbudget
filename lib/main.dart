import 'package:flutter/material.dart';
import 'theme/app_theme.dart';
import 'screens/onboarding/onboarding_intro_screen.dart';
import 'screens/main_navigation_shell.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const LockBudgetApp());
}

class LockBudgetApp extends StatefulWidget {
  final bool initialOnboarded;
  const LockBudgetApp({super.key, this.initialOnboarded = false});

  @override
  State<LockBudgetApp> createState() => _LockBudgetAppState();
}

class _LockBudgetAppState extends State<LockBudgetApp> {
  late bool _isOnboarded;

  @override
  void initState() {
    super.initState();
    _isOnboarded = widget.initialOnboarded;
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'LockBudget',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: _isOnboarded
          ? const MainNavigationShell()
          : OnboardingIntroScreen(
              onLoginTap: () => setState(() => _isOnboarded = true),
              onComplete: () => setState(() => _isOnboarded = true),
            ),
    );
  }
}

