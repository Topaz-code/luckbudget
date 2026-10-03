# LOCKBUDGET — GAP REPORT & BUSINESS LOGIC ANALYSIS

**Generated:** Phase 1 Discovery & Audit  
**Purpose:** Enumerate all omitted states, edge conditions, and unresolved business rules with proposed defaults per Rule 2.4.

---

## 1. Missing Edge-Case States (Design Gaps)

Every newly generated state or screen will be tagged with `// NON-FIGMA: <reason>` in code and utilize strict design system tokens.

| Flow / Module | Missing State / Edge Case | Justification for Implementation | Proposed Visual Treatment |
|---|---|---|---|
| **Onboarding** | Network timeout during Virtual Account provisioning | If the banking partner API times out while generating the Wema/Providus virtual account, the user cannot proceed to funding. | Retry modal with Otis sad mascot (`06_otis_sad.png`), "Retry Account Creation" primary button, and "Skip for now" secondary option. |
| **Home Dashboard** | Zero Allowance State (All funds spent for today) | User spent their entire daily allowance of ₦7,500.00. | Hero allowance card displays ₦0.00 with muted teal background, countdown timer to midnight rollover ("Resets in 4h 12m"), and "Top-Up Today's Allowance" CTA. |
| **Home Dashboard** | First-Time Fresh Account (No funds deposited yet) | User skipped first funding and opened dashboard with ₦0.00 total balance. | Pulsing top-up callout banner above category cards: "Your LockBudget vault is currently empty. Fund your account to activate your daily allowance." |
| **Quick Spend** | Category Balance Depleted | User tries to spend ₦3,000 on Food when remaining food allowance is ₦1,200. | Red outline alert on currency input: "Exceeds remaining Food budget (₦1,200.00). Use Emergency Fund or adjust budget." |
| **Quick Spend** | Double-tap / Idempotency Lock | User rapidly taps "Release" button twice in succession. | Immediate button disablement on first tap with animated circular spinner; idempotency key generated per session. |
| **Savings Hub** | Empty Savings Vault (No active locks) | User opens Savings tab before creating any Goal, Period, or Year locks. | Empty state illustration with Otis safe mascot (`04_otis_safe.png`), copy: "No locked savings yet. Choose a lock method below to earn up to 14% p.a. and build disciplined wealth." |
| **Savings Hub** | Lock Maturity Reached | Goal or Period duration reaches 100% completion. | Celebration modal with Otis confetti (`05_otis_confetti.png`), "Congratulations! Your lock has matured", and dual CTA: "Roll over into new lock (+2% bonus)" or "Transfer to main allowance". |
| **Savings Hub** | Early Unlock / Break Penalty Confirmation | User demands premature access to locked funds before maturity date. | Destructive warning sheet: "Breaking this lock incurs a 5% early liquidation penalty (₦1,000.00 fee) and forfeiture of accrued interest. Are you sure?", requiring 4-digit PIN confirmation. |
| **Activity History** | Zero Transactions State | Brand new user opens Activity tab before making any transactions. | Centered Otis ledger graphic with copy: "No transactions yet. Releases and top-ups will appear here with instant receipts." |
| **Activity History** | Filter Returns Zero Results | User searches for "Starbucks" or selects date range with no items. | Search empty state: "No transactions found matching '...'", with a "Clear Filters" button. |
| **Security & Auth** | Biometric Hardware Missing / Denied | User device does not support FaceID/Fingerprint or user revoked system permission. | Graceful fallback to 4-digit Master Security PIN with localized error toast. |
| **Offline Operation** | Stale Cached Ledger | User opens app without internet connection. | Top banner: "Offline Mode — Showing cached balance as of 10:24 AM. New transactions will be queued." Offline spend permitted only up to pre-authorized offline allowance cache. |
| **Account Deletion** | Outstanding Balance Safeguard | User tries to delete account while still holding funds in LockBudget or active savings vaults. | Blocker dialog: "Account cannot be deleted while holding an active balance of ₦184,250.00. Please withdraw all funds to your personal bank account first." |

