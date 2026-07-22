/**
 * Public client configuration only. Secrets must never use EXPO_PUBLIC_*.
 * Monnify credentials belong in Supabase Edge Function secret storage.
 */
export const env = {
  firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  firebaseMessagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  enableSupabaseBackend: process.env.EXPO_PUBLIC_ENABLE_SUPABASE_BACKEND === 'true',
  easProjectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? '',
} as const;
