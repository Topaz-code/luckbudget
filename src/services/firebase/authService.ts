import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  linkWithCredential,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type Unsubscribe,
  type User,
} from 'firebase/auth';
import { getFirebaseServices } from './client';
import { AppServiceError, toAppServiceError } from './errors';

const requireServices = () => {
  const services = getFirebaseServices();
  if (!services) {
    throw new AppServiceError(
      'Firebase is not configured. Add the required values to your .env file.',
      'firebase/not-configured',
    );
  }
  return services;
};

export const observeAuthState = (
  listener: (user: User | null) => void,
  onError: (error: AppServiceError) => void,
): Unsubscribe => {
  const { auth } = requireServices();
  return onAuthStateChanged(auth, listener, (error) => onError(toAppServiceError(error)));
};

export const ensureAnonymousSession = async (): Promise<User> => {
  const { auth } = requireServices();
  if (auth.currentUser) return auth.currentUser;

  try {
    return (await signInAnonymously(auth)).user;
  } catch (error) {
    throw toAppServiceError(error);
  }
};

export const registerWithEmail = async (
  email: string,
  password: string,
  displayName?: string,
): Promise<User> => {
  const { auth } = requireServices();

  try {
    const user = auth.currentUser?.isAnonymous
      ? (
          await linkWithCredential(
            auth.currentUser,
            EmailAuthProvider.credential(email.trim(), password),
          )
        ).user
      : (await createUserWithEmailAndPassword(auth, email.trim(), password)).user;

    if (displayName?.trim()) await updateProfile(user, { displayName: displayName.trim() });
    return user;
  } catch (error) {
    throw toAppServiceError(error);
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  const { auth } = requireServices();
  try {
    return (await signInWithEmailAndPassword(auth, email.trim(), password)).user;
  } catch (error) {
    throw toAppServiceError(error);
  }
};

export const sendPasswordReset = async (email: string): Promise<void> => {
  const { auth } = requireServices();
  if (!email.trim()) {
    throw new AppServiceError('Enter your email address first.', 'auth/email-required');
  }
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error) {
    throw toAppServiceError(error);
  }
};

export const signOutUser = async (): Promise<void> => {
  const { auth } = requireServices();
  try {
    await signOut(auth);
  } catch (error) {
    throw toAppServiceError(error);
  }
};

export const getCurrentUser = (): User | null => getFirebaseServices()?.auth.currentUser ?? null;
