# Emergency Fund flow

## User flow

1. Open the locked Emergency Fund card or choose **Use Emergency Fund** from the daily-lock modal.
2. Create a four-digit emergency PIN if one is not configured.
3. Choose a monthly maximum of one or two withdrawals. It cannot change after the first withdrawal that month.
4. Enter an amount, a reason of at least five characters, and the PIN.
5. The callable backend verifies all limits atomically and releases the amount into the adjusted flexible plan.

## Security

Production PINs never enter Firestore. The Supabase Edge Function hashes the PIN with PBKDF2-SHA256 and a random salt. Withdrawal verification uses constant-time comparison, allows five failed attempts, and applies a 15-minute lockout.

Financial tables have Row Level Security enabled with no client policies. Only the Supabase Edge Function service role can read or write them.

For Firebase-disabled local development, the same UX uses a salted hash in Expo SecureStore (`WHEN_UNLOCKED_THIS_DEVICE_ONLY`) and applies the same attempt count and cooldown. Production builds fail closed when Firebase is missing.

## Transaction guarantees

A Firestore transaction:

- Loads the current monthly budget and locked wallet balance.
- Enforces the configured monthly request count.
- Rejects amounts above the available balance.
- Decrements the Emergency Fund.
- Creates an immutable withdrawal request.
- Adds released money to `adjustedRemainingKobo` for daily-plan recalculation.

With the Supabase backend enabled, requests move through `pending_transfer` to `completed`, `failed`, or `reversed` based on Monnify responses and signed webhooks. Device-local development retains `approved_virtual` simulation only when the Supabase backend is disabled.
