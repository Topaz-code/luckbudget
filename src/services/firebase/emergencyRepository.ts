import type {
  EmergencyOverview,
  EmergencyWithdrawal,
  EmergencyWithdrawalResult,
} from '../../features/emergency/types';
import { callSupabaseBackend } from '../supabase/client';

/** Financial operations run in Supabase Edge Functions; Firebase remains Auth/Firestore. */
export const fetchEmergencyOverview = (): Promise<EmergencyOverview> =>
  callSupabaseBackend<EmergencyOverview>('emergency-overview');

export const configureEmergencyPin = async (
  pin: string,
  confirmPin: string,
): Promise<void> => {
  await callSupabaseBackend<{ configured: boolean }>('set-emergency-pin', {
    pin,
    confirmPin,
  });
};

export const saveEmergencyWithdrawalLimit = async (
  maxWithdrawalsPerMonth: 1 | 2,
): Promise<void> => {
  await callSupabaseBackend<{ maxWithdrawalsPerMonth: number }>('set-emergency-limit', {
    maxWithdrawalsPerMonth,
  });
};

export const submitEmergencyWithdrawal = (input: {
  amountKobo: number;
  reason: string;
  pin: string;
  destinationBankCode: string;
  destinationAccountNumber: string;
}): Promise<EmergencyWithdrawalResult> =>
  callSupabaseBackend<EmergencyWithdrawalResult>('request-emergency-withdrawal', input);

export const getEmergencyWithdrawalsForMonth = (
  month: string,
): Promise<EmergencyWithdrawal[]> =>
  callSupabaseBackend<EmergencyWithdrawal[]>('emergency-history', { month });
