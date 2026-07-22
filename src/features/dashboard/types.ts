import type { ExpenseCategory } from '../expenses/types';

export interface TodoReminder {
  id: string;
  title: string;
  estimatedCostKobo: number;
  category: ExpenseCategory;
  scheduledDate: string;
}

export interface WalletSnapshot {
  emergencyBalanceKobo: number;
  fixedSavingsBalanceKobo: number;
}
