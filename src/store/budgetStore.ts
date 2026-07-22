import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { BudgetAmounts, BudgetTotals, SavedBudget } from '../features/budget/types';

interface BudgetState {
  budget: SavedBudget | null;
  hasHydrated: boolean;
  hydrationError: string | null;
  saveBudget: (amounts: BudgetAmounts, totals: BudgetTotals) => void;
  clearBudget: () => void;
  finishHydration: (error?: unknown) => void;
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set) => ({
      budget: null,
      hasHydrated: false,
      hydrationError: null,
      saveBudget: (amounts, totals) =>
        set({ budget: { ...amounts, ...totals, updatedAt: new Date().toISOString() } }),
      clearBudget: () => set({ budget: null }),
      finishHydration: (error) =>
        set({
          hasHydrated: true,
          hydrationError: error instanceof Error ? error.message : error ? String(error) : null,
        }),
    }),
    {
      name: 'lockbudget-budget-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ budget }) => ({ budget }),
      onRehydrateStorage: () => (state, error) => state?.finishHydration(error),
    },
  ),
);
