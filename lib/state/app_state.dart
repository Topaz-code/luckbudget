import 'package:flutter/foundation.dart';
import '../models/budget_models.dart';

class AppState extends ChangeNotifier {
  double _dailyAllowance = 7500.0;
  double _totalBalance = 184250.0;
  double _monthlyIncome = 50000.0;
  double _totalSavedMonth = 32000.0;

  bool _isOffline = false;
  bool _simulateNetworkError = false;

  SaveGoal _activeGoal = const SaveGoal(
    id: 'goal_1',
    title: 'Goal save',
    subtitle: 'For selected target',
    currentAmount: 18000.0,
    targetAmount: 40000.0,
    unlockDate: 'Nov 15, 2026',
    lockType: 'goal',
  );

  List<QuickSpendCategory> _categories = [
    const QuickSpendCategory(
      id: 'food',
      title: 'Food',
      remainingAmount: 12000.0,
      iconCode: 'restaurant',
    ),
    const QuickSpendCategory(
      id: 'airtime',
      title: 'Airtime',
      remainingAmount: 2000.0,
      iconCode: 'bolt',
    ),
    const QuickSpendCategory(
      id: 'electricity',
      title: 'Electricity',
      remainingAmount: 8500.0,
      iconCode: 'lightbulb_outline',
    ),
    const QuickSpendCategory(
      id: 'internet',
      title: 'Internet',
      remainingAmount: 4000.0,
      iconCode: 'wifi',
    ),
  ];

  final List<TransactionItem> _transactions = [
    const TransactionItem(
      id: 'tx_1',
      title: 'Airtime release',
      subtitle: 'From Airtime budget, 10:24 AM',
      amount: 300.0,
      type: TransactionType.expense,
      status: TransactionStatus.done,
      timeString: '10:24 AM',
      dateGroup: 'TODAY',
      category: 'Airtime',
      reference: 'TX-AIR-8921',
    ),
    const TransactionItem(
      id: 'tx_2',
      title: 'Goal save started',
      subtitle: 'My goal, 9:41 AM',
      amount: 20000.0,
      type: TransactionType.save,
      status: TransactionStatus.done,
      timeString: '9:41 AM',
      dateGroup: 'TODAY',
      category: 'Savings',
      reference: 'TX-SAV-4412',
    ),
    const TransactionItem(
      id: 'tx_3',
      title: 'Budget top-up',
      subtitle: 'Transfer received, 9:30 AM',
      amount: 25000.0,
      type: TransactionType.income,
      status: TransactionStatus.done,
      timeString: '9:30 AM',
      dateGroup: 'TODAY',
      category: 'Top-up',
      reference: 'TX-IN-0091',
    ),
    const TransactionItem(
      id: 'tx_4',
      title: 'Food release',
      subtitle: 'From Food budget, 7:12 PM',
      amount: 2000.0,
      type: TransactionType.expense,
      status: TransactionStatus.done,
      timeString: '7:12 PM',
      dateGroup: 'YESTERDAY',
      category: 'Food',
      reference: 'TX-FD-1204',
    ),
    const TransactionItem(
      id: 'tx_5',
      title: 'Electricity release',
      subtitle: 'From Electricity budget, 4:08 PM',
      amount: 5000.0,
      type: TransactionType.expense,
      status: TransactionStatus.done,
      timeString: '4:08 PM',
      dateGroup: 'YESTERDAY',
      category: 'Electricity',
      reference: 'TX-EL-7719',
    ),
  ];

  // Getters
  double get dailyAllowance => _dailyAllowance;
  double get totalBalance => _totalBalance;
  double get monthlyIncome => _monthlyIncome;
  double get totalSavedMonth => _totalSavedMonth;
  bool get isOffline => _isOffline;
  bool get simulateNetworkError => _simulateNetworkError;
  SaveGoal get activeGoal => _activeGoal;
  List<QuickSpendCategory> get categories => List.unmodifiable(_categories);
  List<TransactionItem> get transactions => List.unmodifiable(_transactions);

