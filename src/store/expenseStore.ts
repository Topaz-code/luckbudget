import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Expense } from '../features/expenses/types';

interface ExpenseState {
  expenses: Expense[];
  hasHydrated: boolean;
  hydrationError: string | null;
  upsertExpense: (expense: Expense) => void;
  upsertExpenses: (expenses: Expense[]) => void;
  markSynced: (id: string) => void;
  clearExpenses: () => void;
  finishHydration: (error?: unknown) => void;
}

const mergeExpenses = (current: Expense[], incoming: Expense[]): Expense[] => {
  const byId = new Map(current.map((expense) => [expense.id, expense]));
  incoming.forEach((expense) => byId.set(expense.id, expense));
  return [...byId.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set) => ({
      expenses: [],
      hasHydrated: false,
      hydrationError: null,
      upsertExpense: (expense) =>
        set((state) => ({ expenses: mergeExpenses(state.expenses, [expense]) })),
      upsertExpenses: (expenses) =>
        set((state) => ({ expenses: mergeExpenses(state.expenses, expenses) })),
      markSynced: (id) =>
        set((state) => ({
          expenses: state.expenses.map((expense) =>
            expense.id === id ? { ...expense, syncStatus: 'synced' } : expense,
          ),
        })),
      clearExpenses: () => set({ expenses: [] }),
      finishHydration: (error) =>
        set({
          hasHydrated: true,
          hydrationError: error instanceof Error ? error.message : error ? String(error) : null,
        }),
    }),
    {
      name: 'lockbudget-expenses-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ expenses }) => ({ expenses }),
      onRehydrateStorage: () => (state, error) => state?.finishHydration(error),
    },
  ),
);
