# LockBudget test API

This is the first Render service for LockBudget. It checks a Firebase login, opens a server-owned test account at zero kobo, and can add explicit test money up to the existing ₦50,000 single and ₦300,000 balance caps. It does not withdraw, pay a bank, or copy balances off the phone. It is not a bank.

## How the phone connects

1. The app signs in with Firebase, as it already does.
2. The app asks Firebase for a short-lived ID token.
3. The app calls this service at its Render address, with the header `Authorization: Bearer <token>`.
4. Render checks the token with a Firebase Admin key that stays on Render.
5. The service uses the user ID inside that token. A user ID typed by the phone is ignored.
6. Postgres stores the test account. A first visit creates a zero balance. Nothing is copied from the phone.

The app needs only the public Render address. It must not contain the database password or the Firebase Admin key.

## What you do on Render

1. Create a Render account with your own email. Do not send passwords here.
2. Create a Postgres database named `lockbudget-ledger` on the Free plan. Free databases expire 30 days after creation, so this is only for the test.
3. Create a Web Service from the GitHub repository, with root directory `backend`, build command `npm install`, and start command `npm start`. Choose the Free plan. It sleeps when idle, so the first call after a pause can take about a minute.
4. In Firebase Console, open Project settings, then Service accounts, then generate a new private key. Put the whole JSON into the Render variable `FIREBASE_SERVICE_ACCOUNT`. Put `pocketlock-6c815` into `FIREBASE_PROJECT_ID`.
5. Connect the database so Render sets `DATABASE_URL`. Do not paste either secret into chat. Delete the downloaded key from your computer after Render accepts it.
6. After the service is live, copy its `https://...onrender.com` address. That is the only value the app will need.

## Local check

```sh
cd backend
npm install
npm test
```

The tests use a fake login. They do not contact Firebase or Render.
