# LockBudget Penpot Prototype Flow

This document defines the clickable prototype flow for the Penpot design package in
`figma-export/lockbudget.penpot` and the matching SVG/PNG references.

## Prototype setup

- Viewport: 390 x 844 px
- Start point: `home-dashboard`
- Prototype mode: mobile portrait
- Navigation: `Navigate to` for full-screen transitions, `Back` for reversible detail
  views, and `Open overlay` only for the explicit popup/modal states.
- Scrollable frames: use the corresponding `--full` artboard as the scroll-content
  reference while keeping header/footer groups fixed.

## Primary happy path

| Step | Source frame | Trigger | Destination frame | Action |
| --- | --- | --- | --- | --- |
| 1 | `home-dashboard` | Tap Spend | `quick-spend-amount` | Navigate to |
| 2 | `quick-spend-amount` | Tap a budget line | `quick-spend-review` | Navigate to |
| 3 | `quick-spend-review` | Tap Confirm | `quick-spend-processing` | Navigate to |
| 4 | `quick-spend-processing` | After delay | `quick-spend-receipt` | Navigate to |
| 5 | `quick-spend-receipt` | Tap Done | `home-dashboard` | Navigate to |

## Budget and savings paths

| Source | Trigger | Destination |
| --- | --- | --- |
| `home-dashboard` | Tap budget/plan area | `budget` |
| `budget` | Tap View recap | `budget-recap` |
| `budget-recap` | Tap outcome: Withdraw | `budget-outcome` withdrawal confirmation |
| `budget-recap` | Tap outcome: Move to safe | `budget-outcome` safe confirmation |
| `budget-recap` | Tap outcome: Roll over | `budget-outcome` rollover confirmation |
| `home-dashboard` | Tap Save | `save-home` |
| `save-home` | Tap a goal | `save-goal-detail` |
| `save-home` | Tap a period | `save-period-detail` |
| `save-home` | Tap a yearly plan | `save-year-detail` |
| `save-goal-detail` | Tap Set up goal | `save-goal-setup` |
| `save-goal-setup` | Tap Continue | `save-goal-review` |
| `save-goal-review` | Tap Confirm | `save-goal-success` |
| `save-goal-detail` | Tap Top up | `save-goal-topup` |
| `save-goal-topup` | Tap Continue | `save-goal-topup-review` |
| `save-goal-topup-review` | Tap Confirm | `save-goal-topup-success` |

The period and yearly flows use the equivalent `save-period-*` and `save-year-*`
frames, including their review, receipt, and success states.

## Quick-spend variants

Each budget-line variant follows the same four-step sequence:

- Food: `03_quicksend_food`
- Electricity: `04_quicksend_electricity`
- Internet: `05_quicksend_internet`

The prototype should preserve the selected variant through review, processing, and
receipt instead of returning to the generic food state.

## Emergency and wallet paths

| Source | Trigger | Destination |
| --- | --- | --- |
| `home-dashboard` | Tap emergency fund | `emergency` |
| `emergency` | Tap Release override | `emergency` release-override frame |
| Release override | Tap Confirm | `emergency` cooldown-consequence frame |
| `home-dashboard` | Tap Top up/account | `top-up-account-details` |
| `top-up-account-details` | Tap Personal bank account | `personal-bank-account` |
| `personal-bank-account` | Tap Back | `top-up-account-details` |

## Profile and support paths

| Source | Trigger | Destination |
| --- | --- | --- |
| `home-dashboard` | Tap avatar | `profile-window` |
| `profile-window` | Tap View profile | `user-profile` |
| `profile-window` | Tap Settings | `settings` |
| `settings` | Tap Notifications | `notification-settings` |
| `settings` | Tap Security | `security-settings` |
| `security-settings` | Tap Change PIN | `Change PIN current` |
| `Change PIN current` | Tap Continue | `Change PIN new` |
| `Change PIN new` | Tap Save | `PIN updated` |
| `profile-window` | Tap Help & support | `help-support` |
| `help-support` | Tap Report a transaction | `Report a transaction` |
| `Report a transaction` | Tap Submit | `Report sent` |

## Offline and failure branches

| State | Trigger | Destination/action |
| --- | --- | --- |
| Any networked action | Network unavailable | Open `offline popup` overlay |
| `offline popup` | Tap Try again | Return to source frame |
| Any networked action | Connection lost after entry | Show `offline banner` on source frame |
| Wallet/account action | Bank maintenance | Navigate to `bank maintenance` |
| Wallet/account action | Provider unavailable | Navigate to `provider unavailable` |
| Transaction action | Transaction fails | Navigate to `failed transaction reversed` |
| Failure state | Tap Done | Return to originating detail frame |

## Penpot wiring checklist

1. Set `home-dashboard` as the prototype start point.
2. Add click interactions to the visible CTA and card layers, not the entire board.
3. Use `Navigate to` with the default mobile transition for full-screen states.
4. Use `Open overlay` for the offline popup and any confirmation modal only.
5. Set processing frames to `After delay` transitions to their receipt/success state.
6. Keep the back action on every detail/review/receipt frame.
7. Mark the `--full` frames as scroll references, not separate prototype destinations.
8. Test both the happy path and every failure branch in Penpot View mode.

## Unresolved product behavior

These are visual prototype transitions only and must not be treated as approved
backend rules:

- PIN validation and lockout thresholds
- Emergency cooldown duration
- Top-up settlement timing
- Provider retry policy
- Transaction trace SLA and support case lifecycle
