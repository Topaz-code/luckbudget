import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { DailyLockPreference } from '../features/expenses/dailyLock';

interface DailyLockState {
  preference: DailyLockPreference;
  hasHydrated: boolean;
  hydrationError: string | null;
  setPreference: (preference: DailyLockPreference) => void;
  resetPreference: () => void;
  finishHydration: (error?: unknown) => void;
}

export const useDailyLockStore = create<DailyLockState>()(
  persist(
    (set) => ({
      preference: 'rollover',
      hasHydrated: false,
      hydrationError: null,
      setPreference: (preference) => set({ preference }),
      resetPreference: () => set({ preference: 'rollover' }),
      finishHydration: (error) =>
        set({
          hasHydrated: true,
          hydrationError: error instanceof Error ? error.message : error ? String(error) : null,
        }),
    }),
    {
      name: 'lockbudget-daily-lock-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ preference }) => ({ preference }),
      onRehydrateStorage: () => (state, error) => state?.finishHydration(error),
    },
  ),
);
