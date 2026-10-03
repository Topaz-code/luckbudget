import '../savings_repository.dart';
import '../../config/policy_config.dart';

class MockSavingsRepository implements SavingsRepository {
  final List<SavingsLock> _locks = [
    SavingsLock(
      id: 'lock_001',
      title: 'Emergency Medical Fund',
      type: LockType.goal,
      targetAmount: 500000.0,
      currentBalance: 175000.0,
      accruedInterest: 9187.50,
      apyPercent: PolicyConfig.goalLockApyPercent,
      startDate: DateTime.now().subtract(const Duration(days: 60)),
      maturityDate: DateTime.now().add(const Duration(days: 120)),
    ),
    SavingsLock(
      id: 'lock_002',
      title: 'Q4 Rent Lock',
      type: LockType.period,
      targetAmount: 300000.0,
      currentBalance: 240000.0,
      accruedInterest: 14400.00,
      apyPercent: PolicyConfig.periodLockApyPercent,
      startDate: DateTime.now().subtract(const Duration(days: 45)),
      maturityDate: DateTime.now().add(const Duration(days: 45)),
    ),
    SavingsLock(
      id: 'lock_003',
      title: '365 Days Otis Safe',
      type: LockType.year,
      targetAmount: 1000000.0,
      currentBalance: 1000000.0,
      accruedInterest: 70000.00,
      apyPercent: PolicyConfig.yearLockApyPercent,
      startDate: DateTime.now().subtract(const Duration(days: 30)),
      maturityDate: DateTime.now().add(const Duration(days: 335)),
      isHardLocked: true, // First 90 days hard-locked
    ),
  ];

  @override
  Future<List<SavingsLock>> getActiveLocks() async {
    await Future.delayed(const Duration(milliseconds: 150));
    return _locks.where((l) => !l.isLiquidated).toList();
  }

  @override
  Future<SavingsLock?> getLockById(String id) async {
    await Future.delayed(const Duration(milliseconds: 100));
    try {
      return _locks.firstWhere((l) => l.id == id);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<SavingsLock> createLock({
    required String title,
    required LockType type,
    required double targetAmount,
    required double initialDeposit,
    required int durationDays,
  }) async {
    await Future.delayed(const Duration(milliseconds: 250));
    final apy = type == LockType.goal
        ? PolicyConfig.goalLockApyPercent
        : type == LockType.period
            ? PolicyConfig.periodLockApyPercent
            : PolicyConfig.yearLockApyPercent;

    final newLock = SavingsLock(
      id: 'lock_${DateTime.now().millisecondsSinceEpoch}',
      title: title,
      type: type,
      targetAmount: targetAmount,
      currentBalance: initialDeposit,
      accruedInterest: 0.0,
      apyPercent: apy,
      startDate: DateTime.now(),
      maturityDate: DateTime.now().add(Duration(days: durationDays)),
      isHardLocked: type == LockType.year && durationDays >= PolicyConfig.yearLockHardLockedDays,
    );
    _locks.insert(0, newLock);
    return newLock;
  }

  @override
  Future<LiquidationResult> liquidateLockEarly({
    required String lockId,
    required String reason,
    required String pin,
  }) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final index = _locks.indexWhere((l) => l.id == lockId);
    if (index == -1) {
      return const LiquidationResult(
        success: false,
        grossBalance: 0.0,
        penaltyAmount: 0.0,
        netPayout: 0.0,
        message: 'Lock not found.',
      );
    }

    final lock = _locks[index];
    final elapsedDays = DateTime.now().difference(lock.startDate).inDays;

    // Check Year Lock 90-day hard-lock rule
    if (lock.type == LockType.year && elapsedDays < PolicyConfig.yearLockHardLockedDays) {
      final daysRemaining = PolicyConfig.yearLockHardLockedDays - elapsedDays;
      return LiquidationResult(
        success: false,
        grossBalance: lock.currentBalance,
        penaltyAmount: 0.0,
        netPayout: 0.0,
        message: 'Year locks are hard-locked for the first 90 days. $daysRemaining days remaining before emergency unlock is available.',
      );
    }

    final gross = lock.currentBalance;
    final penalty = gross * PolicyConfig.earlyUnlockPenaltyPercent;
    final net = gross - penalty;

    _locks[index] = SavingsLock(
      id: lock.id,
      title: lock.title,
      type: lock.type,
      targetAmount: lock.targetAmount,
      currentBalance: 0.0,
      accruedInterest: 0.0,
      apyPercent: lock.apyPercent,
      startDate: lock.startDate,
      maturityDate: lock.maturityDate,
      isLiquidated: true,
      isHardLocked: false,
    );

    return LiquidationResult(
      success: true,
      grossBalance: gross,
      penaltyAmount: penalty,
      netPayout: net,
      message: 'Lock successfully liquidated. ₦${penalty.toStringAsFixed(0)} (5%) administrative liquidation fee deducted.',
    );
  }

  @override
  Future<void> depositToLock({required String lockId, required double amount}) async {
    await Future.delayed(const Duration(milliseconds: 150));
    final index = _locks.indexWhere((l) => l.id == lockId);
    if (index != -1) {
      final lock = _locks[index];
      _locks[index] = SavingsLock(
        id: lock.id,
        title: lock.title,
        type: lock.type,
        targetAmount: lock.targetAmount,
        currentBalance: lock.currentBalance + amount,
        accruedInterest: lock.accruedInterest,
        apyPercent: lock.apyPercent,
        startDate: lock.startDate,
        maturityDate: lock.maturityDate,
        isLiquidated: lock.isLiquidated,
        isHardLocked: lock.isHardLocked,
      );
    }
  }
}
