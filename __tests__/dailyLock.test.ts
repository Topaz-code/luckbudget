import { calculateDailyLock } from '../src/features/expenses/dailyLock';
import type { Expense } from '../src/features/expenses/types';

const expense = (id: string, amountKobo: number, localDate: string): Expense => ({
  id,
  amountKobo,
  category: 'food',
  note: '',
  localDate,
  month: localDate.slice(0, 7),
  createdAt: `${localDate}T12:00:00.000Z`,
  syncStatus: 'synced',
});

describe('daily spending lock', () => {
  const date = new Date(2026, 6, 21, 12);
  const expenses = [
    expense('prior', 150_000, '2026-07-20'),
    expense('today', 4_000, '2026-07-21'),
  ];

  it('carries prior unspent allocations when rollover is selected', () => {
    const result = calculateDailyLock(310_000, expenses, 'rollover', date);

    expect(result.baseDailyAllowanceKobo).toBe(10_000);
    expect(result.rolledOverKobo).toBe(50_000);
    expect(result.effectiveAllowanceKobo).toBe(60_000);
    expect(result.remainingTodayKobo).toBe(56_000);
    expect(result.isLocked).toBe(false);
  });

  it('discards prior unspent allocations when reset is selected', () => {
    const result = calculateDailyLock(310_000, expenses, 'reset', date);

    expect(result.rolledOverKobo).toBe(0);
    expect(result.effectiveAllowanceKobo).toBe(10_000);
    expect(result.remainingTodayKobo).toBe(6_000);
  });

  it('locks spending when the full daily allowance has been used', () => {
    const result = calculateDailyLock(
      310_000,
      [expense('today', 10_000, '2026-07-21')],
      'reset',
      date,
    );

    expect(result.remainingTodayKobo).toBe(0);
    expect(result.isLocked).toBe(true);
  });

  it('does not create fake rollover before a newly-created plan began', () => {
    const result = calculateDailyLock(
      310_000,
      [],
      'rollover',
      new Date(2026, 6, 21, 12),
      [],
      new Date(2026, 6, 21, 8),
    );

    expect(result.rolledOverKobo).toBe(0);
    expect(result.effectiveAllowanceKobo).toBe(10_000);
  });

  it('assigns integer-division remainder to the final day', () => {
    const result = calculateDailyLock(310_005, [], 'reset', new Date(2026, 6, 31, 12));

    expect(result.baseDailyAllowanceKobo).toBe(10_000);
    expect(result.effectiveAllowanceKobo).toBe(10_005);
  });
});
