import type { Persistence } from 'firebase/auth';

export {};

declare module 'firebase/auth' {
  interface ReactNativeStorageLike {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
  }

  /** React Native export selected by Metro but omitted from Firebase's wrapper typings. */
  export function getReactNativePersistence(storage: ReactNativeStorageLike): Persistence;
}
