import { createServer } from 'node:http';

const maxBody = 1024;

export function createApp({ verifyToken, accounts, origins = [] }) {
  const allowed = new Set(origins.filter(Boolean));
  return createServer(async (req, res) => {
    const origin = req.headers.origin;
    if (origin && allowed.has(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    }
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }
    try {
      const url = new URL(req.url, 'http://localhost');
      if (req.method === 'GET' && url.pathname === '/health') {
        send(res, 200, { ok: true, service: 'lockbudget-api', money: 'server-owned-test' });
        return;
      }
      const user = await identify(req, verifyToken);
      if (req.method === 'GET' && url.pathname === '/v1/me') {
        send(res, 200, { uid: user.uid });
        return;
      }
      if (req.method === 'GET' && url.pathname === '/v1/account') {
        const account = await accounts.open(user.uid);
        send(res, 200, {
          uid: user.uid,
          availableKobo: account.availableKobo,
          money: 'server-test',
        });
        return;
      }
      if (req.method === 'POST' && url.pathname === '/v1/test-topup') {
        const body = await readJson(req);
        if (typeof body.idempotencyKey !== 'string' || body.idempotencyKey.length < 8) {
          send(res, 400, { error: 'invalid-key' });
          return;
        }
        const result = await accounts.postTopUp({
          uid: user.uid,
          amountKobo: body.amountKobo,
          idempotencyKey: body.idempotencyKey,
          fingerprint: String(body.amountKobo),
        });
        if (result.error) {
          send(res, result.status, {
            error: result.error,
            limitKobo: result.limitKobo,
            remainingKobo: result.remainingKobo,
          });
          return;
        }
        send(res, result.replay ? 200 : 201, result.response);
        return;
      }
      send(res, 404, { error: 'not-found' });
    } catch (error) {
      const status = error.status || 500;
      send(res, status, { error: status === 500 ? 'unavailable' : 'denied' });
    }
  });
}

async function identify(req, verifyToken) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer ([A-Za-z0-9._~+/-]+=*)$/);
  if (!match) throw Object.assign(new Error('missing-token'), { status: 401 });
  if (req.headers['content-length'] && Number(req.headers['content-length']) > maxBody) {
    throw Object.assign(new Error('too-large'), { status: 413 });
  }
  return verifyToken(match[1]);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxBody) {
        reject(Object.assign(new Error('too-large'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          reject(Object.assign(new Error('invalid-body'), { status: 400 }));
          return;
        }
        resolve(parsed);
      } catch {
        reject(Object.assign(new Error('invalid-body'), { status: 400 }));
      }
    });
    req.on('error', () => reject(Object.assign(new Error('unavailable'), { status: 500 })));
  });
}

function send(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(JSON.stringify(body));
}
