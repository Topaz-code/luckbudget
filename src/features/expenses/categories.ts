import type { ExpenseCategory } from './types';

export interface ExpenseCategoryOption {
  key: ExpenseCategory;
  label: string;
  icon: string;
}

export const expenseCategories: readonly ExpenseCategoryOption[] = [
  { key: 'food', label: 'Food', icon: 'food-outline' },
  { key: 'transportation', label: 'Transport', icon: 'bus' },
  { key: 'internet', label: 'Internet', icon: 'wifi' },
  { key: 'miscellaneous', label: 'Miscellaneous', icon: 'dots-horizontal-circle-outline' },
  { key: 'gift', label: 'Gift', icon: 'gift-outline' },
  { key: 'netflix', label: 'Streaming', icon: 'television-play' },
  { key: 'debt', label: 'Debt', icon: 'cash-clock' },
  { key: 'religiousContribution', label: 'Contribution', icon: 'hand-heart-outline' },
] as const;

export const getExpenseCategoryLabel = (category: ExpenseCategory): string =>
  expenseCategories.find(({ key }) => key === category)?.label ?? category;
