import type { EmergencyWithdrawal } from './types';
import { getMonthKey } from '../../utils/date';

export interface EmergencyFundMetrics {
  withdrawnKobo: number;
  balanceKobo: number;
  usedCount: number;
  withdrawalsLeft: number;
  limitReached: boolean;
}

export const calculateEmergencyFundMetrics = (
  initialBalanceKobo: number,
  withdrawals: EmergencyWithdrawal[],
  maxWithdrawals: number,
  month = getMonthKey(),
): EmergencyFundMetrics => {
  const active = withdrawals.filter(
    (withdrawal) => withdrawal.month === month && !['failed', 'reversed'].includes(withdrawal.status),
  );
  const withdrawnKobo = active.reduce((sum, withdrawal) => sum + withdrawal.amountKobo, 0);
  const usedCount = active.length;

  return {
    withdrawnKobo,
    balanceKobo: Math.max(0, initialBalanceKobo - withdrawnKobo),
    usedCount,
    withdrawalsLeft: Math.max(0, maxWithdrawals - usedCount),
    limitReached: usedCount >= maxWithdrawals,
  };
};
