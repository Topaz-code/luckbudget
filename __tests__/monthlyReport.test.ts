import { calculateBudgetTotals, inputsToAmounts } from '../src/features/budget/calculations';
import { emptyBudgetInputs } from '../src/features/budget/budgetFields';
import type { EmergencyWithdrawal } from '../src/features/emergency/types';
import type { Expense } from '../src/features/expenses/types';
import { calculateMonthlyReport } from '../src/features/reports/calculations';

const expense = (
  id: string,
  amountKobo: number,
  category: Expense['category'],
  localDate: string,
): Expense => ({
  id,
  amountKobo,
  category,
  note: '',
  localDate,
  month: localDate.slice(0, 7),
  createdAt: `${localDate}T12:00:00.000Z`,
  syncStatus: 'synced',
});

const withdrawal: EmergencyWithdrawal = {
  id: 'withdrawal-1',
  amountKobo: 200_000,
  reason: 'Urgent medication',
  month: '2026-07',
  createdAt: '2026-07-10T12:00:00.000Z',
  status: 'approved_virtual',
};

describe('monthly report', () => {
  const inputs = emptyBudgetInputs();
  inputs.primaryIncome = '100000';
  inputs.food = '30000';
  inputs.emergencySavings = '10000';
  inputs.fixedSavings = '10000';
  inputs.miscellaneous = '10000';
  const amounts = inputsToAmounts(inputs);
  const budget = { ...amounts, ...calculateBudgetTotals(amounts) };

  const report = calculateMonthlyReport({
    budget,
    expenses: [
      expense('food', 3_500_000, 'food', '2026-07-05'),
      expense('misc', 500_000, 'miscellaneous', '2026-07-12'),
    ],
    todos: [],
    withdrawals: [withdrawal],
    preference: 'reset',
    monthDate: new Date(2026, 6, 1, 12),
    now: new Date(2026, 6, 21, 12),
  });

  it('compares actual and planned spending by category', () => {
    const food = report.categoryReports.find(({ category }) => category === 'food');
    expect(food).toMatchObject({
      plannedKobo: 3_000_000,
      spentKobo: 3_500_000,
      varianceKobo: -500_000,
    });
    expect(report.totalSpentKobo).toBe(4_000_000);
  });

  it('calculates saved money and emergency usage', () => {
    expect(report.emergencyUsedKobo).toBe(200_000);
    expect(report.emergencyBalanceKobo).toBe(800_000);
    expect(report.emergencyWithdrawalCount).toBe(1);
    expect(report.amountSavedKobo).toBe(2_000_000);
  });

  it('counts within-budget days and produces tailored suggestions', () => {
    expect(report.elapsedDays).toBe(21);
    expect(report.withinBudgetDays).toBe(19);
    expect(report.suggestions.join(' ')).toContain('Food exceeded');
    expect(report.suggestions.join(' ')).toContain('emergency withdrawal');
  });
});
