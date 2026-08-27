import { describe, expect, it } from '@jest/globals';
import { ValidationState } from '@utils/validation/Validation';

import { validateInsecureSkipVerify } from '../validateInsecureSkipVerify';

describe('validateInsecureSkipVerify - validation', () => {
  it('accepts true/false/empty and rejects other values', () => {
    expect(validateInsecureSkipVerify(undefined as unknown as string).type).toBe(
      ValidationState.Default,
    );
    expect(validateInsecureSkipVerify('true').type).toBe(ValidationState.Success);
    expect(validateInsecureSkipVerify('false').type).toBe(ValidationState.Success);
    expect(validateInsecureSkipVerify('').type).toBe(ValidationState.Success);
    expect(validateInsecureSkipVerify('yes').type).toBe(ValidationState.Error);
  });
});
