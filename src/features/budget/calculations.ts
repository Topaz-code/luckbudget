import { fixedExpenseFields, incomeFields, variableExpenseFields } from './budgetFields';
import type {
  BudgetAmounts,
  BudgetFieldKey,
  BudgetInputValues,
  BudgetTotals,
} from './types';

const MAX_NAIRA = 1_000_000_000;

/** Keeps only a valid, non-negative Naira amount with at most two decimal places. */
export const sanitizeNairaInput = (input: string): string => {
  if (input.trim().startsWith('-')) return '';
  const cleaned = input.replace(/[,₦\s]/g, '').replace(/[^\d.]/g, '');
  const [integerPart = '', ...decimalParts] = cleaned.split('.');
  const integerDigits = integerPart.replace(/^0+(?=\d)/, '').slice(0, 10);
  const integerValue = Math.min(Number(integerDigits || 0), MAX_NAIRA);
  const safeInteger = integerDigits === '' ? '' : String(integerValue);

  if (decimalParts.length === 0) return safeInteger;
  const decimals = decimalParts.join('').slice(0, 2);
  return `${safeInteger || '0'}.${decimals}`;
};

export const formatEditableNaira = (value: string): string => {
  if (!value) return '';
  const [integer = '0', decimals] = value.split('.');
  const formattedInteger = Number(integer || 0).toLocaleString('en-NG');
  return decimals === undefined ? formattedInteger : `${formattedInteger}.${decimals}`;
};

export const nairaInputToKobo = (value: string): number => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.round(amount * 100);
};

export const koboToNairaInput = (kobo: number): string => {
  if (!kobo) return '';
  const naira = kobo / 100;
  return Number.isInteger(naira) ? String(naira) : naira.toFixed(2).replace(/0$/, '');
};

const sumFields = (
  amounts: BudgetAmounts,
  fields: ReadonlyArray<{ key: BudgetFieldKey }>,
): number => fields.reduce((total, field) => total + amounts[field.key], 0);

export const inputsToAmounts = (inputs: BudgetInputValues): BudgetAmounts =>
  Object.fromEntries(
    Object.entries(inputs).map(([key, value]) => [key, nairaInputToKobo(value)]),
  ) as BudgetAmounts;

export const calculateBudgetTotals = (amounts: BudgetAmounts): BudgetTotals => {
  const totalIncome = sumFields(amounts, incomeFields);
  const totalFixedExpenses = sumFields(amounts, fixedExpenseFields);
  const totalVariableExpenses = sumFields(amounts, variableExpenseFields);
  const totalExpenses = totalFixedExpenses + totalVariableExpenses;

  return {
    totalIncome,
    totalFixedExpenses,
    totalVariableExpenses,
    totalExpenses,
    remaining: totalIncome - totalExpenses,
  };
};
