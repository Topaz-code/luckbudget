import AsyncStorage from '@react-native-async-storage/async-storage';
import { allBudgetFields } from '../../features/budget/budgetFields';
import type { BudgetAmounts, BudgetTotals } from '../../features/budget/types';
import { getMonthlyBudget } from '../firebase/budgetRepository';
import { useBudgetStore } from '../../store/budgetStore';
import { useDailyLockStore } from '../../store/dailyLockStore';
import { useEmergencyStore } from '../../store/emergencyStore';
import { useExpenseStore } from '../../store/expenseStore';
import { useTodoStore } from '../../store/todoStore';

const LAST_UID_KEY = 'lockbudget.active-firebase-uid';

const clearLocalUserData = (): void => {
  useBudgetStore.getState().clearBudget();
  useExpenseStore.getState().clearExpenses();
  useTodoStore.getState().clearTodos();
  useEmergencyStore.getState().clearEmergencyData();
  useDailyLockStore.getState().resetPreference();
};

/** Prevents one signed-in user's device cache from leaking into another account. */
export const prepareUserDataSession = async (uid: string): Promise<void> => {
  const previousUid = await AsyncStorage.getItem(LAST_UID_KEY);
  if (previousUid && previousUid !== uid) clearLocalUserData();
  await AsyncStorage.setItem(LAST_UID_KEY, uid);

  const cloudBudget = await getMonthlyBudget().catch(() => null);
  if (!cloudBudget) return;
  const amounts = Object.fromEntries(
    allBudgetFields.map(({ key }) => [key, cloudBudget[key]]),
  ) as BudgetAmounts;
  const totals: BudgetTotals = {
    totalIncome: cloudBudget.totalIncome,
    totalFixedExpenses: cloudBudget.totalFixedExpenses,
    totalVariableExpenses: cloudBudget.totalVariableExpenses,
    totalExpenses: cloudBudget.totalExpenses,
    remaining: cloudBudget.remaining,
  };
  useBudgetStore.getState().saveBudget(amounts, totals);
};
