import { calculateDashboardMetrics } from '../src/features/dashboard/calculations';
import type { Expense } from '../src/features/expenses/types';

const expense = (id: string, amountKobo: number, localDate: string): Expense => ({
  id,
  amountKobo,
  category: 'miscellaneous',
  note: '',
  localDate,
  month: localDate.slice(0, 7),
  createdAt: `${localDate}T12:00:00.000Z`,
  syncStatus: 'synced',
});

describe('dashboard metrics', () => {
  it('calculates daily and monthly progress from actual expenses', () => {
    const metrics = calculateDashboardMetrics(
      3_100_000,
      [expense('today', 40_000, '2026-07-21'), expense('earlier', 60_000, '2026-07-04')],
      new Date(2026, 6, 21, 12),
    );

    expect(metrics.dailyAllowanceKobo).toBe(100_000);
    expect(metrics.todaySpentKobo).toBe(40_000);
    expect(metrics.dailyRemainingKobo).toBe(60_000);
    expect(metrics.dailySpentRatio).toBe(0.4);
    expect(metrics.monthSpentKobo).toBe(100_000);
    expect(metrics.monthlyRemainingKobo).toBe(3_000_000);
    expect(metrics.dayOfMonth).toBe(21);
    expect(metrics.daysInMonth).toBe(31);
  });

  it('never displays negative remaining balances or progress above 100%', () => {
    const metrics = calculateDashboardMetrics(
      310_000,
      [expense('overspend', 500_000, '2026-07-21')],
      new Date(2026, 6, 21, 12),
    );

    expect(metrics.dailyRemainingKobo).toBe(0);
    expect(metrics.monthlyRemainingKobo).toBe(0);
    expect(metrics.dailySpentRatio).toBe(1);
    expect(metrics.budgetRemainingRatio).toBe(0);
  });
});
