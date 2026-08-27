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
    expect(validateVddkInitImage('')).toMatch(/VDDK image is empty/i);
    expect(validateVddkInitImage('not a valid image!!!')).toMatch(/VDDK image is invalid/i);
    expect(validateVddkInitImage('quay.io/konveyor/vddk-test:latest')).toBe(true);
  });
});
