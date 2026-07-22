# Monnify architecture

## Trust boundary

The Expo client never receives Monnify credentials and never calls Monnify directly.
Firebase Spark supplies the user identity and Firestore app data. Supabase Edge
Functions verify the Firebase ID token and perform every Monnify operation with
server-only secrets.

## Funding and locked balances

`create-wallet` creates a Monnify Customer Reserved Account. BVN/NIN is forwarded
in memory and never persisted. Full virtual-account details are stored in a Supabase
RLS-protected table that has no client policy.

Signed deposit webhooks call an atomic Postgres function that allocates funds to:

1. Emergency Fund target
2. Fixed Savings target
3. Available wallet balance

## Emergency payout

The Edge Function verifies the PIN hash, performs Monnify Name Enquiry, and calls an
atomic SQL function that reserves the funded balance. It then initiates an
asynchronous Monnify Single Transfer. Only masked destination details are persisted.

Successful, failed, and reversed webhook events settle the ledger atomically. A
Supabase Cron job invokes reconciliation every 15 minutes for missed callbacks.

## Security controls

- Firebase RS256 token verification against Google's remote JWKS
- Supabase RLS with no anon/authenticated financial-table policies
- Built-in service role available only inside Edge Functions
- PBKDF2 PIN hash with random salt, five-attempt limit, and 15-minute lockout
- HMAC-SHA512 webhook verification over the raw body
- Idempotent deposit and disbursement events
- No Monnify secret, service-role key, BVN/NIN, or raw payout account in the app

Deployment instructions are in `docs/SUPABASE_HYBRID_SETUP.md`.
