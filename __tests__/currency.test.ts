import { formatNairaFromKobo } from '../src/utils/currency';

describe('formatNairaFromKobo', () => {
  it('formats kobo as Nigerian naira', () => {
    expect(formatNairaFromKobo(1500000)).toContain('15,000');
    expect(formatNairaFromKobo(1500000)).toMatch(/₦|NGN/);
  });
});
