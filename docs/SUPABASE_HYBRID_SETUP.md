# LockBudget: Firebase Spark + Supabase Free Backend

## Architecture

- **Firebase Spark:** Authentication and Firestore app data.
- **Supabase Free:** private Postgres financial ledger and Edge Functions.
- **Monnify:** reserved accounts, name enquiry, deposits, and transfers.
- **Expo:** Android/iOS client and local reminders.

Firebase Cloud Functions are not used. Firebase does not need Blaze.

## Already configured

```text
Firebase project: pocketlock-6c815
Supabase project: mhfoovyblfbtenowinrc
Supabase URL: https://mhfoovyblfbtenowinrc.supabase.co
```

The public Supabase publishable key is stored in the ignored mobile `.env`. No
`service_role` or Monnify secret is stored in the mobile project.

## 1. Finish Firebase Spark

In Firebase Console:

1. **Authentication → Sign-in method:** enable Anonymous and Email/Password.
2. **Firestore Database:** create a Production-mode database.

Then deploy only Firestore configuration:

```bash
cd lockbudget
npx firebase-tools login
npx firebase-tools use pocketlock-6c815
npx firebase-tools deploy --only firestore:rules,firestore:indexes
```

Do not deploy Firebase Functions.

## 2. Link the Supabase CLI

“Link” means telling the local Supabase CLI which online project receives SQL and
Edge Functions. It does not expose the database or change the mobile app.

```bash
cd lockbudget
npx supabase login
npx supabase link --project-ref mhfoovyblfbtenowinrc
```

The CLI asks for the Supabase database password created with the project. Do not
put that password in `.env` or send it in chat.

## 3. Create financial tables and RPC transactions

```bash
npx supabase db push
```

This applies:

```text
supabase/migrations/202607210001_lockbudget_financial_backend.sql
```

The migration creates:

- Financial plan targets synchronized from Firestore
- Private Monnify wallet accounts
- Locked wallet balances
- Hashed emergency PIN records
- Withdrawal limits and requests
- Webhook idempotency records
- Atomic reserve, settle, reverse, and deposit-credit SQL functions

Row Level Security is enabled. No client policies are created. Only Edge Functions
using Supabase's built-in `service_role` environment can access these tables.

## 4. Configure Edge Function secrets

Create an ignored file:

```bash
cp supabase/.env.example supabase/.env.secrets.local
```

Populate it locally:

```dotenv
FIREBASE_PROJECT_ID=pocketlock-6c815
MONNIFY_API_KEY=your_sandbox_api_key
MONNIFY_SECRET_KEY=your_rotated_sandbox_secret
MONNIFY_CONTRACT_CODE=your_contract_code
MONNIFY_BASE_URL=https://sandbox.monnify.com
MONNIFY_DISBURSEMENT_ACCOUNT_NUMBER=your_monnify_wallet_account
CRON_SECRET=generate_a_long_random_value
```

Generate the cron secret:

```bash
openssl rand -hex 32
```

Upload the secrets:

```bash
npx supabase secrets set --env-file supabase/.env.secrets.local
```

Do not add `SUPABASE_SERVICE_ROLE_KEY`. Supabase injects it automatically into Edge
Functions. Never place it in the Expo `.env`.

Because the previous Monnify secret was pasted into chat, rotate it before live use.

## 5. Deploy Edge Functions

```bash
npx supabase functions deploy monnify-api --no-verify-jwt
npx supabase functions deploy monnify-webhook --no-verify-jwt
npx supabase functions deploy reconcile-monnify --no-verify-jwt
```

`--no-verify-jwt` is intentional. The app sends a Firebase ID token—not a Supabase
Auth token. `monnify-api` verifies the Firebase token itself using Google's JWKS,
audience `pocketlock-6c815`, and issuer
`https://securetoken.google.com/pocketlock-6c815`.

The public Supabase publishable key only permits invoking Edge Functions. It cannot
read the financial tables because RLS has no anon policies.

## 6. Configure the Monnify webhook

Use this URL for both Transaction Completion and Disbursement webhooks:

```text
https://mhfoovyblfbtenowinrc.supabase.co/functions/v1/monnify-webhook
```

The webhook:

- Accepts POST only
- Verifies `monnify-signature` with HMAC-SHA512 over the raw body
- Handles successful reserved-account deposits
- Handles successful, failed, and reversed transfers
- Uses idempotency event IDs
- Restores funds atomically after failed/reversed transfers

## 7. Enable the 15-minute reconciler

1. Open `supabase/cron.sql.example`.
2. Replace `REPLACE_WITH_THE_SAME_RANDOM_VALUE` with the same `CRON_SECRET` uploaded
   to Edge Function secrets.
3. Run the SQL in **Supabase Dashboard → SQL Editor**.

This invokes `reconcile-monnify` every 15 minutes. It settles transfers if a webhook
is delayed or missed.

## 8. Run the app

The ignored `.env` already contains:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://mhfoovyblfbtenowinrc.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_public_publishable_key
EXPO_PUBLIC_ENABLE_SUPABASE_BACKEND=true
```

Run:

```bash
npm install
npm run typecheck
npm test
npm run android
```

## 9. Test sandbox end to end

1. Create a monthly budget. The app writes it to Firestore and synchronizes only
   financial targets to Supabase.
2. Open Emergency Fund and set a PIN. Supabase stores only a PBKDF2 hash and random
   salt, with five-attempt lockout.
3. Create the Monnify funding account. BVN/NIN is sent directly to Monnify and is not
   stored in Firebase, Supabase, or device persistence.
4. Use Monnify's sandbox payment simulator to fund the reserved account.
5. Confirm Supabase `wallet_balances` fills Emergency Savings first, Fixed Savings
   second, and available balance last.
6. Enter a destination account and run Monnify Name Enquiry.
7. Submit the PIN-gated withdrawal.
8. Confirm the request reaches `completed`, `failed`, or `reversed`.
9. Replay a webhook and confirm balances are not credited twice.

## 10. Free-tier limitations

This setup avoids Firebase Blaze, but a free backend is still subject to Supabase
free-tier quotas, cold starts, project pausing, and resource limits. It is suitable
for development and an MVP pilot. Before handling meaningful live customer funds:

- Move to a non-pausing production plan.
- Add monitoring and alerts.
- Confirm Monnify outbound IP-whitelisting requirements.
- Confirm disbursement MFA/OTP configuration.
- Complete NDPR/KYC disclosures and operational reconciliation.
- Rotate sandbox credentials and use separate live credentials.
