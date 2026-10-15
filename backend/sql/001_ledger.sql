CREATE TABLE IF NOT EXISTS ledger_accounts (
  firebase_uid text PRIMARY KEY CHECK (char_length(firebase_uid) BETWEEN 1 AND 128),
  available_kobo bigint NOT NULL DEFAULT 0 CHECK (available_kobo >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id uuid PRIMARY KEY,
  firebase_uid text NOT NULL REFERENCES ledger_accounts (firebase_uid),
  kind text NOT NULL CHECK (kind = 'topup.claim'),
  amount_kobo bigint NOT NULL CHECK (amount_kobo > 0),
  fingerprint text NOT NULL CHECK (char_length(fingerprint) BETWEEN 1 AND 128),
  idempotency_key text NOT NULL CHECK (char_length(idempotency_key) BETWEEN 1 AND 128),
  response_json jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (firebase_uid, idempotency_key)
);
