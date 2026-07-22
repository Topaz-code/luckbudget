import type { MoneyKobo } from '../../types/domain';

export type ExpenseCategory =
  | 'food'
  | 'internet'
  | 'transportation'
  | 'netflix'
  | 'debt'
  | 'religiousContribution'
  | 'miscellaneous'
  | 'gift';

export interface Expense {
  id: string;
  amountKobo: MoneyKobo;
  category: ExpenseCategory;
  note: string;
  localDate: string;
  month: string;
  createdAt: string;
  syncStatus: 'pending' | 'synced';
}

export interface NewExpense {
  amountKobo: MoneyKobo;
  category: ExpenseCategory;
  note: string;
  spentAt?: Date;
}
