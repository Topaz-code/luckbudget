# LockBudget

A mobile-first budgeting and savings enforcement app for Nigerian students and
individuals who want stronger financial discipline.

## Stack

- Expo SDK 57 / React Native / TypeScript
- React Native Paper
- React Navigation v6
- Zustand
- Firebase Spark (Auth, Firestore, Messaging)
- Supabase (private Postgres ledger and Edge Functions)
- Monnify (server-side integration through Supabase only)

## Requirements

- Node.js 22.13 or newer (Expo SDK 57 minimum)
- npm
- Android Studio or Xcode, or Expo Go for supported development flows

## Start

```bash
cp .env.example .env
npm install
npm run start
```

Then press `a` for Android or `i` for iOS (macOS required for the iOS simulator).

## Quality checks

```bash
npm run typecheck
npm run lint
npm test
```

## Implemented

- Budget onboarding with Income, Fixed Expenses, and Variable Expenses sections
- Real-time totals and positive/negative remaining balance feedback
- Collapsible sections, field hints, and validated Naira inputs
- Persistent local budget draft and Daily Plan handoff
- Premium sign-up, sign-in, guest mode, profile, and visible cloud-sync status
- Firebase anonymous and email/password authentication with safe UID-preserving upgrades
- Firestore monthly-budget sync with authenticated user isolation and per-user device-cache separation
- Secure Firestore rules, indexes, profile bootstrap, and push-token registration
- Mobile dashboard with live daily allowance and monthly budget progress
- Locked emergency fund and fixed-savings summaries
- Cloud-backed to-do reminder strip and pull-to-refresh states
- Functional quick expense logging with offline queue and Firestore sync
- Enforced daily spending limits with rollover or daily-reset preferences
- Lock modal when an expense would exceed or exactly consume the daily allowance
- Cross-device monthly expense hydration for accurate rollover calculations
- PIN-gated emergency withdrawals with configurable monthly limits
- Server-authoritative emergency balances, attempt lockout, and plan recalculation
- Budget-mapped to-dos with scheduled allowance reservations and conditional reminders
- Offline task CRUD, Firestore sync, completion states, and safe deletion tombstones
- Monthly reports with category charts, savings, emergency usage, streaks, and coaching
- Monnify reserved accounts, locked sub-ledgers, bank verification, payouts, and webhooks
- Loading, retry, disabled, and save error states

## Architecture

Features live under `src/features`; cross-feature UI lives under `src/components`;
third-party boundaries live under `src/services`. Money is represented as integer
kobo in persisted/domain models to avoid floating-point errors.

Monnify credentials must never be included in the mobile app. They are stored as
Supabase Edge Function secrets and accessed only by trusted backend code.

Complete deployment instructions are in [`docs/API_SETUP_GUIDE.md`](docs/API_SETUP_GUIDE.md).
For a no-billing Firebase setup, use [`docs/FIREBASE_SPARK_SETUP.md`](docs/FIREBASE_SPARK_SETUP.md).
