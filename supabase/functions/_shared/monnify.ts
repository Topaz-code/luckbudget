import { ApiError } from './http.ts';

const apiKey = Deno.env.get('MONNIFY_API_KEY') ?? '';
const secretKey = Deno.env.get('MONNIFY_SECRET_KEY') ?? '';
const contractCode = Deno.env.get('MONNIFY_CONTRACT_CODE') ?? '';
const sourceAccountNumber = Deno.env.get('MONNIFY_DISBURSEMENT_ACCOUNT_NUMBER') ?? '';
const baseUrl = (Deno.env.get('MONNIFY_BASE_URL') ?? 'https://sandbox.monnify.com').replace(/\/$/, '');
export const monnifyEnvironment = baseUrl.includes('sandbox') ? 'sandbox' : 'live';

interface Envelope<T> {
  requestSuccessful: boolean;
  responseMessage: string;
  responseCode: string;
  responseBody: T;
}

let tokenCache: { token: string; expiresAt: number } | null = null;

const requireSecrets = (): void => {
  if (!apiKey || !secretKey || !contractCode || !sourceAccountNumber) {
    throw new ApiError('Monnify secrets are not configured.', 500, 'monnify/not-configured');
  }
};

const accessToken = async (): Promise<string> => {
  requireSecrets();
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.token;
  const basic = btoa(`${apiKey}:${secretKey}`);
  const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/json' },
  });
  const envelope = (await response.json()) as Envelope<{ accessToken: string; expiresIn: number }>;
  if (!response.ok || !envelope.requestSuccessful) {
    throw new ApiError(envelope.responseMessage || 'Monnify authentication failed.', 502);
  }
  tokenCache = {
    token: envelope.responseBody.accessToken,
    expiresAt: Date.now() + envelope.responseBody.expiresIn * 1_000,
  };
  return tokenCache.token;
};

export const monnifyRequest = async <T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> => {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      'Content-Type': 'application/json',
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const envelope = (await response.json()) as Envelope<T>;
  if (!response.ok || !envelope.requestSuccessful) {
    throw new ApiError(
      envelope.responseMessage || 'Monnify could not complete the request.',
      response.status >= 500 ? 502 : 400,
      `monnify/${envelope.responseCode || response.status}`,
    );
  }
  return envelope.responseBody;
};

interface ReservedBody {
  accountReference: string;
  accountName: string;
  accounts: Array<{
    bankName: string;
    bankCode: string;
    accountName?: string;
    accountNumber: string;
  }>;
}

const normalizeReserved = (body: ReservedBody) => {
  const account = body.accounts?.[0];
  if (!account) throw new ApiError('Monnify returned no reserved account.', 502);
  return {
    accountReference: body.accountReference,
    accountName: account.accountName || body.accountName,
    bankName: account.bankName,
    bankCode: account.bankCode,
    accountNumber: account.accountNumber,
  };
};

export const createReservedAccount = async (input: {
  accountReference: string;
  customerName: string;
  customerEmail: string;
  kycType: 'bvn' | 'nin';
  kycValue: string;
}) =>
  normalizeReserved(
    await monnifyRequest<ReservedBody>('/api/v2/bank-transfer/reserved-accounts', {
      method: 'POST',
      body: {
        accountReference: input.accountReference,
        accountName: `LockBudget - ${input.customerName}`,
        currencyCode: 'NGN',
        contractCode,
        customerEmail: input.customerEmail,
        customerName: input.customerName,
        getAllAvailableBanks: true,
        [input.kycType]: input.kycValue,
      },
    }),
  );

export const getReservedAccount = async (reference: string) =>
  normalizeReserved(
    await monnifyRequest<ReservedBody>(
      `/api/v2/bank-transfer/reserved-accounts/${encodeURIComponent(reference)}`,
    ),
  );

export const listBanks = () =>
  monnifyRequest<Array<{ code: string; name: string }>>('/api/v1/banks');

export const resolveAccount = (accountNumber: string, bankCode: string) =>
  monnifyRequest<{ accountName: string; accountNumber: string; bankCode: string }>(
    `/api/v1/disbursements/account/validate?accountNumber=${encodeURIComponent(accountNumber)}&bankCode=${encodeURIComponent(bankCode)}`,
  );

export const initiateTransfer = (input: {
  amountKobo: number;
  reference: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
}) =>
  monnifyRequest<{
    reference: string;
    status: string;
    transactionReference?: string;
    destinationAccountName: string;
  }>('/api/v2/disbursements/single', {
    method: 'POST',
    body: {
      amount: input.amountKobo / 100,
      reference: input.reference,
      narration: 'LockBudget emergency withdrawal',
      destinationBankCode: input.bankCode,
      destinationAccountNumber: input.accountNumber,
      destinationAccountName: input.accountName,
      currency: 'NGN',
      sourceAccountNumber,
      async: true,
    },
  });

export const getTransferStatus = (reference: string) =>
  monnifyRequest<{ status: string; transactionReference?: string }>(
    `/api/v2/disbursements/single/summary?reference=${encodeURIComponent(reference)}`,
  );

export const webhookSecret = (): string => secretKey;
