import { formatThroughput, formatThroughputTick } from '@utils/format/formatThroughput';

const BYTES_PER_KIB = 1024;
const BYTES_PER_MIB = BYTES_PER_KIB * 1024;
const BYTES_PER_GIB = BYTES_PER_MIB * 1024;
const BYTES_PER_TIB = BYTES_PER_GIB * 1024;

describe('formatThroughput', () => {
  test('returns "0 B/s" for zero', () => {
    expect(formatThroughput(0)).toBe('0 B/s');
  });

  test('formats small values in B/s', () => {
    expect(formatThroughput(500)).toBe('500 B/s');
  });

  test('formats values under 10 with one decimal', () => {
    expect(formatThroughput(5 * BYTES_PER_KIB)).toBe('5.0 KiB/s');
  });

  test('formats boundary at exactly 1024 as KiB/s', () => {
    expect(formatThroughput(BYTES_PER_KIB)).toBe('1.0 KiB/s');
  });

  test('formats large values in MiB/s', () => {
    expect(formatThroughput(50 * BYTES_PER_MIB)).toBe('50 MiB/s');
  });

  test('formats GiB/s range', () => {
    expect(formatThroughput(2.5 * BYTES_PER_GIB)).toBe('2.5 GiB/s');
  });

  test('formats TiB/s range', () => {
    expect(formatThroughput(3 * BYTES_PER_TIB)).toBe('3.0 TiB/s');
  });

  test('rounds values >= 10 to integers', () => {
    expect(formatThroughput(15.7 * BYTES_PER_KIB)).toBe('16 KiB/s');
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

  test('formats KiB/s range', () => {
    expect(formatThroughputTick(BYTES_PER_KIB)).toBe('1.0 KiB/s');
  });

  test('formats MiB/s range with rounding', () => {
    expect(formatThroughputTick(50 * BYTES_PER_MIB)).toBe('50 MiB/s');
  });

  test('formats values under 10 with one decimal', () => {
    expect(formatThroughputTick(5 * BYTES_PER_MIB)).toBe('5.0 MiB/s');
  });
});
