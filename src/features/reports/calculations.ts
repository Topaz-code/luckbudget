import type { BudgetAmounts, BudgetTotals } from '../budget/types';
import type { EmergencyWithdrawal } from '../emergency/types';
import type { Expense, ExpenseCategory } from '../expenses/types';
import { calculateDailyLock, type DailyLockPreference } from '../expenses/dailyLock';
import { getTodoReservations } from '../todos/calculations';
import type { BudgetTodo } from '../todos/types';
import type { CategoryReport, MonthlyReportMetrics } from './types';
import { getDaysInMonth, getMonthKey } from '../../utils/date';

const categories: ReadonlyArray<{ category: ExpenseCategory; label: string }> = [
  { category: 'food', label: 'Food' },
  { category: 'transportation', label: 'Transport' },
  { category: 'internet', label: 'Internet' },
  { category: 'miscellaneous', label: 'Misc.' },
  { category: 'gift', label: 'Gifts' },
  { category: 'netflix', label: 'Streaming' },
  { category: 'debt', label: 'Debt' },
  { category: 'religiousContribution', label: 'Giving' },
];

type ReportBudget = BudgetAmounts & BudgetTotals;

const plannedForCategory = (budget: ReportBudget, category: ExpenseCategory): number =>
  category === 'gift' ? budget.variableGift : budget[category];

const dateForDay = (monthDate: Date, day: number): Date =>
  new Date(monthDate.getFullYear(), monthDate.getMonth(), day, 12);

export const calculateMonthlyReport = (input: {
  budget: ReportBudget;
  expenses: Expense[];
  todos: BudgetTodo[];
  withdrawals: EmergencyWithdrawal[];
  preference: DailyLockPreference;
  monthDate: Date;
  now?: Date;
}): MonthlyReportMetrics => {
  const now = input.now ?? new Date();
  const month = getMonthKey(input.monthDate);
  const currentMonth = getMonthKey(now);
  const monthExpenses = input.expenses.filter((expense) => expense.month === month);
  const successfulWithdrawals = input.withdrawals.filter(
    (withdrawal) => withdrawal.month === month && !['failed', 'reversed'].includes(withdrawal.status),
  );
  const emergencyUsedKobo = successfulWithdrawals.reduce(
    (sum, withdrawal) => sum + withdrawal.amountKobo,
    0,
  );
  const adjustedFlexibleKobo = input.budget.remaining + emergencyUsedKobo;
  const totalSpentKobo = monthExpenses.reduce((sum, expense) => sum + expense.amountKobo, 0);
  const emergencyBalanceKobo = Math.max(
    0,
    input.budget.emergencySavings - emergencyUsedKobo,
  );
  const flexibleUnspentKobo = Math.max(0, adjustedFlexibleKobo - totalSpentKobo);
  const amountSavedKobo =
    input.budget.fixedSavings + emergencyBalanceKobo + flexibleUnspentKobo;

  const categoryReports: CategoryReport[] = categories.map(({ category, label }) => {
    const plannedKobo = plannedForCategory(input.budget, category);
    const spentKobo = monthExpenses
      .filter((expense) => expense.category === category)
      .reduce((sum, expense) => sum + expense.amountKobo, 0);
    return {
      category,
      label,
      plannedKobo,
      spentKobo,
      varianceKobo: plannedKobo - spentKobo,
      progress: plannedKobo > 0 ? spentKobo / plannedKobo : spentKobo > 0 ? 1 : 0,
    };
  });

  const daysInMonth = getDaysInMonth(input.monthDate);
  const elapsedDays =
    month === currentMonth ? Math.min(now.getDate(), daysInMonth) : month < currentMonth ? daysInMonth : 0;
  const reservations = getTodoReservations(
    input.todos.filter((todo) => todo.scheduledDate.startsWith(month)),
  );
  let withinBudgetDays = 0;
  for (let day = 1; day <= elapsedDays; day += 1) {
    const lock = calculateDailyLock(
      adjustedFlexibleKobo,
      monthExpenses,
      input.preference,
      dateForDay(input.monthDate, day),
      reservations,
    );
    if (
      lock.spentTodayKobo + lock.reservedTodayKobo <= lock.effectiveAllowanceKobo
    ) {
      withinBudgetDays += 1;
    }
  }

  const suggestions: string[] = [];
  const overspent = categoryReports
    .filter(({ varianceKobo }) => varianceKobo < 0)
    .sort((a, b) => a.varianceKobo - b.varianceKobo);
  if (overspent[0]) {
    suggestions.push(
      `${overspent[0].label} exceeded its plan. Increase that category or set a smaller weekly cap next month.`,
    );
  }
  const savingsRate = input.budget.totalIncome > 0 ? amountSavedKobo / input.budget.totalIncome : 0;
  if (savingsRate < 0.1) {
    suggestions.push('Try moving at least 10% of next month’s income into fixed savings first.');
  }
  if (successfulWithdrawals.length > 0) {
    suggestions.push(
      `You used ${successfulWithdrawals.length} emergency withdrawal${successfulWithdrawals.length === 1 ? '' : 's'}. Rebuild the fund before increasing flexible spending.`,
    );
  }
  if (elapsedDays > 0 && withinBudgetDays / elapsedDays < 0.8) {
    suggestions.push('A daily-reset plan may help if rollover makes early-month spending too easy.');
  }
  if (suggestions.length === 0) {
    suggestions.push('Your plan is working well. Keep the same limits and raise savings slightly next month.');
  }

  return {
    month,
    categoryReports,
    totalPlannedSpendingKobo: categoryReports.reduce(
      (sum, category) => sum + category.plannedKobo,
      0,
    ),
    totalSpentKobo,
    amountSavedKobo,
    fixedSavingsKobo: input.budget.fixedSavings,
    emergencyBalanceKobo,
    emergencyUsedKobo,
    emergencyWithdrawalCount: successfulWithdrawals.length,
    withinBudgetDays,
    elapsedDays,
    suggestions: suggestions.slice(0, 4),
  };
};
