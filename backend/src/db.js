import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { planTopUp } from './ledger.js';

const require = createRequire(import.meta.url);
const { Pool } = require('pg');

export function createPool(databaseUrl = process.env.DATABASE_URL) {
  if (!databaseUrl) throw new Error('DATABASE_URL is not configured');
  const ssl = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')
    ? undefined
    : { rejectUnauthorized: false };
  return new Pool({ connectionString: databaseUrl, ssl, max: 5 });
}

export async function migrate(pool) {
  const sql = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '../sql/001_ledger.sql'),
    'utf8',
  );
  await pool.query(sql);
}

export function createAccounts(pool) {
  return {
    async open(uid) {
      await pool.query(
        'INSERT INTO ledger_accounts (firebase_uid) VALUES ($1) ON CONFLICT DO NOTHING',
        [uid],
      );
      const result = await pool.query(
        'SELECT available_kobo FROM ledger_accounts WHERE firebase_uid = $1',
        [uid],
      );
      return { availableKobo: Number(result.rows[0].available_kobo) };
    },
    async postTopUp({ uid, amountKobo, idempotencyKey, fingerprint }) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(
          'INSERT INTO ledger_accounts (firebase_uid) VALUES ($1) ON CONFLICT DO NOTHING',
          [uid],
        );
        const account = await client.query(
          'SELECT available_kobo FROM ledger_accounts WHERE firebase_uid = $1 FOR UPDATE',
          [uid],
        );
        const existing = await client.query(
          `SELECT fingerprint, response_json
           FROM ledger_entries
           WHERE firebase_uid = $1 AND idempotency_key = $2`,
          [uid, idempotencyKey],
        );
        const decision = planTopUp({
          balanceKobo: Number(account.rows[0].available_kobo),
          amountKobo,
          fingerprint,
          existing: existing.rowCount
            ? {
                fingerprint: existing.rows[0].fingerprint,
                response: existing.rows[0].response_json,
              }
            : null,
        });
        if (decision.error) {
          await client.query('ROLLBACK');
          return decision;
        }
        if (decision.replay) {
          await client.query('COMMIT');
          return { response: decision.replay, replay: true };
        }
        const response = {
          id: randomUUID(),
          status: 'posted',
          amountKobo,
          availableKobo: decision.nextBalanceKobo,
          money: 'server-test',
        };
        await client.query(
          `INSERT INTO ledger_entries
             (id, firebase_uid, kind, amount_kobo, fingerprint, idempotency_key, response_json)
           VALUES ($1, $2, 'topup.claim', $3, $4, $5, $6::jsonb)`,
          [response.id, uid, amountKobo, fingerprint, idempotencyKey, JSON.stringify(response)],
        );
        await client.query(
          'UPDATE ledger_accounts SET available_kobo = $2 WHERE firebase_uid = $1',
          [uid, decision.nextBalanceKobo],
        );
        await client.query('COMMIT');
        return { response, replay: false };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
  };
}
