import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';
import '../../screens/main_navigation_shell.dart';
import '../../screens/onboarding/onboarding_intro_screen.dart';
import '../../screens/onboarding/onboarding_budget_setup_screen.dart';
import '../../screens/onboarding/first_funding_prompt_screen.dart';
import '../../screens/home/top_up_sheet.dart';
import '../../screens/quickspend/quickspend_flow.dart';
import '../../screens/quickspend/withdrawal_flow.dart';
import '../../screens/save/goal_setup_flow.dart';
import '../../screens/budget/budget_recap_screen.dart';
import '../../screens/profile/security_screen.dart';
import '../../screens/profile/help_support_screen.dart';
import '../../state/app_state.dart';

/// LockBudget Application Route Registry
/// 
/// Contains declarative route names for all screens catalogued
/// in docs/SCREEN_INVENTORY.md.
class AppRoutes {
  AppRoutes._();

  // Root Shell
  static const String root = '/';

  // 1. Onboarding & Auth
  static const String onboardingIntro = '/onboarding/intro';
  static const String onboardingBudget = '/onboarding/budget';
  static const String onboardingFunding = '/onboarding/funding';

  // 2. Main Dashboard & Modals
  static const String home = '/home';
  static const String homeTopUp = '/home/topup';

  // 3. Quick Spend Flow
  static const String quickSpend = '/quickspend';
  static const String quickSpendAmount = '/quickspend/amount';
  static const String quickSpendReview = '/quickspend/review';
  static const String quickSpendProcessing = '/quickspend/processing';
  static const String quickSpendReceipt = '/quickspend/receipt';

  // 4. Withdrawal Flow
  static const String withdrawal = '/withdrawal';
  static const String withdrawalAmount = '/withdrawal/amount';
  static const String withdrawalReview = '/withdrawal/review';
  static const String withdrawalProcessing = '/withdrawal/processing';
  static const String withdrawalReceipt = '/withdrawal/receipt';

  // 5. Savings Hub
  static const String saveHome = '/save';
  static const String saveGoalSetup = '/save/goal/setup';
  static const String saveGoalReview = '/save/goal/review';
  static const String saveGoalSuccess = '/save/goal/success';
  static const String saveGoalReceipt = '/save/goal/receipt';
  static const String saveGoalDetail = '/save/goal/detail';
  static const String saveGoalTopUp = '/save/goal/topup';

  static const String savePeriodSetup = '/save/period/setup';
  static const String savePeriodReview = '/save/period/review';
  static const String savePeriodSuccess = '/save/period/success';
  static const String savePeriodReceipt = '/save/period/receipt';
  static const String savePeriodDetail = '/save/period/detail';

  static const String saveYearSetup = '/save/year/setup';
  static const String saveYearReview = '/save/year/review';
  static const String saveYearSuccess = '/save/year/success';
  static const String saveYearReceipt = '/save/year/receipt';
  static const String saveYearDetail = '/save/year/detail';
  static const String saveReceiptsArchive = '/save/receipts';

  // 6. Budget & Recap
  static const String budget = '/budget';
  static const String budgetRecap = '/budget/recap';
  static const String budgetRecapArchive = '/budget/recap/archive';

  // 7. Activity History
  static const String activity = '/activity';
  static const String activityDetail = '/activity/detail';

  // 8. Profile, Security & Support
  static const String profile = '/profile';
  static const String userProfile = '/profile/user';
  static const String personalBankAccount = '/profile/bank';
  static const String securitySettings = '/profile/security';
  static const String notificationSettings = '/profile/notifications';
  static const String helpSupport = '/profile/help';
  static const String generalSettings = '/profile/settings';
  static const String deleteAccount = '/profile/delete';

  // 9. Edge Cases & Emergencies
  static const String emergencyUnlock = '/emergency';
  static const String offlineMode = '/offline';
  static const String failureState = '/failure';
}

class AppRouter {
  AppRouter._();

  static Route<dynamic> onGenerateRoute(RouteSettings settings, AppState appState) {
    switch (settings.name) {
      case AppRoutes.root:
      case AppRoutes.home:
        return _slideRoute(const MainNavigationShell());

      case AppRoutes.onboardingIntro:
        return _fadeRoute(OnboardingIntroScreen(
          onLoginTap: () {},
          onComplete: () {},
        ));

      case AppRoutes.onboardingBudget:
        return _slideRoute(const OnboardingBudgetSetupScreen());

      case AppRoutes.onboardingFunding:
        return _slideRoute(const FirstFundingPromptScreen());

      case AppRoutes.quickSpend:
        return _slideRoute(QuickSpendFlow(appState: appState));

      case AppRoutes.withdrawal:
        return _slideRoute(WithdrawalFlow(appState: appState));

      case AppRoutes.saveGoalSetup:
        return _slideRoute(GoalSetupFlow(
          appState: appState,
          lockType: (settings.arguments as String?) ?? 'goal',
        ));

      case AppRoutes.budgetRecap:
        return _slideRoute(BudgetRecapScreen(appState: appState));

      case AppRoutes.securitySettings:
        return _slideRoute(const SecurityScreen());

      case AppRoutes.helpSupport:
        return _slideRoute(const HelpSupportScreen());

      case AppRoutes.homeTopUp:
        return _sheetRoute(TopUpSheet(appState: appState));

      default:
        return _slideRoute(_PlaceholderScreen(routeName: settings.name ?? 'Unknown'));
    }
  }

  static PageRouteBuilder _slideRoute(Widget page) {
    return PageRouteBuilder(
      pageBuilder: (context, animation, secondaryAnimation) => page,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        const begin = Offset(1.0, 0.0);
        const end = Offset.zero;
        final tween = Tween(begin: begin, end: end).chain(CurveTween(curve: Curves.easeOutCubic));
        return SlideTransition(position: animation.drive(tween), child: child);
      },
      transitionDuration: const Duration(milliseconds: 300),
    );
  }

  static PageRouteBuilder _fadeRoute(Widget page) {
    return PageRouteBuilder(
      pageBuilder: (context, animation, secondaryAnimation) => page,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        return FadeTransition(opacity: animation, child: child);
      },
      transitionDuration: const Duration(milliseconds: 250),
    );
  }

  static PageRouteBuilder _sheetRoute(Widget page) {
    return PageRouteBuilder(
      opaque: false,
      barrierColor: Colors.black54,
      barrierDismissible: true,
      pageBuilder: (context, animation, secondaryAnimation) => page,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        const begin = Offset(0.0, 1.0);
        const end = Offset.zero;
        return SlideTransition(
          position: Tween(begin: begin, end: end).animate(
            CurvedAnimation(parent: animation, curve: Curves.easeOutCubic),
          ),
          child: child,
        );
      },
    );
  }
}

class _PlaceholderScreen extends StatelessWidget {
  final String routeName;
  const _PlaceholderScreen({required this.routeName});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(routeName, style: AppTypography.titleMedium),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.construction, size: 48, color: AppColors.accentTurquoise),
              const SizedBox(height: 16),
              Text(
                'Screen Implementation in Progress',
                style: AppTypography.titleMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Route: $routeName\nScheduled for Phase 3 Feature Batches.',
                style: AppTypography.bodySmall,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
