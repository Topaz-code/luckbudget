# LockBudget API Setup

## ⚙️ API Setup Guide

LockBudget now uses a hybrid backend that avoids Firebase Blaze:

- Firebase Spark for Authentication and Firestore
- Supabase Free for Postgres and Edge Functions
- Monnify for reserved accounts and disbursements

Follow the complete current guide:

**[`SUPABASE_HYBRID_SETUP.md`](SUPABASE_HYBRID_SETUP.md)**

The earlier Firebase Cloud Functions architecture has been removed from the project.
Do not deploy Firebase Functions and never place Monnify credentials in the Expo
client.
