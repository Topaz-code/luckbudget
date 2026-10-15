import assert from 'node:assert/strict';
import test from 'node:test';
import { createApp } from '../src/server.js';

function start(overrides = {}) {
  const calls = [];
  const app = createApp({
    origins: ['https://preview.example'],
    verifyToken: async (token) => {
      calls.push(token);
      if (token === 'good') return { uid: 'firebase-A' };
      if (token === 'guest') throw Object.assign(new Error('guest'), { status: 403 });
      throw Object.assign(new Error('bad'), { status: 401 });
    },
    accounts: {
      async open(uid) {
        calls.push(uid);
        return { availableKobo: 0 };
      },
    },
    ...overrides,
  });
  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => {
      resolve({
        calls,
        url: `http://127.0.0.1:${server.address().port}`,
        close: () => new Promise((done) => server.close(done)),
      });
    });
  });
}

async function get(url, headers) {
  const response = await fetch(url, { headers });
  return { status: response.status, body: await response.json() };
}

test('health is public and account starts at zero for the token user only', async () => {
  const server = await start();
  try {
    const health = await get(`${server.url}/health`);
    assert.equal(health.status, 200);
    assert.equal(health.body.money, 'server-owned-test');
    const denied = await get(`${server.url}/v1/account?uid=firebase-B`);
    assert.equal(denied.status, 401);
    const account = await get(`${server.url}/v1/account?uid=firebase-B`, {
      Authorization: 'Bearer good',
    });
    assert.equal(account.status, 200);
    assert.deepEqual(account.body, {
      uid: 'firebase-A',
      availableKobo: 0,
      money: 'server-test',
    });
    assert.deepEqual(server.calls, ['good', 'firebase-A']);
  } finally {
    await server.close();
  }
});

test('bad and anonymous tokens stay outside the ledger', async () => {
  const server = await start();
  try {
    assert.equal((await get(`${server.url}/v1/me`, { Authorization: 'Bearer bad' })).status, 401);
    assert.equal((await get(`${server.url}/v1/me`, { Authorization: 'Bearer guest' })).status, 403);
    assert.deepEqual(server.calls, ['bad', 'guest']);
  } finally {
    await server.close();
  }
});

test('test top-up uses the token user and cannot set the balance', async () => {
  const posted = [];
  const server = await start({
    accounts: {
      async open() {
        return { availableKobo: 0 };
      },
      async postTopUp(input) {
        posted.push(input);
        if (input.amountKobo > 5000000) return { error: 'topup-limit', status: 403 };
        return {
          response: { status: 'posted', availableKobo: input.amountKobo, money: 'server-test' },
          replay: false,
        };
      },
    },
  });
  try {
    const created = await fetch(`${server.url}/v1/test-topup`, {
      method: 'POST',
      headers: { Authorization: 'Bearer good', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amountKobo: 100000,
        availableKobo: 999999999,
        uid: 'firebase-B',
        idempotencyKey: 'topup-key-1',
      }),
    });
    assert.equal(created.status, 201);
    assert.equal(posted[0].uid, 'firebase-A');
    assert.equal(posted[0].amountKobo, 100000);
    assert.equal(posted[0].fingerprint, '100000');
    const limited = await fetch(`${server.url}/v1/test-topup`, {
      method: 'POST',
      headers: { Authorization: 'Bearer good', 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountKobo: 5000001, idempotencyKey: 'topup-key-2' }),
    });
    assert.equal(limited.status, 403);
  } finally {
    await server.close();
  }
});

test('browser preview origin is allowed and other origins are not reflected', async () => {
  const server = await start();
  try {
    const ok = await fetch(`${server.url}/health`, { headers: { Origin: 'https://preview.example' } });
    assert.equal(ok.headers.get('access-control-allow-origin'), 'https://preview.example');
    const blocked = await fetch(`${server.url}/health`, { headers: { Origin: 'https://evil.example' } });
    assert.equal(blocked.headers.get('access-control-allow-origin'), null);
  } finally {
    await server.close();
  }
});
