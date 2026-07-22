# To-Do Budget Mapper

## Task model

Each task stores:

- Title and optional notes
- Estimated cost in integer kobo
- Budget category
- Scheduled local date
- Deadline local date
- Pending, completed, or cancelled status

Tasks are persisted locally for offline use and synchronized under
`users/{uid}/todos/{todoId}`. Firestore rules validate ownership, NGN currency,
field lengths, positive estimated cost, supported categories, status, and date order.

## Allowance reservation

Every non-cancelled task becomes a reservation on its scheduled date. Daily Lock
subtracts reservations after actual expenses. With rollover enabled, earlier task
reservations also reduce the amount carried into later days.

Deleting a task removes its reservation. Offline deletions use a hidden cancelled
tombstone so a stale cloud copy cannot reappear on refresh.

## Reminder eligibility

A reminder is scheduled only when both conditions are true:

1. The estimated task cost fits within that scheduled day's available allowance.
2. The category's planned monthly amount still covers the estimated task cost after
   logged expenses.

The reminder fires at 08:00 on the deadline date. If that time has already passed,
it fires shortly after task creation. Permission denial does not prevent the task
from being saved.

The dashboard reminder strip independently rechecks that the deadline is within the
next two days and that both daily and category budget remain available.

## Screens

- **Budget To-Dos:** synchronized list, completion toggle, edit, delete, loading,
  empty, refresh, sync-pending, and error states.
- **Task Editor:** title, notes, Naira estimate, category, scheduled date, deadline,
  live budget-availability feedback, and notification scheduling.
