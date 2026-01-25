import { toColonSeparatedHex } from '../useTlsCertificate';

describe('valid hex to colon separated', () => {
  it('works for empty string', () => {
    expect(toColonSeparatedHex('')).toBe('');
  });
  it('works for single letter', () => {
    expect(toColonSeparatedHex('a')).toBe('A');
  });
  it('works for n=2', () => {
    expect(toColonSeparatedHex('ab')).toBe('AB');
  });
  it('works for n=3', () => {
    expect(toColonSeparatedHex('abc')).toBe('AB:C');
  });
  it('works for n=4', () => {
    expect(toColonSeparatedHex('abcd')).toBe('AB:CD');
  });
});
