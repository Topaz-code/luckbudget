import * as Crypto from 'expo-crypto';
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import type { Expense, NewExpense } from '../../features/expenses/types';
import { getLocalDateKey, getMonthKey } from '../../utils/date';
import { ensureAnonymousSession } from './authService';
import { getFirebaseServices } from './client';
import type { CloudWriteResult } from './budgetRepository';
import { toAppServiceError } from './errors';

export const createExpense = (input: NewExpense): Expense => {
  const spentAt = input.spentAt ?? new Date();
  return {
    id: Crypto.randomUUID(),
    amountKobo: input.amountKobo,
    category: input.category,
    note: input.note.trim(),
    localDate: getLocalDateKey(spentAt),
    month: getMonthKey(spentAt),
    createdAt: spentAt.toISOString(),
    syncStatus: 'pending',
  };
};

export const saveExpenseToCloud = async (expense: Expense): Promise<CloudWriteResult> => {
  const services = getFirebaseServices();
  if (!services) return { status: 'not-configured' };

  try {
    const user = services.auth.currentUser ?? (await ensureAnonymousSession());
    await setDoc(doc(services.db, 'users', user.uid, 'expenses', expense.id), {
      amountKobo: expense.amountKobo,
      category: expense.category,
      note: expense.note,
      localDate: expense.localDate,
      month: expense.month,
      currency: 'NGN',
      clientCreatedAt: expense.createdAt,
      createdAt: serverTimestamp(),
    });
    return { status: 'synced' };
  } catch (error) {
    throw toAppServiceError(error);
  }
};

const readExpensesByField = async (
  field: 'localDate' | 'month',
  value: string,
): Promise<Expense[]> => {
  const services = getFirebaseServices();
  if (!services) return [];

  try {
    const user = services.auth.currentUser ?? (await ensureAnonymousSession());
    const snapshot = await getDocs(
      query(
        collection(services.db, 'users', user.uid, 'expenses'),
        where(field, '==', value),
      ),
    );

    return snapshot.docs.map((expenseDoc) => {
      const data = expenseDoc.data();
      return {
        id: expenseDoc.id,
        amountKobo: data.amountKobo as number,
        category: data.category as Expense['category'],
        note: (data.note as string | undefined) ?? '',
        localDate: data.localDate as string,
        month: data.month as string,
        createdAt: (data.clientCreatedAt as string | undefined) ?? new Date().toISOString(),
        syncStatus: 'synced' as const,
      };
    });
  } catch (error) {
    throw toAppServiceError(error);
  }
};

export const getExpensesForDate = (localDate: string): Promise<Expense[]> =>
  readExpensesByField('localDate', localDate);

export const getExpensesForMonth = (month: string): Promise<Expense[]> =>
  readExpensesByField('month', month);