---

## 2. Business Logic Clarification Protocol (Rule 2.4 Questions)

Below is the prioritized list of business logic ambiguities that cannot be resolved solely from the UI designs. For each, we propose an intelligent, secure default to prevent project stall:

### Question 1: Daily Allowance Rollover Mechanic
* **Affected Screens:** `home-dashboard 1`, `Group 3 (Budget Setup)`, `budget 1`
* **What is Unclear:** When the 24-hour day ends at 00:00, what happens to unspent allowance from that day?
  - *Option A:* Unspent allowance automatically rolls over into the next day's spending pool (e.g. ₦3,000 left + ₦7,500 new = ₦10,500 available tomorrow).
  - *Option B:* Unspent allowance is automatically swept into a "Savings Vault" or retained in the total balance pool, resetting the daily allowance strictly to ₦7,500.00.
* **Proposed Default:** **Option B (Discipline-First Vault Sweep)**. Since the core product premise is "LockBudget" (disciplined spending without lifestyle inflation), unspent funds return to the total balance/savings, and each day starts with the exact agreed daily allowance.

### Question 2: Early Savings Lock Liquidation ("Break Lock") Policy
* **Affected Screens:** `save-goal-detail 1`, `save-period-detail 1`, `emergency_all 1`
* **What is Unclear:** Are savings locks strictly irreversible until maturity, or can users break locks in emergencies, and if so, what penalty applies?
* **Proposed Default:** **Emergency Unlock with 5% Penalty & PIN Challenge**. Users can break a Goal or Period lock only through the 4-step Emergency Flow (`emergency_all 1`), incurring a 5% administrative penalty on the withdrawn amount and forfeiture of unpaid interest, requiring transaction PIN authorization. Year locks cannot be broken during the first 90 days.

### Question 3: Quick Spend "Release" Settlement Architecture
* **Affected Screens:** `quick-spend-review 1`, `quick-spend-processing 1`, `quick-spend-receipt 1`
* **What is Unclear:** When a user taps "Release" on a Quick Spend (e.g. ₦2,000 Food), does LockBudget:
  - *Option A:* Disburse funds instantly to the user's linked personal commercial bank account (via NIP / Paystack / Flutterwave payout)?
  - *Option B:* Generate a virtual prepaid debit card / QR code for in-store point-of-sale spending?
  - *Option C:* Debit the category allocation internally in LockBudget's digital wallet balance?
* **Proposed Default:** **Option C internally with Option A withdrawal capability**. "Release" marks the expense as debited from the daily allowance inside the LockBudget ledger immediately, generating an instant receipt; users can subsequently withdraw their liquid allowance to their external bank account at any time via the Withdrawal Flow (`withdrawal-amount 1`).

### Question 4: Identity & KYC Tier Limits (Nigerian Financial Regulations)
* **Affected Screens:** `Group 4`, `user-profile 2`, `top-up-account-details 1`
* **What is Unclear:** What transaction and holding limits apply to newly registered accounts before BVN / NIN verification?
* **Proposed Default:** **Tier 1 Regulatory Defaults (CBN)**:
  - *Tier 1 (Phone & Name only):* Maximum single deposit ₦50,000, cumulative balance limit ₦300,000, daily spend limit ₦10,000.
  - *Tier 2 (BVN / NIN verified):* Single deposit up to ₦200,000, cumulative limit ₦500,000.
  - *Tier 3 (Address & ID verified):* Unlimited balance and transactions.

### Question 5: Interest Rate Yields on Savings Locks
* **Affected Screens:** `save-home 1`, `save-year-setup 1`, `save-period-setup 1`
* **What is Unclear:** What annualized percentage yields (APY / p.a.) should be rendered on the Savings Lock cards?
* **Proposed Default:**
  - *Save till Goal:* **10.5% p.a.** (Flexible deposit, calculated daily).
  - *Save for a Period (3-6 months):* **12.0% p.a.** (Fixed term).
  - *Save for a Year (365 days):* **14.0% p.a.** (Maximum lock yield).
