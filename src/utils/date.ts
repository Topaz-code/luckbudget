const twoDigits = (value: number): string => String(value).padStart(2, '0');

export const getMonthKey = (date = new Date()): string =>
  `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}`;

/** Device-local date key used to preserve the user's Nigerian calendar day. */
export const getLocalDateKey = (date = new Date()): string =>
  `${getMonthKey(date)}-${twoDigits(date.getDate())}`;

export const getDaysInMonth = (date = new Date()): number =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

export const getDayOfMonth = (date = new Date()): number => date.getDate();
