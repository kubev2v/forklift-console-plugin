import { formatThroughput, formatThroughputTick } from '../formatThroughput';

const BYTES_PER_KB = 1024;
const BYTES_PER_MB = BYTES_PER_KB * 1024;
const BYTES_PER_GB = BYTES_PER_MB * 1024;
const BYTES_PER_TB = BYTES_PER_GB * 1024;

describe('formatThroughput', () => {
  test('returns "0 B/s" for zero', () => {
    expect(formatThroughput(0)).toBe('0 B/s');
  });

  test('formats small values in B/s', () => {
    expect(formatThroughput(500)).toBe('500 B/s');
  });

  test('formats values under 10 with one decimal', () => {
    expect(formatThroughput(5 * BYTES_PER_KB)).toBe('5.0 KB/s');
  });

  test('formats boundary at exactly 1024 as KB/s', () => {
    expect(formatThroughput(BYTES_PER_KB)).toBe('1.0 KB/s');
  });

  test('formats large values in MB/s', () => {
    expect(formatThroughput(50 * BYTES_PER_MB)).toBe('50 MB/s');
  });

  test('formats GB/s range', () => {
    expect(formatThroughput(2.5 * BYTES_PER_GB)).toBe('2.5 GB/s');
  });

  test('formats TB/s range', () => {
    expect(formatThroughput(3 * BYTES_PER_TB)).toBe('3.0 TB/s');
  });

  test('rounds values >= 10 to integers', () => {
    expect(formatThroughput(15.7 * BYTES_PER_KB)).toBe('16 KB/s');
  });

  test('handles negative values using absolute value', () => {
    expect(formatThroughput(-500)).toBe('500 B/s');
  });

  test('handles very small fractional values', () => {
    expect(formatThroughput(0.5)).toBe('0.5 B/s');
  });
});

describe('formatThroughputTick', () => {
  test('returns "0" for zero', () => {
    expect(formatThroughputTick(0)).toBe('0');
  });

  test('formats small values with B/s unit', () => {
    expect(formatThroughputTick(500)).toBe('500 B/s');
  });

  test('formats KB/s range', () => {
    expect(formatThroughputTick(BYTES_PER_KB)).toBe('1.0 KB/s');
  });

  test('formats MB/s range with rounding', () => {
    expect(formatThroughputTick(50 * BYTES_PER_MB)).toBe('50 MB/s');
  });

  test('formats values under 10 with one decimal', () => {
    expect(formatThroughputTick(5 * BYTES_PER_MB)).toBe('5.0 MB/s');
  });
});
