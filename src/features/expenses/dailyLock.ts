import type { Expense } from './types';
import { getDayOfMonth, getDaysInMonth, getLocalDateKey, getMonthKey } from '../../utils/date';

export type DailyLockPreference = 'rollover' | 'reset';

export interface TodoReservation {
  id: string;
  scheduledDate: string;
  amountKobo: number;
}

export interface DailyLockMetrics {
  baseDailyAllowanceKobo: number;
  effectiveAllowanceKobo: number;
  spentTodayKobo: number;
  reservedTodayKobo: number;
  remainingTodayKobo: number;
  rolledOverKobo: number;
  isLocked: boolean;
}

const allocationForDay = (
  monthlyFlexibleKobo: number,
  day: number,
  daysInMonth: number,
): number => {
  const base = Math.floor(monthlyFlexibleKobo / daysInMonth);
  return day === daysInMonth ? base + (monthlyFlexibleKobo % daysInMonth) : base;
};

/**
 * Calculates the spendable amount for one device-local calendar day. Rollover
 * carries prior unspent allocations; reset intentionally discards them.
 */
export const calculateDailyLock = (
  monthlyFlexibleKobo: number,
  expenses: Expense[],
  preference: DailyLockPreference,
  date = new Date(),
  reservations: TodoReservation[] = [],
  planStartDate?: Date,
): DailyLockMetrics => {
  const month = getMonthKey(date);
  const today = getLocalDateKey(date);
  const day = getDayOfMonth(date);
  const daysInMonth = getDaysInMonth(date);
  const baseDailyAllowanceKobo = Math.floor(monthlyFlexibleKobo / daysInMonth);
  const startsThisMonth = planStartDate && getMonthKey(planStartDate) === month;
  const planStartDay = startsThisMonth ? getDayOfMonth(planStartDate) : 1;
  const planStartKey = startsThisMonth ? getLocalDateKey(planStartDate) : `${month}-01`;
  const monthExpenses = expenses.filter(
    (expense) => expense.month === month && expense.localDate >= planStartKey,
  );
  const spentTodayKobo = monthExpenses
    .filter((expense) => expense.localDate === today)
    .reduce((sum, expense) => sum + expense.amountKobo, 0);
  const spentBeforeTodayKobo = monthExpenses
    .filter((expense) => expense.localDate < today)
    .reduce((sum, expense) => sum + expense.amountKobo, 0);
  const reservedTodayKobo = reservations
    .filter((reservation) => reservation.scheduledDate === today)
    .reduce((sum, reservation) => sum + reservation.amountKobo, 0);
  const reservedBeforeTodayKobo = reservations
    .filter(
      (reservation) =>
        reservation.scheduledDate.startsWith(month) &&
        reservation.scheduledDate >= planStartKey &&
        reservation.scheduledDate < today,
    )
    .reduce((sum, reservation) => sum + reservation.amountKobo, 0);
  const todayAllocation = allocationForDay(monthlyFlexibleKobo, day, daysInMonth);

  let effectiveAllowanceKobo = todayAllocation;
  let rolledOverKobo = 0;

  if (preference === 'rollover') {
    const allocatedBeforeToday =
      baseDailyAllowanceKobo * Math.max(0, day - planStartDay);
    rolledOverKobo = Math.max(
      0,
      allocatedBeforeToday - spentBeforeTodayKobo - reservedBeforeTodayKobo,
    );
    effectiveAllowanceKobo = todayAllocation + rolledOverKobo;
  }

  const remainingTodayKobo = Math.max(
    0,
    effectiveAllowanceKobo - spentTodayKobo - reservedTodayKobo,
  );

  return {
    baseDailyAllowanceKobo,
    effectiveAllowanceKobo,
    spentTodayKobo,
    reservedTodayKobo,
    remainingTodayKobo,
    rolledOverKobo,
    isLocked: remainingTodayKobo <= 0,
  };
};
