import type { MoneyKobo } from '../../types/domain';

export type IncomeFieldKey = 'primaryIncome' | 'studentAllowance' | 'incomeGift';

export type FixedExpenseFieldKey =
  | 'food'
  | 'internet'
  | 'transportation'
  | 'netflix'
  | 'debt'
  | 'emergencySavings'
  | 'fixedSavings'
  | 'religiousContribution';

export type VariableExpenseFieldKey = 'miscellaneous' | 'variableGift';

export type BudgetFieldKey =
  | IncomeFieldKey
  | FixedExpenseFieldKey
  | VariableExpenseFieldKey;

export type BudgetAmounts = Record<BudgetFieldKey, MoneyKobo>;
export type BudgetInputValues = Record<BudgetFieldKey, string>;

export interface BudgetTotals {
  totalIncome: MoneyKobo;
  totalFixedExpenses: MoneyKobo;
  totalVariableExpenses: MoneyKobo;
  totalExpenses: MoneyKobo;
  remaining: MoneyKobo;
}

export interface SavedBudget extends BudgetAmounts, BudgetTotals {
  updatedAt: string;
}

export interface BudgetFieldDefinition {
  key: BudgetFieldKey;
  label: string;
  description: string;
  hint: string;
}
