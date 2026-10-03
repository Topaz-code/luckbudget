import '../budget_repository.dart';
import '../../config/policy_config.dart';

class MockBudgetRepository implements BudgetRepository {
  MonthlyBudget _budget = MonthlyBudget(
    totalIncome: 150000.0,
    dailyAllowance: 1000.0,
    todaySpent: 0.0,
    allocations: const [
      BudgetAllocation(
        categoryId: 'food',
        categoryName: 'Food & Groceries',
        allocatedAmount: 45000.0,
        spentAmount: 12500.0,
      ),
      BudgetAllocation(
        categoryId: 'transport',
        categoryName: 'Transport & Fuel',
        allocatedAmount: 25000.0,
        spentAmount: 8000.0,
      ),
      BudgetAllocation(
        categoryId: 'internet',
        categoryName: 'Internet & Data',
        allocatedAmount: 15000.0,
        spentAmount: 6000.0,
      ),
      BudgetAllocation(
        categoryId: 'utilities',
        categoryName: 'Electricity & Utility',
        allocatedAmount: 20000.0,
        spentAmount: 5000.0,
      ),
      BudgetAllocation(
        categoryId: 'savings',
        categoryName: 'Automated Lock Vault',
        allocatedAmount: 45000.0,
        spentAmount: 45000.0,
      ),
    ],
    lastResetDate: DateTime.now(),
  );

  @override
  Future<MonthlyBudget> getMonthlyBudget() async {
    await Future.delayed(const Duration(milliseconds: 150));
    return _budget;
  }

  @override
  Future<void> saveMonthlyBudget({
    required double totalIncome,
    required List<BudgetAllocation> allocations,
  }) async {
    await Future.delayed(const Duration(milliseconds: 200));
    final daily = (totalIncome * 0.20) / 30.0;
    _budget = MonthlyBudget(
      totalIncome: totalIncome,
      dailyAllowance: daily,
      todaySpent: 0.0,
      allocations: allocations,
      lastResetDate: DateTime.now(),
    );
  }

  @override
  Future<void> recordSpend({
    required String categoryId,
    required double amount,
    required String merchant,
  }) async {
    await Future.delayed(const Duration(milliseconds: 100));
    final updatedAllocations = _budget.allocations.map((alloc) {
      if (alloc.categoryId == categoryId) {
        return BudgetAllocation(
          categoryId: alloc.categoryId,
          categoryName: alloc.categoryName,
          allocatedAmount: alloc.allocatedAmount,
          spentAmount: alloc.spentAmount + amount,
        );
      }
      return alloc;
    }).toList();

    _budget = MonthlyBudget(
      totalIncome: _budget.totalIncome,
      dailyAllowance: _budget.dailyAllowance,
      todaySpent: _budget.todaySpent + amount,
      allocations: updatedAllocations,
      lastResetDate: _budget.lastResetDate,
    );
  }

  @override
  Future<double> sweepUnspentAllowanceToVault() async {
    if (!PolicyConfig.sweepUnspentAllowanceToVaultAtMidnight) {
      return 0.0;
    }
    final unspent = _budget.todayRemaining;
    _budget = MonthlyBudget(
      totalIncome: _budget.totalIncome,
      dailyAllowance: _budget.dailyAllowance,
      todaySpent: 0.0,
      allocations: _budget.allocations,
      lastResetDate: DateTime.now(),
    );
    return unspent;
  }
}
