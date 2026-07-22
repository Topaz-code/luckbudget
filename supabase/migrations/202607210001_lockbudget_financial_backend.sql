create extension if not exists pgcrypto;

create table if not exists public.financial_plans (
  firebase_uid text not null,
  month text not null check (month ~ '^\d{4}-\d{2}$'),
  emergency_target_kobo bigint not null check (emergency_target_kobo >= 0),
  fixed_savings_target_kobo bigint not null check (fixed_savings_target_kobo >= 0),
  base_remaining_kobo bigint not null check (base_remaining_kobo >= 0),
  emergency_used_kobo bigint not null default 0 check (emergency_used_kobo >= 0),
  updated_at timestamptz not null default now(),
  primary key (firebase_uid, month)
);

create table if not exists public.wallet_accounts (
  firebase_uid text primary key,
  account_reference text not null unique,
  account_number text not null,
  account_name text not null,
  bank_name text not null,
  bank_code text not null,
  provider text not null default 'monnify',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallet_balances (
  firebase_uid text primary key,
  emergency_balance_kobo bigint not null default 0 check (emergency_balance_kobo >= 0),
  fixed_savings_balance_kobo bigint not null default 0 check (fixed_savings_balance_kobo >= 0),
  available_balance_kobo bigint not null default 0 check (available_balance_kobo >= 0),
  total_funded_kobo bigint not null default 0 check (total_funded_kobo >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.emergency_security (
  firebase_uid text primary key,
  pin_salt text not null,
  pin_hash text not null,
  failed_attempts integer not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.emergency_configs (
  firebase_uid text primary key,
  max_withdrawals_per_month smallint not null default 2
    check (max_withdrawals_per_month in (1, 2)),
  updated_at timestamptz not null default now()
);

create table if not exists public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text not null,
  month text not null check (month ~ '^\d{4}-\d{2}$'),
  amount_kobo bigint not null check (amount_kobo > 0),
  reason text not null check (char_length(reason) between 5 and 250),
  status text not null check (status in (
    'pending_transfer', 'completed', 'failed', 'reversed'
  )),
  monnify_reference text not null unique,
  monnify_transaction_reference text,
  monnify_status text,
  destination_bank_code text not null,
  destination_account_masked text not null,
  destination_account_name text not null,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists withdrawal_uid_month_idx
  on public.withdrawal_requests (firebase_uid, month, created_at desc);
create index if not exists withdrawal_pending_idx
  on public.withdrawal_requests (status, created_at)
  where status = 'pending_transfer';

create table if not exists public.webhook_events (
  event_id text primary key,
  event_type text not null,
  reference text not null,
  firebase_uid text,
  amount_kobo bigint,
  processed_at timestamptz not null default now()
);

alter table public.financial_plans enable row level security;
alter table public.wallet_accounts enable row level security;
alter table public.wallet_balances enable row level security;
alter table public.emergency_security enable row level security;
alter table public.emergency_configs enable row level security;
alter table public.withdrawal_requests enable row level security;
alter table public.webhook_events enable row level security;

-- No client policies are intentionally created. Only Edge Functions using the
-- service_role key can access financial tables. Firebase UIDs are verified first.
revoke all on all tables in schema public from anon, authenticated;

create or replace function public.reserve_emergency_withdrawal(
  p_firebase_uid text,
  p_month text,
  p_amount_kobo bigint,
  p_reason text,
  p_monnify_reference text,
  p_destination_bank_code text,
  p_destination_account_masked text,
  p_destination_account_name text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance wallet_balances%rowtype;
  v_plan financial_plans%rowtype;
  v_max smallint;
  v_used integer;
  v_request_id uuid;
  v_new_balance bigint;
  v_new_used bigint;
begin
  select * into v_balance from wallet_balances
    where firebase_uid = p_firebase_uid for update;
  if not found then
    raise exception 'Create and fund your LockBudget account before withdrawing.';
  end if;

  select * into v_plan from financial_plans
    where firebase_uid = p_firebase_uid and month = p_month for update;
  if not found then raise exception 'Create this month''s budget first.'; end if;

  select coalesce(max_withdrawals_per_month, 2) into v_max
    from emergency_configs where firebase_uid = p_firebase_uid;
  v_max := coalesce(v_max, 2);

  select count(*) into v_used from withdrawal_requests
    where firebase_uid = p_firebase_uid and month = p_month
      and status not in ('failed', 'reversed');
  if v_used >= v_max then
    raise exception 'You have used all % emergency withdrawals for this month.', v_max;
  end if;
  if p_amount_kobo > v_balance.emergency_balance_kobo then
    raise exception 'This amount is above your funded emergency balance.';
  end if;

  v_new_balance := v_balance.emergency_balance_kobo - p_amount_kobo;
  v_new_used := v_plan.emergency_used_kobo + p_amount_kobo;

  update wallet_balances set
    emergency_balance_kobo = v_new_balance,
    updated_at = now()
    where firebase_uid = p_firebase_uid;
  update financial_plans set
    emergency_used_kobo = v_new_used,
    updated_at = now()
    where firebase_uid = p_firebase_uid and month = p_month;

  insert into withdrawal_requests (
    firebase_uid, month, amount_kobo, reason, status, monnify_reference,
    destination_bank_code, destination_account_masked, destination_account_name
  ) values (
    p_firebase_uid, p_month, p_amount_kobo, p_reason, 'pending_transfer',
    p_monnify_reference, p_destination_bank_code, p_destination_account_masked,
    p_destination_account_name
  ) returning id into v_request_id;

  return jsonb_build_object(
    'requestId', v_request_id,
    'balanceKobo', v_new_balance,
    'usedCount', v_used + 1,
    'maxWithdrawals', v_max,
    'adjustedRemainingKobo', v_plan.base_remaining_kobo + v_new_used
  );
end;
$$;

create or replace function public.settle_emergency_withdrawal(
  p_monnify_reference text,
  p_status text,
  p_reason text default null,
  p_transaction_reference text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request withdrawal_requests%rowtype;
  v_plan financial_plans%rowtype;
  v_new_used bigint;
begin
  select * into v_request from withdrawal_requests
    where monnify_reference = p_monnify_reference for update;
  if not found then return jsonb_build_object('found', false); end if;

  if p_status = 'completed' then
    update withdrawal_requests set
      status = 'completed', monnify_transaction_reference = p_transaction_reference,
      monnify_status = 'SUCCESS', completed_at = now(), updated_at = now()
      where id = v_request.id;
  elsif p_status in ('failed', 'reversed') and
    (v_request.status = 'pending_transfer' or
      (p_status = 'reversed' and v_request.status = 'completed')) then
    select * into v_plan from financial_plans
      where firebase_uid = v_request.firebase_uid and month = v_request.month for update;
    v_new_used := greatest(0, coalesce(v_plan.emergency_used_kobo, 0) - v_request.amount_kobo);
    update wallet_balances set
      emergency_balance_kobo = emergency_balance_kobo + v_request.amount_kobo,
      updated_at = now()
      where firebase_uid = v_request.firebase_uid;
    update financial_plans set emergency_used_kobo = v_new_used, updated_at = now()
      where firebase_uid = v_request.firebase_uid and month = v_request.month;
    update withdrawal_requests set
      status = p_status, failure_reason = p_reason,
      monnify_transaction_reference = p_transaction_reference, updated_at = now()
      where id = v_request.id;
  end if;

  return jsonb_build_object('found', true, 'status', p_status);
end;
$$;

create or replace function public.credit_monnify_deposit(
  p_event_id text,
  p_event_type text,
  p_transaction_reference text,
  p_account_reference text,
  p_amount_kobo bigint,
  p_month text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid text;
  v_plan financial_plans%rowtype;
  v_wallet wallet_balances%rowtype;
  v_emergency_credit bigint;
  v_fixed_credit bigint;
  v_available_credit bigint;
begin
  if exists (select 1 from webhook_events where event_id = p_event_id) then
    return jsonb_build_object('duplicate', true);
  end if;
  select firebase_uid into v_uid from wallet_accounts
    where account_reference = p_account_reference;
  if v_uid is null then return jsonb_build_object('unknownAccount', true); end if;

  insert into wallet_balances (firebase_uid) values (v_uid)
    on conflict (firebase_uid) do nothing;
  select * into v_wallet from wallet_balances where firebase_uid = v_uid for update;
  select * into v_plan from financial_plans
    where firebase_uid = v_uid and month = p_month;

  v_emergency_credit := least(
    p_amount_kobo,
    greatest(0, coalesce(v_plan.emergency_target_kobo, 0) - v_wallet.emergency_balance_kobo)
  );
  v_fixed_credit := least(
    p_amount_kobo - v_emergency_credit,
    greatest(0, coalesce(v_plan.fixed_savings_target_kobo, 0) - v_wallet.fixed_savings_balance_kobo)
  );
  v_available_credit := p_amount_kobo - v_emergency_credit - v_fixed_credit;

  update wallet_balances set
    emergency_balance_kobo = emergency_balance_kobo + v_emergency_credit,
    fixed_savings_balance_kobo = fixed_savings_balance_kobo + v_fixed_credit,
    available_balance_kobo = available_balance_kobo + v_available_credit,
    total_funded_kobo = total_funded_kobo + p_amount_kobo,
    updated_at = now()
    where firebase_uid = v_uid;

  insert into webhook_events (
    event_id, event_type, reference, firebase_uid, amount_kobo
  ) values (p_event_id, p_event_type, p_transaction_reference, v_uid, p_amount_kobo);

  return jsonb_build_object('credited', true, 'firebaseUid', v_uid);
end;
$$;

revoke all on function public.reserve_emergency_withdrawal(text,text,bigint,text,text,text,text,text) from public, anon, authenticated;
revoke all on function public.settle_emergency_withdrawal(text,text,text,text) from public, anon, authenticated;
revoke all on function public.credit_monnify_deposit(text,text,text,text,bigint,text) from public, anon, authenticated;
grant execute on function public.reserve_emergency_withdrawal(text,text,bigint,text,text,text,text,text) to service_role;
grant execute on function public.settle_emergency_withdrawal(text,text,text,text) to service_role;
grant execute on function public.credit_monnify_deposit(text,text,text,text,bigint,text) to service_role;
