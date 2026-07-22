/** Formats integer kobo without ever introducing a foreign currency symbol. */
export const formatNairaFromKobo = (kobo: number): string =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(kobo / 100);
