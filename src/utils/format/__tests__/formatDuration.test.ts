import { formatDuration } from '../formatDuration';

describe('formatDuration', () => {
  it('formats minutes and hours', () => {
    expect(formatDuration(30)).toBe('< 1m');
    expect(formatDuration(600)).toBe('10m');
    expect(formatDuration(3600)).toBe('1h');
    expect(formatDuration(5400)).toBe('1h 30m');
  });

  it('returns a dash for missing values', () => {
    expect(formatDuration(undefined)).toBe('—');
    expect(formatDuration(Number.NaN)).toBe('—');
  });
});
