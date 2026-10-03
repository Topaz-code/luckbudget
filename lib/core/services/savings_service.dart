import 'dart:async';
import '../../models/budget_models.dart';
import '../config/policy_config.dart';

abstract class SavingsService {
  Future<List<SaveGoal>> getActiveLocks();
  Future<SaveGoal> createGoalLock({
    required String title,
    required double targetAmount,
    required double initialDeposit,
    required String targetDate,
  });
  Future<SaveGoal> createPeriodLock({
    required String title,
    required double depositAmount,
    required int durationMonths,
  });
  Future<SaveGoal> createYearLock({
    required String title,
    required double depositAmount,
  });
  Future<SaveGoal> topUpGoal({
    required String goalId,
    required double amount,
  });
  Future<bool> emergencyBreakLock({
    required String goalId,
    required String reason,
    required String pin,
  });
}

class MockSavingsService implements SavingsService {
  final List<SaveGoal> _goals = [
    const SaveGoal(
      id: 'goal_1',
      title: 'Goal save',
      subtitle: 'Target savings vault',
      currentAmount: 18000.0,
      targetAmount: 40000.0,
      unlockDate: 'Nov 15, 2026',
      lockType: 'goal',
    ),
    const SaveGoal(
      id: 'year_1',
      title: 'Annual lock',
      subtitle: '365-day fixed vault',
      currentAmount: 120000.0,
      targetAmount: 120000.0,
      unlockDate: 'Oct 03, 2027',
      lockType: 'year',
    ),
  ];

  @override
  Future<List<SaveGoal>> getActiveLocks() async {
    await Future.delayed(const Duration(milliseconds: 400));
    return List.unmodifiable(_goals);
  }

  @override
  Future<SaveGoal> createGoalLock({
    required String title,
    required double targetAmount,
    required double initialDeposit,
    required String targetDate,
  }) async {
    await Future.delayed(const Duration(milliseconds: 700));
    final newGoal = SaveGoal(
      id: 'goal_${DateTime.now().millisecondsSinceEpoch}',
      title: title,
      subtitle: '${PolicyConfig.goalLockApyPercent}% p.a. Flexible Vault',
      currentAmount: initialDeposit,
      targetAmount: targetAmount,
      unlockDate: targetDate,
      lockType: 'goal',
    );
    _goals.add(newGoal);
    return newGoal;
  }

  @override
  Future<SaveGoal> createPeriodLock({
    required String title,
    required double depositAmount,
    required int durationMonths,
  }) async {
    await Future.delayed(const Duration(milliseconds: 700));
    final now = DateTime.now();
    final unlock = DateTime(now.year, now.month + durationMonths, now.day);
    final newGoal = SaveGoal(
      id: 'period_${DateTime.now().millisecondsSinceEpoch}',
      title: title,
      subtitle: '${PolicyConfig.periodLockApyPercent}% p.a. Fixed $durationMonths Months',
      currentAmount: depositAmount,
      targetAmount: depositAmount,
      unlockDate: '${unlock.month}/${unlock.day}/${unlock.year}',
      lockType: 'period',
    );
    _goals.add(newGoal);
    return newGoal;
  }

  @override
  Future<SaveGoal> createYearLock({
    required String title,
    required double depositAmount,
  }) async {
    await Future.delayed(const Duration(milliseconds: 700));
    final now = DateTime.now();
    final unlock = DateTime(now.year + 1, now.month, now.day);
    final newGoal = SaveGoal(
      id: 'year_${DateTime.now().millisecondsSinceEpoch}',
      title: title,
      subtitle: '${PolicyConfig.yearLockApyPercent}% p.a. Annual Vault',
      currentAmount: depositAmount,
      targetAmount: depositAmount,
      unlockDate: '${unlock.month}/${unlock.day}/${unlock.year}',
      lockType: 'year',
    );
    _goals.add(newGoal);
    return newGoal;
  }

  @override
  Future<SaveGoal> topUpGoal({
    required String goalId,
    required double amount,
  }) async {
    await Future.delayed(const Duration(milliseconds: 600));
    final index = _goals.indexWhere((g) => g.id == goalId);
    if (index == -1) throw Exception('Goal not found');

    final old = _goals[index];
    final updated = SaveGoal(
      id: old.id,
      title: old.title,
      subtitle: old.subtitle,
      currentAmount: old.currentAmount + amount,
      targetAmount: old.targetAmount,
      unlockDate: old.unlockDate,
      lockType: old.lockType,
    );
    _goals[index] = updated;
    return updated;
  }

  @override
  Future<bool> emergencyBreakLock({
    required String goalId,
    required String reason,
    required String pin,
  }) async {
    await Future.delayed(const Duration(milliseconds: 900));
    if (reason.length < PolicyConfig.minEmergencyReasonLength) {
      throw Exception('Emergency reason must be at least ${PolicyConfig.minEmergencyReasonLength} characters.');
    }
    _goals.removeWhere((g) => g.id == goalId);
    return true;
  }
}
