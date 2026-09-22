import { isValidationActive } from '../isValidationActive';

describe('isValidationActive', () => {
  it('returns true for pending and running validations', () => {
    expect(isValidationActive({ status: { phase: 'Pending' } })).toBe(true);
    expect(isValidationActive({ status: { phase: 'Running' } })).toBe(true);
  });

  it('returns false for terminal or uninitialized validations', () => {
    expect(isValidationActive({ status: { phase: 'Succeeded' } })).toBe(false);
    expect(isValidationActive({ status: { phase: 'Failed' } })).toBe(false);
    expect(isValidationActive(undefined)).toBe(false);
  });
});
