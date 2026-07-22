import { FirebaseError } from 'firebase/app';

const friendlyMessages: Record<string, string> = {
  'auth/email-already-in-use': 'An account already exists for this email address.',
  'auth/invalid-credential': 'The email address or password is incorrect.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/network-request-failed': 'Check your internet connection and try again.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/weak-password': 'Use a stronger password with at least six characters.',
  'permission-denied': 'You do not have permission to perform this action.',
  unavailable: 'The service is temporarily unavailable. Please try again.',
};

export class AppServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'AppServiceError';
  }
}

export const toAppServiceError = (error: unknown): AppServiceError => {
  if (error instanceof AppServiceError) return error;
  if (error instanceof FirebaseError) {
    const callableMessage = error.code.startsWith('functions/')
      ? error.message.replace(/^Firebase:\s*/i, '').replace(/\s*\([^)]*\)\.?$/, '')
      : null;
    return new AppServiceError(
      friendlyMessages[error.code] ?? callableMessage ?? 'Something went wrong. Please try again.',
      error.code,
      { cause: error },
    );
  }
  return new AppServiceError('Something went wrong. Please try again.', 'unknown', {
    cause: error,
  });
};
