import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  type Auth,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { env } from '../../config/env';

export interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}

let cachedServices: FirebaseServices | null | undefined;

const requiredConfig = {
  apiKey: env.firebaseApiKey,
  authDomain: env.firebaseAuthDomain,
  projectId: env.firebaseProjectId,
  storageBucket: env.firebaseStorageBucket,
  messagingSenderId: env.firebaseMessagingSenderId,
  appId: env.firebaseAppId,
};

export const isFirebaseConfigured = Object.values(requiredConfig).every(
  (value) => value.trim().length > 0,
);

/** Supabase/Monnify are optional so the core app can still run on Firebase Spark. */
export const isCloudBackendEnabled =
  isFirebaseConfigured &&
  env.enableSupabaseBackend &&
  env.supabaseUrl.startsWith('https://') &&
  env.supabaseAnonKey.length > 0;

/**
 * Lazily initializes Firebase so local development still starts before .env is
 * configured. Production builds must supply every EXPO_PUBLIC_FIREBASE_* value.
 */
export const getFirebaseServices = (): FirebaseServices | null => {
  if (cachedServices !== undefined) return cachedServices;
  if (!isFirebaseConfigured) {
    cachedServices = null;
    return null;
  }

  const hasExistingApp = getApps().length > 0;
  const app = hasExistingApp ? getApp() : initializeApp(requiredConfig);
  const auth = hasExistingApp
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });

  cachedServices = {
    app,
    auth,
    db: getFirestore(app),
  };
  return cachedServices;
};

/** Test-only reset for modules that mock environment and Firebase instances. */
export const resetFirebaseServiceCache = (): void => {
  cachedServices = undefined;
};
