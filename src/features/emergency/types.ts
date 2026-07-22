export interface EmergencyOverview {
  hasPin: boolean;
  balanceKobo: number;
  usedCount: number;
  maxWithdrawals: number;
  month: string;
  adjustedRemainingKobo: number;
}

export interface EmergencyWithdrawal {
  id: string;
  amountKobo: number;
  reason: string;
  month: string;
  createdAt: string;
  status: 'approved_virtual' | 'pending_transfer' | 'completed' | 'failed' | 'reversed';
}

export interface EmergencyWithdrawalResult {
  requestId: string;
  balanceKobo: number;
  usedCount: number;
  maxWithdrawals: number;
  adjustedRemainingKobo: number;
  transferStatus?: 'pending_transfer' | 'completed';
  beneficiaryName?: string;
}
