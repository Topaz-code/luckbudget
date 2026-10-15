import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const admin = require('firebase-admin');

export function createFirebaseVerifier(env = process.env) {
  const projectId = env.FIREBASE_PROJECT_ID;
  const raw = env.FIREBASE_SERVICE_ACCOUNT;
  if (!projectId || !raw) {
    throw new Error('Firebase admin credentials are not configured');
  }
  const credentials = JSON.parse(raw);
  if (credentials.project_id !== projectId) {
    throw new Error('Service account project does not match FIREBASE_PROJECT_ID');
  }
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(credentials),
      projectId,
    });
  }
  return async function verifyToken(token) {
    const decoded = await admin.auth().verifyIdToken(token, true);
    if (decoded.aud !== projectId) {
      throw Object.assign(new Error('wrong-project'), { status: 401 });
    }
    if (decoded.firebase?.sign_in_provider === 'anonymous' || !decoded.email_verified) {
      throw Object.assign(new Error('not-allowed'), { status: 403 });
    }
    return { uid: decoded.uid };
  };
}
