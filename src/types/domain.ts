export type MoneyKobo = number;

export type BudgetCategory =
  | 'food'
  | 'internet'
  | 'transportation'
  | 'netflix'
  | 'debt'
  | 'emergencySavings'
  | 'fixedSavings'
  | 'religiousContribution'
  | 'miscellaneous'
  | 'gift';

export interface AsyncState {
  isLoading: boolean;
  error: string | null;
}
