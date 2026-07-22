import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { getFirebaseServices } from './client';
import { toAppServiceError } from './errors';

/** Creates or refreshes the minimum non-sensitive profile stored in Firestore. */
export const upsertUserProfile = async (user: User): Promise<void> => {
  const services = getFirebaseServices();
  if (!services) return;

  try {
    await setDoc(
      doc(services.db, 'users', user.uid),
      {
        displayName: user.displayName ?? null,
        email: user.isAnonymous ? null : user.email,
        isAnonymous: user.isAnonymous,
        currency: 'NGN',
        lastSeenAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (error) {
    throw toAppServiceError(error);
  }
};
