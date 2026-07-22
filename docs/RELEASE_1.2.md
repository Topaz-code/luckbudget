# LockBudget 1.2 stabilization release

- Fixed repeated full-screen account bootstrap on Firebase token refresh.
- Replaced “Securing your account” with a one-time “Loading your budget” bootstrap.
- Fixed sign-in/sign-up navigation races.
- Added password reset.
- Added visible guest/cloud-sync status and account profile.
- Added per-Firebase-UID cache isolation and cloud budget restoration.
- Added an explicit Lock & Save Wallet entry on the dashboard.
- Added unavoidable sandbox warnings to test wallet screens.
- Replaced the generated logo with a deterministic flat vector lock-wallet mark.
- Explicitly bundled Material Community Icons to remove square/missing glyphs.
- Fixed new-budget rollover so it does not fabricate carry-over from days before the plan existed.
