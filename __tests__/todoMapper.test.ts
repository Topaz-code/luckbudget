import { emptyBudgetInputs } from '../src/features/budget/budgetFields';
import { inputsToAmounts } from '../src/features/budget/calculations';
import type { Expense } from '../src/features/expenses/types';
import { calculateDailyLock } from '../src/features/expenses/dailyLock';
import {
  getCategoryAvailableKobo,
  getEligibleTodoReminders,
  getTodoReservations,
} from '../src/features/todos/calculations';
import type { BudgetTodo } from '../src/features/todos/types';

const todo = (overrides: Partial<BudgetTodo> = {}): BudgetTodo => ({
  id: 'task-1',
  title: 'Buy textbooks',
  notes: '',
  estimatedCostKobo: 5_500_00,
  category: 'miscellaneous',
  scheduledDate: '2026-07-21',
  deadlineDate: '2026-07-22',
  status: 'pending',
  notificationId: null,
  createdAt: '2026-07-20T12:00:00.000Z',
  updatedAt: '2026-07-20T12:00:00.000Z',
  syncStatus: 'synced',
  ...overrides,
});

const expense = (amountKobo: number): Expense => ({
  id: 'expense-1',
  amountKobo,
  category: 'miscellaneous',
  note: '',
  localDate: '2026-07-20',
  month: '2026-07',
  createdAt: '2026-07-20T12:00:00.000Z',
  syncStatus: 'synced',
});

describe('to-do budget mapper', () => {
  const inputs = emptyBudgetInputs();
  inputs.miscellaneous = '10000';
  const budget = inputsToAmounts(inputs);
  const date = new Date(2026, 6, 21, 12);

  it('reserves a scheduled task against that day’s allowance', () => {
    const task = todo({ estimatedCostKobo: 4_000 });
    const lock = calculateDailyLock(
      310_000,
      [],
      'reset',
      date,
      getTodoReservations([task]),
    );

    expect(lock.effectiveAllowanceKobo).toBe(10_000);
    expect(lock.reservedTodayKobo).toBe(4_000);
    expect(lock.remainingTodayKobo).toBe(6_000);
  });

  it('calculates category availability after logged spending', () => {
    expect(getCategoryAvailableKobo(budget, [expense(250_000)], 'miscellaneous', date)).toBe(
      750_000,
    );
  });

  it('only returns near-deadline tasks when both budgets are available', () => {
    const eligible = todo();
    const tooExpensive = todo({ id: 'task-2', estimatedCostKobo: 2_000_000 });
    const tooLate = todo({ id: 'task-3', deadlineDate: '2026-07-30' });

    const reminders = getEligibleTodoReminders({
      todos: [eligible, tooExpensive, tooLate],
      budget,
      expenses: [],
      availableDailyKobo: 600_000,
      date,
    });

    expect(reminders.map(({ id }) => id)).toEqual(['task-1']);
  });

  it('does not reserve cancelled tasks', () => {
    expect(getTodoReservations([todo({ status: 'cancelled' })])).toEqual([]);
  });
});
