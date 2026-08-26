import { describe, expect, it } from '@jest/globals';

import {
  validateVddkInitImage,
  validateVspherePassword,
  validateVsphereUsername,
} from '../vsphereFieldValidators';

describe('vsphereFieldValidators - validation', () => {
  it('requires username/password without spaces', () => {
    expect(validateVsphereUsername('')).toMatch(/required/i);
    expect(validateVsphereUsername('bad user')).toMatch(/spaces/i);
    expect(validateVsphereUsername('admin')).toBe(true);

    expect(validateVspherePassword('')).toMatch(/required/i);
    expect(validateVspherePassword('bad pass')).toMatch(/spaces/i);
    expect(validateVspherePassword('secret')).toBe(true);
  });

  it('delegates vddk image validation', () => {
    expect(validateVddkInitImage(undefined)).toBe(true);
    expect(typeof validateVddkInitImage('not a valid image!!!')).not.toBe('boolean');
  });
});
