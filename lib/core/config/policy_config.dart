/// LockBudget Provisional Financial & Operational Policies
/// 
/// Isolates all business rules accepted at Phase 1 Checkpoint.
/// When real banking / compliance / finance partner specs arrive,
/// update values in this file without refactoring widget or domain logic.
class PolicyConfig {
  PolicyConfig._();

  // ─── 1. MIDNIGHT ROLLOVER POLICY ───────────────────────────────────────────
  /// When true, unspent daily allowance expires and sweeps to the savings vault
  /// at midnight (00:00), resetting today's allowance strictly to the base allocation.
  /// If false, unspent allowance rolls over into the next day's spending pool.
  static const bool sweepUnspentAllowanceToVaultAtMidnight = true;

  // ─── 2. EARLY LIQUIDATION ("BREAK LOCK") POLICY ─────────────────────────────
  /// Administrative liquidation fee percentage charged when a user prematurely
  /// breaks a Goal or Period savings lock prior to maturity.
  static const double earlyUnlockPenaltyPercent = 0.05; // 5%

  /// Minimum number of days a 365-day Year Lock is strictly non-liquidatable.
  static const int yearLockHardLockedDays = 90;

  /// Maximum permitted emergency fund releases per calendar month.
  static const int maxEmergencyWithdrawalsPerMonth = 2;

  /// Minimum character length for emergency withdrawal reason justification.
  static const int minEmergencyReasonLength = 5;

  /// Security lockout duration after 5 consecutive failed PIN attempts (in minutes).
  static const int pinLockoutDurationMinutes = 15;
  static const int maxFailedPinAttempts = 5;

  // ─── 3. QUICK SPEND SETTLEMENT POLICY ──────────────────────────────────────
  /// Settlement mode for Quick Spend releases.
  /// Quick Spend releases execute as internal ledger debits against the user's
  /// daily allowance and category budget. Liquid payouts to external commercial
  /// banks occur through the distinct Withdrawal Flow.
  static const bool quickSpendInstantInternalDebit = true;

  // ─── 4. KYC LIMITS (CBN TIER 1 DEFAULTS) ───────────────────────────────────
  /// Tier 1: Phone number & basic profile.
  static const double tier1MaxSingleTopUpNaira = 50000.0;
  static const double tier1MaxCumulativeBalanceNaira = 300000.0;
  static const double tier1MaxDailySpendNaira = 10000.0;

  /// Tier 2: BVN / NIN verified.
  static const double tier2MaxSingleTopUpNaira = 200000.0;
  static const double tier2MaxCumulativeBalanceNaira = 500000.0;
  static const double tier2MaxDailySpendNaira = 100000.0;

  /// Tier 3: Verified residential address & government ID.
  static const double tier3MaxSingleTopUpNaira = 1000000.0;
  static const double tier3MaxCumulativeBalanceNaira = double.infinity;
  static const double tier3MaxDailySpendNaira = 500000.0;

  // ─── 5. SAVINGS LOCK ANNUALIZED INTEREST RATES (APY / P.A.) ────────────────
  /// Annual interest rate for "Save till goal" (flexible deposit).
  static const double goalLockApyPercent = 10.5; // 10.5% p.a.

  /// Annual interest rate for "Save for a period" (3 to 6 months fixed).
  static const double periodLockApyPercent = 12.0; // 12.0% p.a.

  /// Annual interest rate for "Save for a year" (365 days fixed).
  static const double yearLockApyPercent = 14.0; // 14.0% p.a.
}
