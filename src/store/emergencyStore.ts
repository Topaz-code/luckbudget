import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  EmergencyOverview,
  EmergencyWithdrawal,
  EmergencyWithdrawalResult,
} from '../features/emergency/types';
import { getMonthKey } from '../utils/date';

interface EmergencyState {
  overview: EmergencyOverview | null;
  withdrawals: EmergencyWithdrawal[];
  maxWithdrawals: 1 | 2;
  hasHydrated: boolean;
  hydrationError: string | null;
  setOverview: (overview: EmergencyOverview) => void;
  setMaxWithdrawals: (maximum: 1 | 2) => void;
  recordWithdrawal: (withdrawal: EmergencyWithdrawal) => void;
  clearEmergencyData: () => void;
  createLocalWithdrawal: (input: {
    amountKobo: number;
    reason: string;
    initialBalanceKobo: number;
    baseRemainingKobo: number;
  }) => EmergencyWithdrawalResult;
  finishHydration: (error?: unknown) => void;
}

export const getEmergencyAdjustmentKobo = (
  withdrawals: EmergencyWithdrawal[],
  month = getMonthKey(),
): number =>
  withdrawals
    .filter((item) => item.month === month && !['failed', 'reversed'].includes(item.status))
    .reduce((sum, item) => sum + item.amountKobo, 0);

export const useEmergencyStore = create<EmergencyState>()(
  persist(
    (set, get) => ({
      overview: null,
      withdrawals: [],
      maxWithdrawals: 2,
      hasHydrated: false,
      hydrationError: null,
      setOverview: (overview) =>
        set({ overview, maxWithdrawals: overview.maxWithdrawals === 1 ? 1 : 2 }),
      setMaxWithdrawals: (maxWithdrawals) => set({ maxWithdrawals }),
      recordWithdrawal: (withdrawal) =>
        set((state) => ({
          withdrawals: [withdrawal, ...state.withdrawals.filter(({ id }) => id !== withdrawal.id)],
        })),
      clearEmergencyData: () => set({ overview: null, withdrawals: [], maxWithdrawals: 2 }),
      createLocalWithdrawal: ({
        amountKobo,
        reason,
        initialBalanceKobo,
        baseRemainingKobo,
      }) => {
        const state = get();
        const month = getMonthKey();
        const used = state.withdrawals.filter(
          (item) => item.month === month && !['failed', 'reversed'].includes(item.status),
        );
        const alreadyWithdrawn = used.reduce((sum, item) => sum + item.amountKobo, 0);
        const balanceKobo = initialBalanceKobo - alreadyWithdrawn - amountKobo;
        const withdrawal: EmergencyWithdrawal = {
          id: Crypto.randomUUID(),
          amountKobo,
          reason,
          month,
          createdAt: new Date().toISOString(),
          status: 'approved_virtual',
        };
        set({ withdrawals: [withdrawal, ...state.withdrawals] });
        return {
          requestId: withdrawal.id,
          balanceKobo,
          usedCount: used.length + 1,
          maxWithdrawals: state.maxWithdrawals,
          adjustedRemainingKobo:
            baseRemainingKobo + getEmergencyAdjustmentKobo([...used, withdrawal], month),
        };
      },
      finishHydration: (error) =>
        set({
          hasHydrated: true,
          hydrationError: error instanceof Error ? error.message : error ? String(error) : null,
        }),
    }),
    {
      name: 'lockbudget-emergency-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ withdrawals, maxWithdrawals }) => ({ withdrawals, maxWithdrawals }),
      onRehydrateStorage: () => (state, error) => state?.finishHydration(error),
    },
  ),
);
