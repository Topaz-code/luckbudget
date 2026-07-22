import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { requireFirebaseUid } from '../_shared/firebase-auth.ts';
import { ApiError, corsHeaders, jsonResponse } from '../_shared/http.ts';
import {
  createReservedAccount,
  getReservedAccount,
  initiateTransfer,
  monnifyEnvironment,
  listBanks,
  resolveAccount,
} from '../_shared/monnify.ts';
import { createSalt, hashPin, safeEqual } from '../_shared/pin.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const monthInLagos = (): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Lagos',
    year: 'numeric',
    month: '2-digit',
  }).format(new Date());

const maskAccount = (accountNumber: string): string =>
  `${'*'.repeat(Math.max(0, accountNumber.length - 4))}${accountNumber.slice(-4)}`;

const bodyObject = async (request: Request): Promise<Record<string, unknown>> => {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
    return body as Record<string, unknown>;
  } catch {
    throw new ApiError('Invalid JSON request.');
  }
};

const requirePin = (value: unknown): string => {
  if (typeof value !== 'string' || !/^\d{4}$/.test(value)) {
    throw new ApiError('Enter a valid 4-digit PIN.');
  }
  return value;
};

const verifyPin = async (uid: string, pin: string): Promise<void> => {
  const { data, error } = await supabase
    .from('emergency_security')
    .select('*')
    .eq('firebase_uid', uid)
    .maybeSingle();
  if (error) throw new ApiError('PIN verification is unavailable.', 500);
  if (!data) throw new ApiError('Set an emergency PIN first.', 409);
  if (data.locked_until && new Date(data.locked_until).getTime() > Date.now()) {
    throw new ApiError('Too many incorrect attempts. Try again in 15 minutes.', 429);
  }

  const matches = safeEqual(await hashPin(pin, data.pin_salt), data.pin_hash);
  if (!matches) {
    const attempts = Number(data.failed_attempts ?? 0) + 1;
    await supabase
      .from('emergency_security')
      .update({
        failed_attempts: attempts >= 5 ? 0 : attempts,
        locked_until: attempts >= 5 ? new Date(Date.now() + 15 * 60_000).toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('firebase_uid', uid);
    throw new ApiError('The PIN you entered is incorrect.', 403);
  }

  await supabase
    .from('emergency_security')
    .update({ failed_attempts: 0, locked_until: null, updated_at: new Date().toISOString() })
    .eq('firebase_uid', uid);
};

const walletDetails = async (uid: string) => {
  const [{ data: account }, { data: balance }] = await Promise.all([
    supabase.from('wallet_accounts').select('*').eq('firebase_uid', uid).maybeSingle(),
    supabase.from('wallet_balances').select('*').eq('firebase_uid', uid).maybeSingle(),
  ]);
  const amounts = {
    emergencyBalanceKobo: Number(balance?.emergency_balance_kobo ?? 0),
    fixedSavingsBalanceKobo: Number(balance?.fixed_savings_balance_kobo ?? 0),
    availableBalanceKobo: Number(balance?.available_balance_kobo ?? 0),
  };
  if (!account) return { isReady: false, environment: monnifyEnvironment, ...amounts };
  return {
    isReady: true,
    environment: monnifyEnvironment,
    accountNumber: account.account_number,
    maskedAccountNumber: maskAccount(account.account_number),
    accountName: account.account_name,
    bankName: account.bank_name,
    bankCode: account.bank_code,
    accountReference: account.account_reference,
    ...amounts,
  };
};

const route = async (uid: string, body: Record<string, unknown>): Promise<unknown> => {
  const action = body.action;
  if (typeof action !== 'string') throw new ApiError('Missing action.');

  if (action === 'sync-financial-plan') {
    const month = body.month;
    const emergency = body.emergencyTargetKobo;
    const fixed = body.fixedSavingsTargetKobo;
    const remaining = body.baseRemainingKobo;
    if (
      typeof month !== 'string' ||
      !/^\d{4}-\d{2}$/.test(month) ||
      typeof emergency !== 'number' ||
      !Number.isSafeInteger(emergency) ||
      emergency < 0 ||
      typeof fixed !== 'number' ||
      !Number.isSafeInteger(fixed) ||
      fixed < 0 ||
      typeof remaining !== 'number' ||
      !Number.isSafeInteger(remaining) ||
      remaining < 0
    ) {
      throw new ApiError('Invalid financial plan.');
    }
    const { data: existing } = await supabase
      .from('financial_plans')
      .select('firebase_uid')
      .eq('firebase_uid', uid)
      .eq('month', month)
      .maybeSingle();
    const query = existing
      ? supabase
          .from('financial_plans')
          .update({
            emergency_target_kobo: emergency,
            fixed_savings_target_kobo: fixed,
            base_remaining_kobo: remaining,
            updated_at: new Date().toISOString(),
          })
          .eq('firebase_uid', uid)
          .eq('month', month)
      : supabase.from('financial_plans').insert({
          firebase_uid: uid,
          month,
          emergency_target_kobo: emergency,
          fixed_savings_target_kobo: fixed,
          base_remaining_kobo: remaining,
        });
    const { error } = await query;
    if (error) throw new ApiError('The financial plan could not be synchronized.', 500);
    return { synced: true };
  }

  if (action === 'emergency-overview') {
    const month = monthInLagos();
    const [{ data: security }, { data: balance }, { data: config }, { data: plan }, usage] =
      await Promise.all([
        supabase.from('emergency_security').select('firebase_uid').eq('firebase_uid', uid).maybeSingle(),
        supabase.from('wallet_balances').select('*').eq('firebase_uid', uid).maybeSingle(),
        supabase.from('emergency_configs').select('*').eq('firebase_uid', uid).maybeSingle(),
        supabase.from('financial_plans').select('*').eq('firebase_uid', uid).eq('month', month).maybeSingle(),
        supabase
          .from('withdrawal_requests')
          .select('id', { count: 'exact', head: true })
          .eq('firebase_uid', uid)
          .eq('month', month)
          .not('status', 'in', '(failed,reversed)'),
      ]);
    return {
      hasPin: Boolean(security),
      balanceKobo: Number(balance?.emergency_balance_kobo ?? 0),
      usedCount: usage.count ?? 0,
      maxWithdrawals: Number(config?.max_withdrawals_per_month ?? 2),
      month,
      adjustedRemainingKobo:
        Number(plan?.base_remaining_kobo ?? 0) + Number(plan?.emergency_used_kobo ?? 0),
    };
  }

  if (action === 'set-emergency-pin') {
    const pin = requirePin(body.pin);
    const confirmPin = requirePin(body.confirmPin);
    if (pin !== confirmPin) throw new ApiError('PINs do not match.');
    const { data: existing } = await supabase
      .from('emergency_security')
      .select('firebase_uid')
      .eq('firebase_uid', uid)
      .maybeSingle();
    if (existing) throw new ApiError('An emergency PIN is already configured.', 409);
    const salt = createSalt();
    const { error } = await supabase.from('emergency_security').insert({
      firebase_uid: uid,
      pin_salt: salt,
      pin_hash: await hashPin(pin, salt),
    });
    if (error) throw new ApiError('The PIN could not be configured.', 500);
    return { configured: true };
  }

  if (action === 'set-emergency-limit') {
    const maximum = body.maxWithdrawalsPerMonth;
    if (maximum !== 1 && maximum !== 2) throw new ApiError('The limit must be 1 or 2.');
    const month = monthInLagos();
    const { count } = await supabase
      .from('withdrawal_requests')
      .select('id', { count: 'exact', head: true })
      .eq('firebase_uid', uid)
      .eq('month', month)
      .not('status', 'in', '(failed,reversed)');
    if ((count ?? 0) > 0) throw new ApiError('The limit cannot change after your first withdrawal.', 409);
    const { error } = await supabase.from('emergency_configs').upsert({
      firebase_uid: uid,
      max_withdrawals_per_month: maximum,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new ApiError('The limit could not be saved.', 500);
    return { maxWithdrawalsPerMonth: maximum };
  }

  if (action === 'wallet-details') return walletDetails(uid);

  if (action === 'create-wallet') {
    const customerName = typeof body.customerName === 'string' ? body.customerName.trim() : '';
    const customerEmail = typeof body.customerEmail === 'string' ? body.customerEmail.trim() : '';
    const kycType = body.kycType === 'bvn' ? 'bvn' : body.kycType === 'nin' ? 'nin' : null;
    const kycValue = typeof body.kycValue === 'string' ? body.kycValue : '';
    if (customerName.length < 3 || !customerEmail.includes('@') || !kycType || !/^\d{11}$/.test(kycValue)) {
      throw new ApiError('Enter valid identity details.');
    }
    const existing = await walletDetails(uid);
    if (existing.isReady) return existing;
    const reference = `LB_${uid}`;
    let account;
    try {
      account = await createReservedAccount({
        accountReference: reference,
        customerName,
        customerEmail,
        kycType,
        kycValue,
      });
    } catch {
      account = await getReservedAccount(reference);
    }
    const { error } = await supabase.from('wallet_accounts').upsert({
      firebase_uid: uid,
      account_reference: account.accountReference,
      account_number: account.accountNumber,
      account_name: account.accountName,
      bank_name: account.bankName,
      bank_code: account.bankCode,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new ApiError('The wallet account could not be stored.', 500);
    await supabase.from('wallet_balances').upsert({ firebase_uid: uid });
    return walletDetails(uid);
  }

  if (action === 'list-banks') return { banks: await listBanks() };

  if (action === 'resolve-bank-account') {
    const accountNumber = typeof body.accountNumber === 'string' ? body.accountNumber : '';
    const bankCode = typeof body.bankCode === 'string' ? body.bankCode : '';
    if (!/^\d{10}$/.test(accountNumber) || !bankCode) throw new ApiError('Enter valid bank details.');
    return resolveAccount(accountNumber, bankCode);
  }

  if (action === 'request-emergency-withdrawal') {
    const pin = requirePin(body.pin);
    const amountKobo = body.amountKobo;
    const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
    const bankCode = typeof body.destinationBankCode === 'string' ? body.destinationBankCode : '';
    const accountNumber =
      typeof body.destinationAccountNumber === 'string' ? body.destinationAccountNumber : '';
    if (
      typeof amountKobo !== 'number' ||
      !Number.isSafeInteger(amountKobo) ||
      amountKobo <= 0
    ) {
      throw new ApiError('Enter a valid amount.');
    }
    if (reason.length < 5 || reason.length > 250) throw new ApiError('Give a reason between 5 and 250 characters.');
    if (!bankCode || !/^\d{10}$/.test(accountNumber)) throw new ApiError('Enter a valid destination account.');
    await verifyPin(uid, pin);
    const beneficiary = await resolveAccount(accountNumber, bankCode);
    const monnifyReference = `LB_${crypto.randomUUID().replaceAll('-', '')}`;
    const { data: reserved, error: reserveError } = await supabase.rpc(
      'reserve_emergency_withdrawal',
      {
        p_firebase_uid: uid,
        p_month: monthInLagos(),
        p_amount_kobo: amountKobo,
        p_reason: reason,
        p_monnify_reference: monnifyReference,
        p_destination_bank_code: bankCode,
        p_destination_account_masked: `******${accountNumber.slice(-4)}`,
        p_destination_account_name: beneficiary.accountName,
      },
    );
    if (reserveError) throw new ApiError(reserveError.message, 409);

    try {
      const transfer = await initiateTransfer({
        amountKobo: Number(amountKobo),
        reference: monnifyReference,
        bankCode,
        accountNumber,
        accountName: beneficiary.accountName,
      });
      const completed = transfer.status === 'SUCCESS';
      await supabase
        .from('withdrawal_requests')
        .update({
          status: completed ? 'completed' : 'pending_transfer',
          monnify_status: transfer.status,
          monnify_transaction_reference: transfer.transactionReference ?? null,
          completed_at: completed ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('monnify_reference', monnifyReference);
      return {
        ...reserved,
        transferStatus: completed ? 'completed' : 'pending_transfer',
        beneficiaryName: beneficiary.accountName,
      };
    } catch (error) {
      if (error instanceof ApiError && error.status < 500) {
        await supabase.rpc('settle_emergency_withdrawal', {
          p_monnify_reference: monnifyReference,
          p_status: 'failed',
          p_reason: error.message,
          p_transaction_reference: null,
        });
        throw error;
      }
      return {
        ...reserved,
        transferStatus: 'pending_transfer',
        beneficiaryName: beneficiary.accountName,
      };
    }
  }

  if (action === 'emergency-history') {
    const month = body.month;
    if (typeof month !== 'string' || !/^\d{4}-\d{2}$/.test(month)) throw new ApiError('Invalid month.');
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('firebase_uid', uid)
      .eq('month', month)
      .order('created_at', { ascending: false });
    if (error) throw new ApiError('Withdrawal history is unavailable.', 500);
    return (data ?? []).map((item) => ({
      id: item.id,
      amountKobo: Number(item.amount_kobo),
      reason: item.reason,
      month: item.month,
      createdAt: item.created_at,
      status: item.status,
    }));
  }

  throw new ApiError('Unsupported action.', 404);
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405);
  try {
    const uid = await requireFirebaseUid(request);
    const body = await bodyObject(request);
    return jsonResponse({ data: await route(uid, body) });
  } catch (error) {
    const apiError = error instanceof ApiError ? error : new ApiError('Unexpected backend error.', 500);
    return jsonResponse({ error: apiError.message, code: apiError.code }, apiError.status);
  }
});
