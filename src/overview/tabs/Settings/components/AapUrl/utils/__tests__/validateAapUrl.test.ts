import { mockI18n } from '@test-utils/mockI18n';

import { validateAapUrl } from '../validateAapUrl';

mockI18n();

describe('validateAapUrl', () => {
  it('allows empty and whitespace-only values', () => {
    expect(validateAapUrl(undefined)).toBeUndefined();
    expect(validateAapUrl('')).toBeUndefined();
    expect(validateAapUrl('   ')).toBeUndefined();
  });

  it('allows well-formed URLs', () => {
    expect(validateAapUrl('https://aap.example.com')).toBeUndefined();
    expect(validateAapUrl(' http://192.168.1.1:8000 ')).toBeUndefined();
  });

  it('rejects garbage input', () => {
    expect(validateAapUrl('not a valid url !!!')).toMatch(/URL is invalid/);
    expect(validateAapUrl('http:/example.com')).toMatch(/URL is invalid/);
  });
});
