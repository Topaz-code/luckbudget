import { createRemoteJWKSet, jwtVerify } from 'npm:jose@5.9.6';
import { ApiError } from './http.ts';

const firebaseProjectId = Deno.env.get('FIREBASE_PROJECT_ID') ?? '';
const jwks = createRemoteJWKSet(
  new URL(
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
  ),
);

export const requireFirebaseUid = async (request: Request): Promise<string> => {
  if (!firebaseProjectId) throw new ApiError('Firebase verifier is not configured.', 500);
  const authorization = request.headers.get('Authorization') ?? '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) throw new ApiError('Sign in before continuing.', 401, 'unauthenticated');

  try {
    const { payload } = await jwtVerify(token, jwks, {
      algorithms: ['RS256'],
      audience: firebaseProjectId,
      issuer: `https://securetoken.google.com/${firebaseProjectId}`,
    });
    if (!payload.sub) throw new Error('Missing subject');
    return payload.sub;
  } catch {
    throw new ApiError('Your Firebase session is invalid or expired.', 401, 'unauthenticated');
  }
};
