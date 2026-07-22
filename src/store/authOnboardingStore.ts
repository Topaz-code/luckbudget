import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthOnboardingState {
  continueAsGuest: boolean;
  hasSeenOnboarding: boolean;
  hasHydrated: boolean;
  chooseGuest: () => void;
  finishOnboarding: () => void;
  requireAccountChoice: () => void;
  finishHydration: () => void;
}

export const useAuthOnboardingStore = create<AuthOnboardingState>()(
  persist(
    (set) => ({
      continueAsGuest: false,
      hasSeenOnboarding: false,
      hasHydrated: false,
      chooseGuest: () => set({ continueAsGuest: true, hasSeenOnboarding: true }),
      finishOnboarding: () => set({ hasSeenOnboarding: true }),
      requireAccountChoice: () => set({ continueAsGuest: false }),
      finishHydration: () => set({ hasHydrated: true }),
    }),
    {
      name: 'lockbudget-auth-onboarding-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ continueAsGuest, hasSeenOnboarding }) => ({
        continueAsGuest,
        hasSeenOnboarding,
      }),
      onRehydrateStorage: () => (state) => state?.finishHydration(),
    },
  ),
);
