import { describe, expect, it } from '@jest/globals';
import { ValidationState } from '@utils/validation/Validation';

import { validateOpenstackRequiredNoSpacesField } from '../validateOpenstackRequiredNoSpacesField';

const msgs = {
  invalidMsg: 'invalid',
  requiredMsg: 'required',
  successMsg: 'ok',
};

describe('validateOpenstackRequiredNoSpacesField - validation', () => {
  it('handles undefined, empty, valid, and spaced values', () => {
    expect(validateOpenstackRequiredNoSpacesField(undefined as never, msgs)).toEqual({
      msg: 'required',
      type: ValidationState.Default,
    });
    expect(validateOpenstackRequiredNoSpacesField('', msgs).type).toBe(ValidationState.Error);
    expect(validateOpenstackRequiredNoSpacesField('ok', msgs)).toEqual({
      msg: 'ok',
      type: ValidationState.Success,
    });
    expect(validateOpenstackRequiredNoSpacesField('has space', msgs).type).toBe(
      ValidationState.Error,
    );
  });
});
