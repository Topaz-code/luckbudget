import type {
  MonnifyWalletDetails,
  NigerianBank,
  ResolvedBankAccount,
} from '../../features/wallet/types';
import { callSupabaseBackend } from '../supabase/client';

export const getMonnifyWalletDetails = (): Promise<MonnifyWalletDetails> =>
  callSupabaseBackend<MonnifyWalletDetails>('wallet-details');

export const createMonnifyWallet = (input: {
  customerName: string;
  customerEmail: string;
  kycType: 'bvn' | 'nin';
  kycValue: string;
}): Promise<MonnifyWalletDetails> =>
  callSupabaseBackend<MonnifyWalletDetails>('create-wallet', input);

export const getMonnifyBanks = async (): Promise<NigerianBank[]> => {
  const result = await callSupabaseBackend<{ banks: NigerianBank[] }>('list-banks');
  return result.banks.sort((a, b) => a.name.localeCompare(b.name));
};

export const resolveMonnifyBankAccount = (
  accountNumber: string,
  bankCode: string,
): Promise<ResolvedBankAccount> =>
  callSupabaseBackend<ResolvedBankAccount>('resolve-bank-account', {
    accountNumber,
    bankCode,
  });

export const syncSupabaseFinancialPlan = async (input: {
  month: string;
  emergencyTargetKobo: number;
  fixedSavingsTargetKobo: number;
  baseRemainingKobo: number;
}): Promise<void> => {
  await callSupabaseBackend<{ synced: boolean }>('sync-financial-plan', input);
};
