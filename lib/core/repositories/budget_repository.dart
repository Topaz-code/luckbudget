class BudgetAllocation {
  final String categoryId;
  final String categoryName;
  final double allocatedAmount;
  final double spentAmount;

  const BudgetAllocation({
    required this.categoryId,
    required this.categoryName,
    required this.allocatedAmount,
    this.spentAmount = 0.0,
  });

  double get remaining => allocatedAmount - spentAmount;
  double get progress => allocatedAmount > 0 ? (spentAmount / allocatedAmount).clamp(0.0, 1.0) : 0.0;
}

class MonthlyBudget {
  final double totalIncome;
  final double dailyAllowance;
  final double todaySpent;
  final List<BudgetAllocation> allocations;
  final DateTime lastResetDate;

  const MonthlyBudget({
    required this.totalIncome,
    required this.dailyAllowance,
    required this.todaySpent,
    required this.allocations,
    required this.lastResetDate,
  });

  double get todayRemaining => (dailyAllowance - todaySpent).clamp(0.0, dailyAllowance);
  double get dailyProgress => dailyAllowance > 0 ? (todaySpent / dailyAllowance).clamp(0.0, 1.0) : 0.0;
}

/// Abstract contract for Budget operations.
/// All future backend / Monnify / custom ledger APIs plug into this interface.
abstract class BudgetRepository {
  Future<MonthlyBudget> getMonthlyBudget();
  Future<void> saveMonthlyBudget({
    required double totalIncome,
    required List<BudgetAllocation> allocations,
  });
  Future<void> recordSpend({
    required String categoryId,
    required double amount,
    required String merchant,
  });
  Future<double> sweepUnspentAllowanceToVault();
}
