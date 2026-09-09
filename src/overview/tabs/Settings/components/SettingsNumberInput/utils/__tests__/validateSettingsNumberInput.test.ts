import { mockI18n } from '@test-utils/mockI18n';

import { validateSettingsNumberInput } from '../validateSettingsNumberInput';

mockI18n();

describe('validateSettingsNumberInput', () => {
  it('allows empty values', () => {
    expect(validateSettingsNumberInput(undefined)).toBeTruthy();
    expect(validateSettingsNumberInput(Number(''))).toBeTruthy();
  });

  it('allows positive integers larger than min value', () => {
    expect(validateSettingsNumberInput(2, 1)).toBeTruthy();
    expect(validateSettingsNumberInput(10, 4)).toBeTruthy();
    expect(validateSettingsNumberInput(1)).toBeTruthy();
  });

  it('rejects NaN values', () => {
    expect(validateSettingsNumberInput(Number('someWord'))).toMatch(/Not a valid/);
    expect(validateSettingsNumberInput(Number('::123,'))).toMatch(/Not a valid/);
    expect(validateSettingsNumberInput(Number('!!@#$%!'))).toMatch(/Not a valid/);
  });

  it('rejects non-integer numbers', () => {
    expect(validateSettingsNumberInput(1.34)).toMatch(/Not a valid/);
    expect(validateSettingsNumberInput(0.5)).toMatch(/Not a valid/);
  });

  it('rejects non-positive numbers', () => {
    expect(validateSettingsNumberInput(-1)).toMatch(/Not a valid/);
    expect(validateSettingsNumberInput(-20.5)).toMatch(/Not a valid/);
  });

  it('rejects all numbers smaller than min', () => {
    expect(validateSettingsNumberInput(5, 6)).toMatch(/Not a valid/);
    expect(validateSettingsNumberInput(0, 1)).toMatch(/Not a valid/);
  });
});
