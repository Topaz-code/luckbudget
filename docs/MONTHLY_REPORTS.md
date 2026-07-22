# Monthly reports

## Data sources

The report combines the selected month's:

- Canonical monthly budget
- Logged expenses
- Budget-mapped to-do reservations
- Emergency withdrawal ledger
- Daily Lock preference

Configured builds load historical data from each user's isolated Firestore paths.
Firebase-disabled development uses persisted device data for the current month.

## Calculations

### Category comparison

Eight spending categories compare actual expense totals with their planned amounts.
The grouped chart and category bars turn red when spending exceeds the plan.

### Amount saved

```text
Fixed Savings
+ Unused Emergency Fund
+ Unspent adjusted flexible money
```

For the active month this is labelled **Projected Savings**. Closed months display
**Amount Saved**.

### Emergency usage

Failed requests are excluded. The report displays successful request count, total
released, and the amount still locked.

### Within-budget days

Every elapsed calendar day is recalculated with the selected rollover/reset rule,
actual expenses, and scheduled to-do reservations. A day counts when spending plus
reservations does not exceed its effective allowance. Exact-limit days count as
within budget.

### Suggestions

Suggestions are deterministic and based on:

- The most overspent category
- Savings rate below 10%
- Emergency Fund usage
- Fewer than 80% of elapsed days within budget

A positive recommendation is shown when none of those conditions apply.

## UX states

The screen supports current and historical month navigation, pull-to-refresh,
loading, no-budget, stale-device fallback, and cloud error states. All chart and
summary values are shown exclusively in Nigerian Naira.
