export interface MonnifyWalletDetails {
  isReady: boolean;
  environment?: 'sandbox' | 'live';
  accountNumber?: string;
  maskedAccountNumber?: string;
  accountName?: string;
  bankName?: string;
  bankCode?: string;
  accountReference?: string;
  emergencyBalanceKobo: number;
  fixedSavingsBalanceKobo: number;
  availableBalanceKobo: number;
}

export interface NigerianBank {
  code: string;
  name: string;
}

export interface ResolvedBankAccount {
  accountName: string;
  accountNumber: string;
  bankCode: string;
}
