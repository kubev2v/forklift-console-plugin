import { mockI18n } from '@test-utils/mockI18n';

import { normalizeAapUrl, validateAapUrl } from '../validateAapUrl';

mockI18n();

describe('normalizeAapUrl', () => {
  it('trims and lowercases the URL scheme', () => {
    expect(normalizeAapUrl('HTTPS://aap.example.com')).toBe('https://aap.example.com');
    expect(normalizeAapUrl(' Http://aap.example.com ')).toBe('http://aap.example.com');
  });

  it('leaves values without a scheme unchanged aside from trim', () => {
    expect(normalizeAapUrl(' aap.example.com ')).toBe('aap.example.com');
  });
});

describe('validateAapUrl', () => {
  it('allows empty and whitespace-only values', () => {
    expect(validateAapUrl(undefined)).toBeUndefined();
    expect(validateAapUrl('')).toBeUndefined();
    expect(validateAapUrl('   ')).toBeUndefined();
  });

  it('allows well-formed URLs', () => {
    expect(validateAapUrl('https://aap.example.com')).toBeUndefined();
    expect(validateAapUrl(' http://192.168.1.1:8000 ')).toBeUndefined();
    expect(validateAapUrl('https://aap.example.com/api/v2')).toBeUndefined();
    expect(validateAapUrl('HTTPS://aap.example.com')).toBeUndefined();
  });

  it('rejects garbage input', () => {
    expect(validateAapUrl('not a valid url !!!')).toMatch(/URL is invalid/);
    expect(validateAapUrl('http:/example.com')).toMatch(/URL is invalid/);
  });

  it('rejects missing scheme and non-http schemes', () => {
    expect(validateAapUrl('aap.example.com')).toMatch(/URL is invalid/);
    expect(validateAapUrl('ftp://aap.example.com')).toMatch(/URL is invalid/);
  });

  it('uses an AAP-shaped example in the error message', () => {
    expect(validateAapUrl('not-a-url')).toMatch(/https:\/\/aap\.example\.com/);
  });
});
