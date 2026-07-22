# Daily spending lock

## Allocation

The monthly flexible amount (`budget.remaining`) is divided by the number of days
in the current month using integer kobo. Any division remainder is assigned to the
last day so the allocations always add up exactly to the monthly amount.

## Preferences

- **Roll over:** prior unspent daily allocations are added to today's allowance.
- **Reset daily:** prior unspent allocations expire at midnight.

The preference is persisted locally and at
`users/{uid}/settings/dailyLock` in Firestore.

## Enforcement

Before an expense is created, `calculateDailyLock` compares the requested amount
with today's remaining allowance. An over-limit expense is not written locally or
to Firestore. If an expense exactly consumes the remaining allowance, it is saved
and the lock modal is shown immediately.

The dashboard hydrates all expenses for the current month before enabling its Log
Expense action, ensuring rollover calculations include earlier days and synced
devices.

All calculations use integer kobo and device-local calendar dates.