  double get totalExpensesToday {
    return _transactions
        .where((t) => t.dateGroup == 'TODAY' && t.type == TransactionType.expense)
        .fold(0.0, (sum, t) => sum + t.amount);
  }

  double get totalIncomeToday {
    return _transactions
        .where((t) => t.dateGroup == 'TODAY' && t.type == TransactionType.income)
        .fold(0.0, (sum, t) => sum + t.amount);
  }

  // Actions
  void setMonthlyIncome(double amount) {
    _monthlyIncome = amount;
    notifyListeners();
  }

  void toggleOfflineSimulation() {
    _isOffline = !_isOffline;
    notifyListeners();
  }

  void toggleFailureSimulation() {
    _simulateNetworkError = !_simulateNetworkError;
    notifyListeners();
  }

  bool executeQuickSpend({
    required String categoryId,
    required double amount,
    required String note,
  }) {
    if (_simulateNetworkError) {
      return false; // trigger failure state
    }

    _dailyAllowance = (_dailyAllowance - amount).clamp(0.0, double.infinity);
    _totalBalance = (_totalBalance - amount).clamp(0.0, double.infinity);

    // Update category
    _categories = _categories.map((c) {
      if (c.id == categoryId) {
        return QuickSpendCategory(
          id: c.id,
          title: c.title,
          remainingAmount: (c.remainingAmount - amount).clamp(0.0, double.infinity),
          iconCode: c.iconCode,
        );
      }
      return c;
    }).toList();

    // Add transaction
    final category = _categories.firstWhere((c) => c.id == categoryId, orElse: () => _categories.first);
    final status = _isOffline ? TransactionStatus.syncDelayed : TransactionStatus.done;

    _transactions.insert(
      0,
      TransactionItem(
        id: 'tx_${DateTime.now().millisecondsSinceEpoch}',
        title: '${category.title} release',
        subtitle: _isOffline ? 'Sync delayed, queued offline' : 'From ${category.title} budget',
        amount: amount,
        type: TransactionType.expense,
        status: status,
        timeString: 'Just now',
        dateGroup: 'TODAY',
        category: category.title,
        reference: 'TX-QS-${DateTime.now().millisecondsSinceEpoch % 10000}',
      ),
    );

    notifyListeners();
    return true;
  }

  void topUpBudget(double amount) {
    _totalBalance += amount;
    _dailyAllowance += (amount / 30); // distribute allowance

    _transactions.insert(
      0,
      TransactionItem(
        id: 'tx_${DateTime.now().millisecondsSinceEpoch}',
        title: 'Budget top-up',
        subtitle: 'Account funding',
        amount: amount,
        type: TransactionType.income,
        status: TransactionStatus.done,
        timeString: 'Just now',
        dateGroup: 'TODAY',
        category: 'Top-up',
        reference: 'TX-TOP-${DateTime.now().millisecondsSinceEpoch % 10000}',
      ),
    );

    notifyListeners();
  }

  void topUpSaveGoal(double amount) {
    _activeGoal = SaveGoal(
      id: _activeGoal.id,
      title: _activeGoal.title,
      subtitle: _activeGoal.subtitle,
      currentAmount: _activeGoal.currentAmount + amount,
      targetAmount: _activeGoal.targetAmount,
      unlockDate: _activeGoal.unlockDate,
      lockType: _activeGoal.lockType,
    );
    _totalSavedMonth += amount;
    _totalBalance -= amount;

    _transactions.insert(
      0,
      TransactionItem(
        id: 'tx_${DateTime.now().millisecondsSinceEpoch}',
        title: 'Goal save top-up',
        subtitle: 'Locked until target',
        amount: amount,
        type: TransactionType.save,
        status: TransactionStatus.done,
        timeString: 'Just now',
        dateGroup: 'TODAY',
        category: 'Savings',
        reference: 'TX-SAV-${DateTime.now().millisecondsSinceEpoch % 10000}',
      ),
    );

    notifyListeners();
  }
}
