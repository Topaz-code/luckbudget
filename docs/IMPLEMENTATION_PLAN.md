# LOCKBUDGET — IMPLEMENTATION PLAN & ARCHITECTURE ROADMAP

**Generated:** Phase 1 Discovery & Audit  
**Status:** Awaiting Approval at ✋ Phase 1 Checkpoint

---

## 1. Architectural Strategy

We will maintain and elevate the existing modular, feature-first structure in `lockbudget_app`:

```
lockbudget_app/
├── lib/
│   ├── core/
│   │   ├── theme/
│   │   │   ├── app_theme.dart          # ThemeData, Color tokens, Source Sans 3 typography
│   │   │   ├── app_colors.dart         # Hex constants verified from Penpot AST
│   │   │   ├── app_typography.dart     # Font scales, weights, line-heights
│   │   │   └── app_dimens.dart         # 14px button radius, 18-21px card radii, 4px grid
│   │   ├── routing/
│   │   │   └── app_router.dart         # Declarative routes & deep links
│   │   ├── services/
│   │   │   ├── auth_service.dart       # Abstract interface + MockAuthService
│   │   │   ├── wallet_service.dart     # Abstract interface + MockWalletService
│   │   │   ├── bank_service.dart       # Abstract interface + MockBankService
│   │   │   ├── savings_service.dart    # Abstract interface + MockSavingsService
│   │   │   └── storage_service.dart    # Local persistence & offline cache
│   │   └── widgets/                    # 14 Reusable UI Components
│   │       ├── app_button.dart
│   │       ├── currency_input_field.dart
│   │       ├── status_badge.dart
│   │       ├── otis_avatar.dart
│   │       ├── custom_app_bar.dart
│   │       ├── custom_nav_bar.dart
│   │       └── modal_sheet_shell.dart
│   ├── features/
│   │   ├── onboarding/                 # Screens: Group 4, Group 3, first-funding-prompt 1
│   │   ├── home/                       # Screens: home-dashboard, top-up modal
│   │   ├── quickspend/                 # Screens: quick-spend 4-step flow, category variants
│   │   ├── withdrawal/                 # Screens: withdrawal 4-step flow
│   │   ├── save/                       # Screens: save-home, goal/period/year locks, details
│   │   ├── budget/                     # Screens: budget, budget-recap, recap_all
│   │   ├── activity/                   # Screens: activity, detail variants, sync delayed
│   │   └── profile/                    # Screens: profile window, security, banks, support
│   └── state/
│       ├── app_state.dart              # ChangeNotifier core reactive state
│       └── models/                     # Clean immutable models
│           ├── budget_models.dart
│           ├── transaction_models.dart
│           └── savings_models.dart
```

### State Management & Data Flow:
* **Reactive State Management:** Retain and strengthen `ChangeNotifier` + `ListenableBuilder` (already functioning cleanly in `lockbudget_app`), keeping state immutable and testable.
* **Service / Repository Abstraction:** All banking, wallet transactions, savings lock creation, and KYC data will be managed behind abstract service contracts (`WalletService`, `BankService`), backed by high-fidelity local mock engines that simulate network latency, offline queuing, and realistic webhook callbacks.
* **Offline First:** Local caching using `shared_preferences` allows balance display and offline spend queuing when network connectivity drops.

---

## 2. Recommended Dependency Upgrades (`pubspec.yaml`)

To deliver exact typography, currency formatting, and offline readiness without introducing bloat:

| Package | Version | Purpose & Justification |
|---|---|---|
| `google_fonts` | `^6.2.1` | **Figma Design Fidelity.** Provides exact `Source Sans 3` and `Source Sans Pro` fonts. |
| `intl` | `^0.19.0` | **Currency & Date Formatting.** Formats Naira amounts `₦#,##0.00` and date grouping ("TODAY", "YESTERDAY"). |
| `shared_preferences` | `^2.2.3` | **Local Persistence.** Persists onboarding state, cached ledger, user profile, and offline transactions. |
| `flutter_svg` | `^2.0.10` | **Vector Assets.** Renders Figma SVG icons cleanly across all screen densities. |
| `share_plus` | `^10.0.0` | **Receipt Sharing.** Enables sharing official Quick Spend, Withdrawal, and Savings lock receipts. |
| `local_auth` | `^2.2.0` | **Biometric Authentication.** FaceID and Fingerprint unlock on iOS and Android. |

---

## 3. Prioritized Feature Batches & Execution Roadmap

```mermaid
gantt
    title LockBudget Implementation Sequence
    dateFormat  YYYY-MM-DD
    section Phase 1
    Discovery & Audit (✋ Checkpoint) :done, p1, 2026-10-03, 1d
    section Phase 2
    Foundation & Design Tokens       :active, b0, after p1, 2d
    section Phase 3
    Batch 1: Onboarding & Auth       :b1, after b0, 2d
    Batch 2: Home & Quick Spend      :b2, after b1, 3d
    Batch 3: Savings Hub & Vaults    :b3, after b2, 3d
    Batch 4: Budget, Recap & Activity:b4, after b3, 3d
    Batch 5: Profile, Banks & Support:b5, after b4, 3d
    section Phase 4 & 5
    Gap Filling & API Readiness      :b6, after b5, 2d
    section Phase 6
    QA, Polish & Handoff             :b7, after b6, 2d
```

