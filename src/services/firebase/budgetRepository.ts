import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  type DocumentData,
} from 'firebase/firestore';
import type { BudgetAmounts, BudgetTotals } from '../../features/budget/types';
import { getMonthKey } from '../../utils/date';
import { ensureAnonymousSession } from './authService';
import { getFirebaseServices, isCloudBackendEnabled } from './client';
import { syncSupabaseFinancialPlan } from './monnifyRepository';
import { toAppServiceError } from './errors';

export interface CloudBudgetDocument extends BudgetAmounts, BudgetTotals {
  month: string;
  currency: 'NGN';
  schemaVersion: 1;
  updatedAt?: unknown;
}

export type CloudWriteResult = { status: 'synced' } | { status: 'not-configured' };

/** Saves one canonical monthly plan under the authenticated user's private path. */
export const saveMonthlyBudget = async (
  amounts: BudgetAmounts,
  totals: BudgetTotals,
  date = new Date(),
): Promise<CloudWriteResult> => {
  const services = getFirebaseServices();
  if (!services) return { status: 'not-configured' };

  try {
    const user = services.auth.currentUser ?? (await ensureAnonymousSession());
    const month = getMonthKey(date);
    const budgetRef = doc(services.db, 'users', user.uid, 'budgets', month);

    await setDoc(
      budgetRef,
      {
        ...amounts,
        ...totals,
        month,
        currency: 'NGN',
        schemaVersion: 1,
        updatedAt: serverTimestamp(),
      } satisfies DocumentData,
      { merge: true },
    );

    if (isCloudBackendEnabled) {
      await syncSupabaseFinancialPlan({
        month,
        emergencyTargetKobo: amounts.emergencySavings,
        fixedSavingsTargetKobo: amounts.fixedSavings,
        baseRemainingKobo: totals.remaining,
      });
    }

    return { status: 'synced' };
  } catch (error) {
    throw toAppServiceError(error);
  }
};

export const getMonthlyBudget = async (
  date = new Date(),
): Promise<CloudBudgetDocument | null> => {
  const services = getFirebaseServices();
  if (!services) return null;

  try {
    const user = services.auth.currentUser ?? (await ensureAnonymousSession());
    const snapshot = await getDoc(
      doc(services.db, 'users', user.uid, 'budgets', getMonthKey(date)),
    );
    return snapshot.exists() ? (snapshot.data() as CloudBudgetDocument) : null;
  } catch (error) {
    throw toAppServiceError(error);
  }
};
