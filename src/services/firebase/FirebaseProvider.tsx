import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { StyleSheet, View } from 'react-native';
import type { User } from 'firebase/auth';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import { colors, spacing } from '../../theme';
import { ensureAnonymousSession, observeAuthState } from './authService';
import { isFirebaseConfigured } from './client';
import { AppServiceError, toAppServiceError } from './errors';
import { prepareUserDataSession } from '../session/userDataSession';
import { upsertUserProfile } from './userRepository';

type FirebaseStatus = 'disabled' | 'loading' | 'authenticated' | 'error';

interface FirebaseContextValue {
  status: FirebaseStatus;
  user: User | null;
  error: AppServiceError | null;
  retry: () => void;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const missingProductionConfig = !isFirebaseConfigured && !__DEV__;
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<AppServiceError | null>(() =>
    missingProductionConfig
      ? new AppServiceError(
          'Firebase configuration is missing from this build.',
          'firebase/not-configured',
        )
      : null,
  );
  const [status, setStatus] = useState<FirebaseStatus>(
    isFirebaseConfigured ? 'loading' : missingProductionConfig ? 'error' : 'disabled',
  );
  const [attempt, setAttempt] = useState(0);
  const activeUidRef = useRef<string | null>(null);
  const bootstrappedRef = useRef(false);

  const retry = useCallback(() => {
    if (!isFirebaseConfigured) {
      setStatus('error');
      setError(
        new AppServiceError(
          'Firebase configuration is missing from this build.',
          'firebase/not-configured',
        ),
      );
      return;
    }
    setStatus('loading');
    setError(null);
    setAttempt((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    let active = true;

    const unsubscribe = observeAuthState(
      (nextUser) => {
        if (!active) return;
        if (!nextUser) {
          void ensureAnonymousSession().catch((reason: unknown) => {
            if (!active) return;
            setError(toAppServiceError(reason));
            setStatus('error');
          });
          return;
        }

        if (bootstrappedRef.current && activeUidRef.current === nextUser.uid) {
          setUser(nextUser);
          setStatus('authenticated');
          return;
        }

        // Block only for first launch or an actual account switch—not token refreshes.
        setStatus('loading');
        void (async () => {
          try {
            await prepareUserDataSession(nextUser.uid);
            await upsertUserProfile(nextUser);
            if (!active) return;
            activeUidRef.current = nextUser.uid;
            bootstrappedRef.current = true;
            setUser(nextUser);
            setStatus('authenticated');
          } catch (reason) {
            if (!active) return;
            setError(toAppServiceError(reason));
            setStatus('error');
          }
        })();
      },
      (reason) => {
        if (!active) return;
        setError(reason);
        setStatus('error');
      },
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [attempt]);

  const value = useMemo<FirebaseContextValue>(
    () => ({
      status,
      user,
      error,
      retry,
    }),
    [error, retry, status, user],
  );

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
}

export const useFirebase = (): FirebaseContextValue => {
  const context = useContext(FirebaseContext);
  if (!context) throw new Error('useFirebase must be used inside FirebaseProvider.');
  return context;
};

/** Blocks configured builds only while Firebase restores or creates the user session. */
export function FirebaseGate({ children }: { children: ReactNode }) {
  const { status, error, retry } = useFirebase();

  if (status === 'loading') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="bodyMedium" style={styles.copy}>
          Loading your budget…
        </Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.centered}>
        <Text variant="titleLarge" style={styles.errorTitle}>
          We couldn't connect securely
        </Text>
        <Text variant="bodyMedium" style={styles.copy}>
          {error?.message ?? 'Check your connection and try again.'}
        </Text>
        <Button mode="contained" icon="refresh" onPress={retry}>
          Try again
        </Button>
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  copy: {
    color: colors.textMuted,
    lineHeight: 21,
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  errorTitle: { color: colors.danger, fontWeight: '800', textAlign: 'center' },
});
