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
    expect(validateOpenstackRequiredNoSpacesField(undefined as unknown as string, msgs)).toEqual({
      msg: 'required',
      type: ValidationState.Default,
    });
    expect(validateOpenstackRequiredNoSpacesField('', msgs)).toEqual({
      msg: 'required',
      type: ValidationState.Error,
    });
    expect(validateOpenstackRequiredNoSpacesField('ok', msgs)).toEqual({
      msg: 'ok',
      type: ValidationState.Success,
    });
    expect(validateOpenstackRequiredNoSpacesField('has space', msgs)).toEqual({
      msg: 'invalid',
      type: ValidationState.Error,
    });
  });
});
