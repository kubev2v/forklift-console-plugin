import { validateFingerprint } from 'src/utils/validation/common';

describe('validateFingerprint', () => {
  it('validates correct fingerprints', () => {
    const validFingerprint = '52:6C:4E:88:1D:78:AE:12:1C:F3:BB:6C:5B:F4:E2:82:86:A7:08:AF';
    expect(validateFingerprint(validFingerprint)).toBe(true);
  });

  it('invalidates fingerprints with wrong length', () => {
    const invalidFingerprint = '52:6C:4E:88:1D:78:AE:12:1C:F3:BB:6C:5B:F4:E2:82:86:A7:08';
    expect(validateFingerprint(invalidFingerprint)).toBe(false);
  });

  it('invalidates fingerprints with wrong characters', () => {
    const invalidFingerprint = 'G2:6C:4E:88:1D:78:AE:12:1C:F3:BB:6C:5B:F4:E2:82:86:A7:08:AF';
    expect(validateFingerprint(invalidFingerprint)).toBe(false);
  });

  it('invalidates fingerprints with missing colons', () => {
    const invalidFingerprint = '526C4E881D78AE121CF3BB6C5BF4E28286A708AF';
    expect(validateFingerprint(invalidFingerprint)).toBe(false);
  });

  it('validates lowercase fingerprints', () => {
    const validFingerprint = '52:6C:4E:88:1D:78:AE:12:1C:F3:BB:6C:5B:F4:E2:82:86:A7:08:AF';
    expect(validateFingerprint(validFingerprint)).toBe(true);
  });
});
