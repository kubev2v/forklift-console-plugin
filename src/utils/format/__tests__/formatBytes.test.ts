import { formatBytes } from '../formatBytes';

describe('formatBytes', () => {
  it('formats binary units', () => {
    expect(formatBytes(1024)).toBe('1.0 KiB');
    expect(formatBytes(1024 * 1024)).toBe('1.0 MiB');
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1.0 GiB');
  });

  it('rounds large values', () => {
    expect(formatBytes(1024 * 1024 * 100)).toBe('100 MiB');
  });

  it('returns a dash for missing or zero values', () => {
    expect(formatBytes(undefined)).toBe('—');
    expect(formatBytes(0)).toBe('—');
    expect(formatBytes(Number.NaN)).toBe('—');
  });
});
