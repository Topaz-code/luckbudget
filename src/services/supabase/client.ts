import { env } from '../../config/env';
import { ensureAnonymousSession } from '../firebase/authService';
import { getFirebaseServices, isCloudBackendEnabled } from '../firebase/client';
import { AppServiceError } from '../firebase/errors';

interface BackendEnvelope<T> {
  data?: T;
  error?: string;
  code?: string;
}

/**
 * Calls Supabase Edge Functions with a Firebase ID token. The Edge Function
 * verifies that token against Google's Firebase JWKS before using the Firebase UID.
 */
export const callSupabaseBackend = async <T>(
  action: string,
  payload: Record<string, unknown> = {},
): Promise<T> => {
  if (!isCloudBackendEnabled) {
    throw new AppServiceError('The Supabase backend is not configured.', 'supabase/not-configured');
  }

  const services = getFirebaseServices();
  if (!services) throw new AppServiceError('Firebase is not configured.', 'firebase/not-configured');
  const user = services.auth.currentUser ?? (await ensureAnonymousSession());
  const firebaseToken = await user.getIdToken();
  const response = await fetch(`${env.supabaseUrl}/functions/v1/monnify-api`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: env.supabaseAnonKey,
      Authorization: `Bearer ${firebaseToken}`,
    },
    body: JSON.stringify({ action, ...payload }),
  });

  let body: BackendEnvelope<T>;
  try {
    body = (await response.json()) as BackendEnvelope<T>;
  } catch {
    throw new AppServiceError('The backend returned an invalid response.', 'supabase/invalid-response');
  }

  if (!response.ok || body.error) {
    throw new AppServiceError(
      body.error ?? 'The backend could not complete the request.',
      body.code ?? `supabase/http-${response.status}`,
    );
  }
  if (body.data === undefined) {
    throw new AppServiceError('The backend returned no data.', 'supabase/empty-response');
  }
  return body.data;
};
