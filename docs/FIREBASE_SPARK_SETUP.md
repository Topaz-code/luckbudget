# Firebase Spark setup for PocketLock

This project is already configured locally for Firebase project:

```text
pocketlock-6c815
```

## What “link the local project” means

It does not connect your phone or upload the app. It simply tells the Firebase CLI
which online Firebase project should receive rules/indexes when you run a deploy
command.

That association is stored in `.firebaserc`:

```json
{
  "projects": {
    "default": "pocketlock-6c815"
  }
}
```

This file has already been created. You do not need to run `firebase use --add`.

## Files already configured

- `.env` — cleaned Firebase web configuration
- `.firebaserc` — local CLI association
- `google-services.json` — Android Firebase configuration
- `app.config.ts` — automatically adds the Android file when present
- Supabase public configuration in `.env` — enables the Edge Function backend

Firebase web API keys are client identifiers, not Monnify-style server secrets.
Restrict them to the required Firebase APIs and app identifiers in Google Cloud
Console before release.

## Do these console steps

### 1. Authentication

1. Firebase Console → **Build → Authentication**.
2. Click **Get started**.
3. Open **Sign-in method**.
4. Enable **Anonymous**.
5. Enable **Email/Password**.

### 2. Firestore

1. Firebase Console → **Build → Firestore Database**.
2. Click **Create database**.
3. Choose **Production mode**.
4. Choose a location and create it. The location cannot be changed later.

### 3. Deploy only free-plan Firestore configuration

From a terminal:

```bash
cd lockbudget
npx firebase-tools login
npx firebase-tools use pocketlock-6c815
npx firebase-tools deploy --only firestore:rules,firestore:indexes
```

Do not deploy Functions on Spark:

```text
Do not run: firebase deploy --only functions
```

### 4. Run Android

```bash
npm install
npm run android
```

For an installable development build:

```bash
npm install -g eas-cli
eas login
eas init
eas build --profile development --platform android
```

After `eas init`, put the displayed project UUID into `.env`:

```dotenv
EXPO_PUBLIC_EAS_PROJECT_ID=the_uuid_from_eas_init
```

## Features available on Spark

- Anonymous Firebase sign-in
- Email/password service layer
- Firestore budgets and user isolation
- Expenses and Daily Lock
- To-do mapper and local reminders
- Monthly reports
- Device-local encrypted Emergency Fund PIN and virtual withdrawals

## Secure payment backend

Firebase Cloud Functions remain disabled. Supabase Edge Functions now provide the
trusted Monnify backend without requiring Firebase Blaze. Follow
`docs/SUPABASE_HYBRID_SETUP.md` to deploy the SQL migration, secrets, Edge Functions,
webhook, and reconciliation schedule.

Putting the Monnify secret in React Native, `.env`, or any `EXPO_PUBLIC_*` variable
would expose it to every app user.

## About the Firebase code copied from the console

Do not paste the console's `getAnalytics()` snippet into this React Native app.
Analytics is optional and the web snippet is not needed here. LockBudget already
initializes Firebase Auth, Firestore, and callable Functions conditionally in
`src/services/firebase/client.ts`.
