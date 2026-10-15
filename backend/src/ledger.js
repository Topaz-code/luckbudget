export const limits = {
  singleTopUpKobo: 5000000,
  maxBalanceKobo: 30000000,
};

export function planTopUp({ balanceKobo, amountKobo, fingerprint, existing }) {
  if (!Number.isSafeInteger(amountKobo) || amountKobo <= 0) {
    return { error: 'invalid-amount', status: 400 };
  }
  if (existing) {
    if (existing.fingerprint !== fingerprint) {
      return { error: 'idempotency-conflict', status: 409 };
    }
    return { replay: existing.response };
  }
  if (amountKobo > limits.singleTopUpKobo) {
    return { error: 'topup-limit', status: 403, limitKobo: limits.singleTopUpKobo };
  }
  if (balanceKobo + amountKobo > limits.maxBalanceKobo) {
    return {
      error: 'balance-limit',
      status: 403,
      remainingKobo: limits.maxBalanceKobo - balanceKobo,
    };
  }
  return { amountKobo, nextBalanceKobo: balanceKobo + amountKobo };
}