### **Batch 0 — Foundation & Design System (Phase 2)**
* **Deliverables:**
  1. Complete `AppTheme` refactor with verified Penpot hex tokens (`#0E3039`, `#37B1A7`, `#E1EAE8`, etc.).
  2. Implement `Source Sans 3` typography across all TextTheme levels.
  3. Build the 14 core reusable components (`AppButton`, `AllowanceHeroCard`, `TransactionListTile`, `StatusBadge`, `CurrencyInputField`, `OtisAvatar`, etc.).
  4. Create declarative route registry covering every screen in the inventory.
  5. Abstract service interfaces (`AuthService`, `WalletService`, `BankService`, `SavingsService`) with realistic fake data generators.
* **Scope:** 14 shared components + foundation infrastructure.

### **Batch 1 — Onboarding, Auth, & First Funding (Phase 3)**
* **Deliverables:**
  1. `Group 4` (Onboarding Intro Screen) with Otis reading mascot (`01_otis_book.png`) and Google/Login hooks.
  2. `Group 3` (Monthly Budget Setup Screen) with income & expense sliders, Otis tux (`02_otis_tux.png`), and "Lock it in" action.
  3. `first-funding-prompt 1` with virtual bank account copy interaction, transfer confirmation, and fund later bypass.
  4. Non-Figma error and timeout states for account creation.
* **Scope:** 3 screens + 2 edge-case modals.

### **Batch 2 — Home Dashboard & Quick Spend Engine (Phase 3)**
* **Deliverables:**
  1. `home-dashboard 1` and `home-dashboard--full 1` with dynamic allowance calculation, quick category cards, and recent transactions.
  2. `top-up-account-details 1` modal bottom sheet with clipboard feedback.
  3. Complete 4-step Quick Spend Flow (`quick-spend-amount 1`, `quick-spend-review 1`, `quick-spend-processing 1`, `quick-spend-receipt 1`).
  4. 4-step Bank Withdrawal Flow (`withdrawal-amount 1`, `withdrawal-review 1`, `withdrawal-processing 1`, `withdrawal-receipt 1`).
  5. Category quick-send presets from `quicksend_food_all 1` and `quicksend_internet_all 1`.
* **Scope:** 10 screens + category preset components.

### **Batch 3 — Savings Hub & Vault Locks (Phase 3)**
* **Deliverables:**
  1. `save-home 1` with Otis safe mascot (`04_otis_safe.png`) and 3 lock card triggers.
  2. Save till Goal Flow (`save-goal-setup 1`, `save-goal-review 1`, `save-goal-success 1`, `save-goal-receipt 1`, `save-goal-detail 1`).
  3. Save for a Period Flow (`save-period-setup 1`, `save-period-review 1`, `save-period-success 1`, `save-period-receipt 1`, `save-period-detail 1`).
  4. Save for a Year Flow (`save-year-setup 1`, `save-year-review 1`, `save-year-success 1`, `save-year-receipt 1`, `save-year-detail 1`).
  5. Goal Top-Up Flow (setup, review, processing, receipt).
  6. `save-receipts 1` lock certificate archive.
* **Scope:** 17 screens/states.

### **Batch 4 — Budget Management, Monthly Recap, & Activity History (Phase 3)**
* **Deliverables:**
  1. `budget 1` & `budget--full 1` monthly budget allocation editor.
  2. `budget-recap 1` & `budget-recap--full 1` spending efficiency analytics and Otis badge.
  3. `recap_all 1` historical monthly recap selector.
  4. `activity 1` searchable transaction history with date filters.
  5. `activity-detail 1` and all 11 specific transaction variant states (Food, Internet, Electricity, Emergency, Top-up, Save, Withdrawal, Pending, Failed, Failed Full RCA, Sync Delayed).
* **Scope:** 17 screens/states.

### **Batch 5 — Profile, Security, Settings, & System Edge Cases (Phase 3 & Phase 4)**
* **Deliverables:**
  1. `profile-window 2` slide-over bottom sheet and `user-profile 2` / `user-profile--full 1`.
  2. `personal-bank-account 2` management and bank addition flow.
  3. `security-settings 2` (biometric toggle, PIN change, session timeout).
  4. `notification-settings 2` preferences toggles.
  5. `help-support 2` (FAQ accordions, live chat simulator, WhatsApp deep link).
  6. `settings 2` & `settings--full 1` app preferences.
  7. `delete-account-confirmation 2` destructive account deletion safeguard.
  8. Full implementation of the 6 Failure States (`failure_states_all 1`), 6 Emergency Unlock States (`emergency_all 1`), 6 Offline States (`offline_all 1`), and 6 Account Security States (`profile_account_all 1`).
* **Scope:** 25 screens/states + edge-case flows.

### **Batch 6 — Quality Assurance, Golden Tests, & Handoff (Phase 6)**
* **Deliverables:**
  1. Zero `flutter analyze` lints and clean `dart format`.
  2. Unit tests for budget math, allowance calculations, and lock maturity rules.
  3. Golden widget tests comparing Flutter renders against `figma_renders/` PNGs.
  4. Comprehensive `README.md` with instructions for swapping mock services to real banking APIs (Paystack, Flutterwave, Mono, Stitch).
* **Scope:** Test suites, documentation, and final production builds.

---

## 4. Phase 1 Checkpoint Summary

✋ **STOP PROTOCOL:**  
Phase 1 Discovery & Audit is complete. All findings, exact tokens, screen counts, navigation topologies, missing states, and batch plans are thoroughly documented and ready for your review and explicit approval before any Phase 2 code is written.
