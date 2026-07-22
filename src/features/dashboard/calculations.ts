import type { Expense } from '../expenses/types';
import { getDayOfMonth, getDaysInMonth, getLocalDateKey, getMonthKey } from '../../utils/date';

export interface DashboardMetrics {
  dailyAllowanceKobo: number;
  todaySpentKobo: number;
  dailyRemainingKobo: number;
  dailySpentRatio: number;
  monthSpentKobo: number;
  monthlyRemainingKobo: number;
  budgetRemainingRatio: number;
  daysElapsedRatio: number;
  dayOfMonth: number;
  daysInMonth: number;
}

export const clampRatio = (value: number): number => Math.min(1, Math.max(0, value));

export const calculateDashboardMetrics = (
  flexibleBudgetKobo: number,
  expenses: Expense[],
  date = new Date(),
): DashboardMetrics => {
  const todayKey = getLocalDateKey(date);
  const monthKey = getMonthKey(date);
  const daysInMonth = getDaysInMonth(date);
  const dayOfMonth = getDayOfMonth(date);
  const todaySpentKobo = expenses
    .filter((expense) => expense.localDate === todayKey)
    .reduce((sum, expense) => sum + expense.amountKobo, 0);
  const monthSpentKobo = expenses
    .filter((expense) => expense.month === monthKey)
    .reduce((sum, expense) => sum + expense.amountKobo, 0);
  const dailyAllowanceKobo = Math.floor(flexibleBudgetKobo / daysInMonth);
  const monthlyRemainingKobo = Math.max(0, flexibleBudgetKobo - monthSpentKobo);

  return {
    dailyAllowanceKobo,
    todaySpentKobo,
    dailyRemainingKobo: Math.max(0, dailyAllowanceKobo - todaySpentKobo),
    dailySpentRatio:
      dailyAllowanceKobo > 0 ? clampRatio(todaySpentKobo / dailyAllowanceKobo) : 0,
    monthSpentKobo,
    monthlyRemainingKobo,
    budgetRemainingRatio:
      flexibleBudgetKobo > 0 ? clampRatio(monthlyRemainingKobo / flexibleBudgetKobo) : 0,
    daysElapsedRatio: dayOfMonth / daysInMonth,
    dayOfMonth,
    daysInMonth,
  };
};
