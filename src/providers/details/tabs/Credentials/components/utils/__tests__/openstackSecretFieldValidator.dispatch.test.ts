import { describe, expect, it } from '@jest/globals';
import { OpenstackSecretFieldsId } from 'src/providers/utils/constants';
import { ValidationState } from '@utils/validation/Validation';

import { openstackSecretFieldValidator } from '../openstackSecretFieldValidator';

describe('openstackSecretFieldValidator - dispatch', () => {
  it('validates required username and trims input', () => {
    expect(openstackSecretFieldValidator(OpenstackSecretFieldsId.Username, '').type).toBe(
      ValidationState.Error,
    );
    expect(openstackSecretFieldValidator(OpenstackSecretFieldsId.Username, '  admin  ').type).toBe(
      ValidationState.Success,
    );
  });

  it('validates insecure skip verify and cacert fields', () => {
    expect(
      openstackSecretFieldValidator(OpenstackSecretFieldsId.InsecureSkipVerify, 'true').type,
    ).toBe(ValidationState.Success);
    expect(
      openstackSecretFieldValidator(OpenstackSecretFieldsId.InsecureSkipVerify, 'maybe').type,
    ).toBe(ValidationState.Error);
    expect(openstackSecretFieldValidator(OpenstackSecretFieldsId.CaCert, '').type).toBe(
      ValidationState.Default,
    );
  });

  it('returns default for auth type and unknown ids', () => {
    expect(openstackSecretFieldValidator(OpenstackSecretFieldsId.AuthType, 'password').type).toBe(
      ValidationState.Default,
    );
  });
});
