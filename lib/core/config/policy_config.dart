/// LockBudget Provisional Financial & Operational Policies
/// 
/// Isolates all business rules accepted at Phase 1 Checkpoint.
/// When real banking / compliance / finance partner specs arrive,
/// update values in this file without refactoring widget or domain logic.
class PolicyConfig {
  PolicyConfig._();

  // ─── 1. MIDNIGHT ROLLOVER POLICY ───────────────────────────────────────────
  /// [PROVISIONAL] Unspent daily allowance sweeps to the savings vault at midnight (00:00).
  /// Each new day strictly resets to the base daily allowance.
  static const bool sweepUnspentAllowanceToVaultAtMidnight = true; // PROVISIONAL

  // ─── 2. EARLY LIQUIDATION ("BREAK LOCK") POLICY ─────────────────────────────
  /// [PROVISIONAL] Administrative liquidation penalty (5%) charged when a user prematurely
  /// breaks a Goal or Period savings lock via the 4-step emergency flow with PIN challenge.
  static const double earlyUnlockPenaltyPercent = 0.05; // PROVISIONAL (5%)

  /// [PROVISIONAL] 365-day Year Locks are strictly hard-locked for the first 90 days.
  static const int yearLockHardLockedDays = 90; // PROVISIONAL

  /// [PROVISIONAL] Maximum permitted emergency fund releases per calendar month.
  static const int maxEmergencyWithdrawalsPerMonth = 2; // PROVISIONAL

  /// [PROVISIONAL] Minimum character length for emergency withdrawal reason justification.
  static const int minEmergencyReasonLength = 5; // PROVISIONAL

  /// [PROVISIONAL] Security lockout duration after 5 consecutive failed PIN attempts (in minutes).
  static const int pinLockoutDurationMinutes = 15; // PROVISIONAL
  static const int maxFailedPinAttempts = 5; // PROVISIONAL

  // ─── 3. QUICK SPEND SETTLEMENT POLICY ──────────────────────────────────────
  /// [PROVISIONAL] Quick Spend "Release" performs an instant internal ledger debit.
  /// Liquid payouts to external commercial banks must go through the separate Withdrawal Flow.
  static const bool quickSpendInstantInternalDebit = true; // PROVISIONAL

  // ─── 4. KYC LIMITS (CBN TIER 1 DEFAULTS) ───────────────────────────────────
  /// [PROVISIONAL] Tier 1: ₦50,000 max single top-up, ₦300,000 balance cap, ₦10,000 daily spend.
  /// BVN/NIN verification unlocks higher tiers.
  static const double tier1MaxSingleTopUpNaira = 50000.0; // PROVISIONAL
  static const double tier1MaxCumulativeBalanceNaira = 300000.0; // PROVISIONAL
  static const double tier1MaxDailySpendNaira = 10000.0; // PROVISIONAL

  /// [PROVISIONAL] Tier 2: BVN / NIN verified.
  static const double tier2MaxSingleTopUpNaira = 200000.0; // PROVISIONAL
  static const double tier2MaxCumulativeBalanceNaira = 500000.0; // PROVISIONAL
  static const double tier2MaxDailySpendNaira = 100000.0; // PROVISIONAL

  /// [PROVISIONAL] Tier 3: Verified residential address & government ID.
  static const double tier3MaxSingleTopUpNaira = 1000000.0; // PROVISIONAL
  static const double tier3MaxCumulativeBalanceNaira = double.infinity; // PROVISIONAL
  static const double tier3MaxDailySpendNaira = 500000.0; // PROVISIONAL

  // ─── 5. SAVINGS LOCK ANNUALIZED INTEREST RATES (APY / P.A.) ────────────────
  /// [PROVISIONAL] Save till Goal: 10.5% p.a.
  static const double goalLockApyPercent = 10.5; // PROVISIONAL (10.5% p.a.)

  /// [PROVISIONAL] Save for a Period: 12.0% p.a.
  static const double periodLockApyPercent = 12.0; // PROVISIONAL (12.0% p.a.)

  /// [PROVISIONAL] Save for a Year: 14.0% p.a.
  static const double yearLockApyPercent = 14.0; // PROVISIONAL (14.0% p.a.)
}
