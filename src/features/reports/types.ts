import type { ExpenseCategory } from '../expenses/types';

export interface CategoryReport {
  category: ExpenseCategory;
  label: string;
  plannedKobo: number;
  spentKobo: number;
  varianceKobo: number;
  progress: number;
}

export interface MonthlyReportMetrics {
  month: string;
  categoryReports: CategoryReport[];
  totalPlannedSpendingKobo: number;
  totalSpentKobo: number;
  amountSavedKobo: number;
  fixedSavingsKobo: number;
  emergencyBalanceKobo: number;
  emergencyUsedKobo: number;
  emergencyWithdrawalCount: number;
  withinBudgetDays: number;
  elapsedDays: number;
  suggestions: string[];
}
