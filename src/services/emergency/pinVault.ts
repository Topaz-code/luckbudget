import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { AppServiceError } from '../firebase/errors';

const PIN_KEY = 'lockbudget.emergency-pin.v1';
const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60_000;

interface StoredPin {
  salt: string;
  hash: string;
  failedAttempts: number;
  lockedUntil: number | null;
}

const options: SecureStore.SecureStoreOptions = {
  keychainService: 'com.lockbudget.emergency-pin',
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

const digestPin = (pin: string, salt: string): Promise<string> =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${pin}`);

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

const readStoredPin = async (): Promise<StoredPin | null> => {
  const value = await SecureStore.getItemAsync(PIN_KEY, options);
  return value ? (JSON.parse(value) as StoredPin) : null;
};

export const hasLocalEmergencyPin = async (): Promise<boolean> =>
  (await readStoredPin()) !== null;

export const setLocalEmergencyPin = async (pin: string, confirmPin: string): Promise<void> => {
  if (!/^\d{4}$/.test(pin)) {
    throw new AppServiceError('Enter a valid 4-digit PIN.', 'pin/invalid');
  }
  if (pin !== confirmPin) {
    throw new AppServiceError('PINs do not match.', 'pin/mismatch');
  }
  if (await readStoredPin()) {
    throw new AppServiceError('An emergency PIN is already configured.', 'pin/already-set');
  }

  const salt = bytesToHex(await Crypto.getRandomBytesAsync(16));
  const stored: StoredPin = {
    salt,
    hash: await digestPin(pin, salt),
    failedAttempts: 0,
    lockedUntil: null,
  };
  await SecureStore.setItemAsync(PIN_KEY, JSON.stringify(stored), options);
};

export const verifyLocalEmergencyPin = async (pin: string): Promise<void> => {
  const stored = await readStoredPin();
  if (!stored) throw new AppServiceError('Set an emergency PIN first.', 'pin/not-configured');
  if (stored.lockedUntil && stored.lockedUntil > Date.now()) {
    throw new AppServiceError('Too many incorrect attempts. Try again in 15 minutes.', 'pin/locked');
  }

  const matches = (await digestPin(pin, stored.salt)) === stored.hash;
  if (!matches) {
    const failedAttempts = stored.failedAttempts + 1;
    const next: StoredPin = {
      ...stored,
      failedAttempts: failedAttempts >= MAX_ATTEMPTS ? 0 : failedAttempts,
      lockedUntil: failedAttempts >= MAX_ATTEMPTS ? Date.now() + LOCK_DURATION_MS : null,
    };
    await SecureStore.setItemAsync(PIN_KEY, JSON.stringify(next), options);
    throw new AppServiceError('The PIN you entered is incorrect.', 'pin/incorrect');
  }

  await SecureStore.setItemAsync(
    PIN_KEY,
    JSON.stringify({ ...stored, failedAttempts: 0, lockedUntil: null }),
    options,
  );
};
