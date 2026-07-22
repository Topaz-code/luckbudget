import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import type { DailyLockPreference } from '../../features/expenses/dailyLock';
import { ensureAnonymousSession } from './authService';
import type { CloudWriteResult } from './budgetRepository';
import { getFirebaseServices } from './client';
import { toAppServiceError } from './errors';

export const saveDailyLockPreference = async (
  preference: DailyLockPreference,
): Promise<CloudWriteResult> => {
  const services = getFirebaseServices();
  if (!services) return { status: 'not-configured' };

  try {
    const user = services.auth.currentUser ?? (await ensureAnonymousSession());
    await setDoc(
      doc(services.db, 'users', user.uid, 'settings', 'dailyLock'),
      { preference, updatedAt: serverTimestamp() },
      { merge: true },
    );
    return { status: 'synced' };
  } catch (error) {
    throw toAppServiceError(error);
  }
};

export const getDailyLockPreference = async (): Promise<DailyLockPreference | null> => {
  const services = getFirebaseServices();
  if (!services) return null;

  try {
    const user = services.auth.currentUser ?? (await ensureAnonymousSession());
    const snapshot = await getDoc(doc(services.db, 'users', user.uid, 'settings', 'dailyLock'));
    if (!snapshot.exists()) return null;
    const preference = snapshot.data().preference;
    return preference === 'rollover' || preference === 'reset' ? preference : null;
  } catch (error) {
    throw toAppServiceError(error);
  }
};
