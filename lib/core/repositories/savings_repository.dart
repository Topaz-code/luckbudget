enum LockType { goal, period, year }

class SavingsLock {
  final String id;
  final String title;
  final LockType type;
  final double targetAmount;
  final double currentBalance;
  final double accruedInterest;
  final double apyPercent;
  final DateTime startDate;
  final DateTime maturityDate;
  final bool isLiquidated;
  final bool isHardLocked;

  const SavingsLock({
    required this.id,
    required this.title,
    required this.type,
    required this.targetAmount,
    required this.currentBalance,
    required this.accruedInterest,
    required this.apyPercent,
    required this.startDate,
    required this.maturityDate,
    this.isLiquidated = false,
    this.isHardLocked = false,
  });

  double get progress => targetAmount > 0 ? (currentBalance / targetAmount).clamp(0.0, 1.0) : 0.0;
  bool get isMatured => DateTime.now().isAfter(maturityDate);
  int get daysRemaining => maturityDate.difference(DateTime.now()).inDays.clamp(0, 365);
}

class LiquidationResult {
  final bool success;
  final double grossBalance;
  final double penaltyAmount;
  final double netPayout;
  final String message;

  const LiquidationResult({
    required this.success,
    required this.grossBalance,
    required this.penaltyAmount,
    required this.netPayout,
    required this.message,
  });
}

abstract class SavingsRepository {
  Future<List<SavingsLock>> getActiveLocks();
  Future<SavingsLock?> getLockById(String id);
  Future<SavingsLock> createLock({
    required String title,
    required LockType type,
    required double targetAmount,
    required double initialDeposit,
    required int durationDays,
  });
  Future<LiquidationResult> liquidateLockEarly({
    required String lockId,
    required String reason,
    required String pin,
  });
  Future<void> depositToLock({
    required String lockId,
    required double amount,
  });
}
