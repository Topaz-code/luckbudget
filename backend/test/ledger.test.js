import assert from 'node:assert/strict';
import test from 'node:test';
import { planTopUp } from '../src/ledger.js';

test('top-up posts once, replays the same result, and rejects a changed retry', () => {
  const first = planTopUp({ balanceKobo: 0, amountKobo: 100000, fingerprint: '100000', existing: null });
  assert.equal(first.nextBalanceKobo, 100000);
  const replay = planTopUp({
    balanceKobo: 100000,
    amountKobo: 100000,
    fingerprint: '100000',
    existing: { fingerprint: '100000', response: { availableKobo: 100000 } },
  });
  assert.deepEqual(replay.replay, { availableKobo: 100000 });
  const changed = planTopUp({
    balanceKobo: 100000,
    amountKobo: 200000,
    fingerprint: '200000',
    existing: { fingerprint: '100000', response: { availableKobo: 100000 } },
  });
  assert.equal(changed.status, 409);
});

test('top-up keeps the existing single and balance caps', () => {
  assert.equal(planTopUp({ balanceKobo: 0, amountKobo: 5000001, fingerprint: '5000001', existing: null }).error, 'topup-limit');
  assert.equal(planTopUp({ balanceKobo: 29900000, amountKobo: 200000, fingerprint: '200000', existing: null }).error, 'balance-limit');
  assert.equal(planTopUp({ balanceKobo: 0, amountKobo: 0, fingerprint: '0', existing: null }).status, 400);
});
