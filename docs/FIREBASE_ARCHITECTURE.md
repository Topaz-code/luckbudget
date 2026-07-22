# Firebase architecture

## Client initialization

`src/services/firebase/client.ts` initializes the modular Firebase SDK lazily. Auth
uses React Native AsyncStorage persistence. In development, an empty `.env` keeps
Firebase disabled so UI work can continue; production builds fail closed when the
configuration is absent.

## Authentication

`authService.ts` supports:

- Automatic anonymous sessions
- Email/password registration
- Linking an anonymous account to email/password without losing its UID/data
- Email/password sign-in
- Sign-out and auth-state observation

`FirebaseProvider` restores the session before the app navigator renders and
creates the user's minimal Firestore profile.

## Firestore paths

```text
users/{uid}
users/{uid}/budgets/{YYYY-MM}
users/{uid}/expenses/{expenseId}
users/{uid}/todos/{todoId}
users/{uid}/settings/{settingId}
users/{uid}/notificationTokens/{tokenId}
```

Money values are persisted as integer kobo and each financial document declares
`currency: "NGN"`.

## Security model

`firestore.rules` requires authentication and UID ownership for every client-readable
path. Monthly budgets are structurally validated, including non-negative fields and
server-recomputed total relationships. Unrecognized collections and subcollections
are denied by default.

Monnify accounts, balances, PIN hashes, withdrawal requests, and webhook events live
in Supabase tables protected by Row Level Security. They are not stored in Firestore.

## Push notifications

`registerPushToken` requests device permission and stores an Expo push token under
the authenticated user. Android delivery uses Firebase Cloud Messaging. Token
registration requires a physical device and `EXPO_PUBLIC_EAS_PROJECT_ID`.
