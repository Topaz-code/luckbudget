import { calculateEmergencyFundMetrics } from '../src/features/emergency/calculations';
import type { EmergencyWithdrawal } from '../src/features/emergency/types';

const withdrawal = (
  id: string,
  amountKobo: number,
  month: string,
  status: EmergencyWithdrawal['status'] = 'approved_virtual',
): EmergencyWithdrawal => ({
  id,
  amountKobo,
  reason: 'Urgent medical transport',
  month,
  createdAt: '2026-07-21T12:00:00.000Z',
  status,
});

describe('emergency fund calculations', () => {
  it('reduces balance and counts successful monthly withdrawals', () => {
    const metrics = calculateEmergencyFundMetrics(
      100_000,
      [
        withdrawal('one', 25_000, '2026-07'),
        withdrawal('other-month', 10_000, '2026-06'),
        withdrawal('failed', 20_000, '2026-07', 'failed'),
        withdrawal('reversed', 20_000, '2026-07', 'reversed'),
      ],
      2,
      '2026-07',
    );

    expect(metrics.withdrawnKobo).toBe(25_000);
    expect(metrics.balanceKobo).toBe(75_000);
    expect(metrics.usedCount).toBe(1);
    expect(metrics.withdrawalsLeft).toBe(1);
    expect(metrics.limitReached).toBe(false);
  });

  it('enforces the configured monthly request count', () => {
    const metrics = calculateEmergencyFundMetrics(
      100_000,
      [withdrawal('one', 20_000, '2026-07'), withdrawal('two', 20_000, '2026-07')],
      2,
      '2026-07',
    );

    expect(metrics.usedCount).toBe(2);
    expect(metrics.withdrawalsLeft).toBe(0);
    expect(metrics.limitReached).toBe(true);
  });

  it('never returns a negative visible balance', () => {
    const metrics = calculateEmergencyFundMetrics(
      10_000,
      [withdrawal('one', 12_000, '2026-07')],
      2,
      '2026-07',
    );

    expect(metrics.balanceKobo).toBe(0);
  });
});
