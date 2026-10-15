import { createFirebaseVerifier } from './auth.js';
import { createAccounts, createPool, migrate } from './db.js';
import { createApp } from './server.js';

const port = Number(process.env.PORT || 10000);
const pool = createPool();
await migrate(pool);
const app = createApp({
  verifyToken: createFirebaseVerifier(),
  accounts: createAccounts(pool),
  origins: (process.env.ALLOWED_ORIGINS || '').split(','),
});
app.listen(port, '0.0.0.0', () => {
  console.log(`lockbudget-api listening on ${port}`);
});
