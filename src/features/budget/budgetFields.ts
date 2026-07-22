import type {
  BudgetFieldDefinition,
  BudgetInputValues,
  FixedExpenseFieldKey,
  IncomeFieldKey,
  VariableExpenseFieldKey,
} from './types';

export const incomeFields: ReadonlyArray<
  BudgetFieldDefinition & { key: IncomeFieldKey }
> = [
  {
    key: 'primaryIncome',
    label: 'Income',
    description: 'Primary job or stipend',
    hint: 'Enter your expected take-home income for this month.',
  },
  {
    key: 'studentAllowance',
    label: 'Student Allowance',
    description: 'From parents, guardian, or school',
    hint: 'Include only allowance you reasonably expect to receive this month.',
  },
  {
    key: 'incomeGift',
    label: 'Gift',
    description: 'One-off or recurring gifts',
    hint: 'Money given to you that is available for this month’s plan.',
  },
];

export const fixedExpenseFields: ReadonlyArray<
  BudgetFieldDefinition & { key: FixedExpenseFieldKey }
> = [
  {
    key: 'food',
    label: 'Food',
    description: 'Groceries and regular meals',
    hint: 'Average Nigerian student spends ₦15,000–₦30,000/month.',
  },
  {
    key: 'internet',
    label: 'Internet',
    description: 'Broadband or phone plan',
    hint: 'Include data bundles, Wi-Fi subscriptions, and recurring airtime needs.',
  },
  {
    key: 'transportation',
    label: 'Transportation',
    description: 'Bus, keke, ride-share, or fuel',
    hint: 'Estimate your regular trips for school, work, worship, and errands.',
  },
  {
    key: 'netflix',
    label: 'Netflix',
    description: 'Or any streaming subscription',
    hint: 'Include Netflix or other monthly entertainment subscriptions.',
  },
  {
    key: 'debt',
    label: 'Debt',
    description: 'Loan or minimum payments',
    hint: 'Enter repayments due this month, including minimum loan payments.',
  },
  {
    key: 'emergencySavings',
    label: 'Emergency Savings',
    description: 'Amount locked for emergencies monthly',
    hint: 'Choose an amount you can lock and access only for genuine emergencies.',
  },
  {
    key: 'fixedSavings',
    label: 'Fixed Savings',
    description: 'Goal-based savings, e.g. tuition or gadget',
    hint: 'Set aside money for a specific goal before planning daily spending.',
  },
  {
    key: 'religiousContribution',
    label: 'Religious Contribution',
    description: 'Tithe, sadaqah, or donations',
    hint: 'Plan recurring faith-based giving and charitable donations here.',
  },
];

export const variableExpenseFields: ReadonlyArray<
  BudgetFieldDefinition & { key: VariableExpenseFieldKey }
> = [
  {
    key: 'miscellaneous',
    label: 'Miscellaneous',
    description: 'Snacks, cafés, or impulse buys',
    hint: 'Keep a realistic buffer for small expenses that do not fit elsewhere.',
  },
  {
    key: 'variableGift',
    label: 'Gift',
    description: 'Money planned to give out that month',
    hint: 'Budget for birthdays, support to friends, and other personal gifts.',
  },
];

export const allBudgetFields = [
  ...incomeFields,
  ...fixedExpenseFields,
  ...variableExpenseFields,
] as const;

export const emptyBudgetInputs = (): BudgetInputValues =>
  Object.fromEntries(allBudgetFields.map(({ key }) => [key, ''])) as BudgetInputValues;
