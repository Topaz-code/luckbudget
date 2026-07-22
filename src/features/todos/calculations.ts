import type { BudgetAmounts } from '../budget/types';
import type { Expense, ExpenseCategory } from '../expenses/types';
import type { TodoReservation } from '../expenses/dailyLock';
import type { BudgetTodo } from './types';
import { getLocalDateKey, getMonthKey } from '../../utils/date';

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const getCategoryPlannedKobo = (
  budget: BudgetAmounts,
  category: ExpenseCategory,
): number => {
  if (category === 'gift') return budget.variableGift;
  return budget[category];
};

export const getCategoryAvailableKobo = (
  budget: BudgetAmounts,
  expenses: Expense[],
  category: ExpenseCategory,
  date = new Date(),
): number => {
  const month = getMonthKey(date);
  const spent = expenses
    .filter((expense) => expense.month === month && expense.category === category)
    .reduce((sum, expense) => sum + expense.amountKobo, 0);
  return Math.max(0, getCategoryPlannedKobo(budget, category) - spent);
};

export const getTodoReservations = (todos: BudgetTodo[]): TodoReservation[] =>
  todos
    .filter((todo) => todo.status !== 'cancelled')
    .map((todo) => ({
      id: todo.id,
      scheduledDate: todo.scheduledDate,
      amountKobo: todo.estimatedCostKobo,
    }));

export const getEligibleTodoReminders = (input: {
  todos: BudgetTodo[];
  budget: BudgetAmounts;
  expenses: Expense[];
  availableDailyKobo: number;
  date?: Date;
}): BudgetTodo[] => {
  const date = input.date ?? new Date();
  const today = getLocalDateKey(date);
  const cutoff = getLocalDateKey(addDays(date, 2));

  return input.todos
    .filter(
      (todo) =>
        todo.status === 'pending' &&
        todo.deadlineDate >= today &&
        todo.deadlineDate <= cutoff &&
        todo.estimatedCostKobo <= input.availableDailyKobo &&
        todo.estimatedCostKobo <=
          getCategoryAvailableKobo(input.budget, input.expenses, todo.category, date),
    )
    .sort((a, b) => a.deadlineDate.localeCompare(b.deadlineDate));
};
