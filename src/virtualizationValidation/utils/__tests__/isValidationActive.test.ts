import { isValidationActive } from '../isValidationActive';

describe('isValidationActive', () => {
  it('returns true while VCV is pending or running', () => {
    expect(isValidationActive({})).toBe(true);
    expect(isValidationActive({ status: { phase: 'Pending' } })).toBe(true);
    expect(isValidationActive({ status: { phase: 'Running' } })).toBe(true);
  });

  it('returns false for terminal and uninitialized VCV objects', () => {
    expect(isValidationActive({ status: { phase: 'Cancelled' } })).toBe(false);
    expect(isValidationActive({ status: { phase: 'Completed' } })).toBe(false);
    expect(isValidationActive({ status: { phase: 'Error' } })).toBe(false);
    expect(isValidationActive(undefined)).toBe(false);
  });
});
