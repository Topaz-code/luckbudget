import {
  calculateBudgetTotals,
  inputsToAmounts,
  nairaInputToKobo,
  sanitizeNairaInput,
} from '../src/features/budget/calculations';
import { emptyBudgetInputs } from '../src/features/budget/budgetFields';

const createInputs = () => emptyBudgetInputs();

describe('budget calculations', () => {
  it('calculates income, fixed, variable, expenses, and remaining in kobo', () => {
    const inputs = createInputs();
    inputs.primaryIncome = '100000';
    inputs.studentAllowance = '20000';
    inputs.incomeGift = '5000';
    inputs.food = '30000';
    inputs.internet = '5000';
    inputs.miscellaneous = '10000';
    inputs.variableGift = '5000';

    const totals = calculateBudgetTotals(inputsToAmounts(inputs));

    expect(totals).toEqual({
      totalIncome: 12_500_000,
      totalFixedExpenses: 3_500_000,
      totalVariableExpenses: 1_500_000,
      totalExpenses: 5_000_000,
      remaining: 7_500_000,
    });
  });

  it('returns a negative remainder when expenses exceed income', () => {
    const inputs = createInputs();
    inputs.primaryIncome = '10000';
    inputs.food = '15000';

    expect(calculateBudgetTotals(inputsToAmounts(inputs)).remaining).toBe(-500_000);
  });
});

describe('Naira input validation', () => {
  it('removes letters, separators, and extra decimal precision', () => {
    expect(sanitizeNairaInput('₦12,ab345.678')).toBe('12345.67');
  });

  it('rejects negative values', () => {
    expect(sanitizeNairaInput('-5000')).toBe('');
  });

  it('converts Naira decimals to integer kobo', () => {
    expect(nairaInputToKobo('1250.50')).toBe(125_050);
  });
});
