import { getMonthKey } from '../src/utils/date';

describe('Firebase document helpers', () => {
  it('creates stable monthly document IDs', () => {
    expect(getMonthKey(new Date(2026, 0, 15))).toBe('2026-01');
    expect(getMonthKey(new Date(2026, 11, 31))).toBe('2026-12');
  });
});
