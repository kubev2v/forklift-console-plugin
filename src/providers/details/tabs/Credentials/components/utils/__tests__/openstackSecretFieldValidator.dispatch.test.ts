import { OpenstackSecretFieldsId } from 'src/providers/utils/constants';

import { describe, expect, it } from '@jest/globals';
import { ValidationState } from '@utils/validation/Validation';

import { openstackSecretFieldValidator } from '../openstackSecretFieldValidator';

const requiredFieldIds = [
  OpenstackSecretFieldsId.Username,
  OpenstackSecretFieldsId.Password,
  OpenstackSecretFieldsId.Token,
  OpenstackSecretFieldsId.UserId,
  OpenstackSecretFieldsId.ProjectId,
  OpenstackSecretFieldsId.DomainName,
  OpenstackSecretFieldsId.RegionName,
  OpenstackSecretFieldsId.ProjectName,
  OpenstackSecretFieldsId.ApplicationCredentialId,
  OpenstackSecretFieldsId.ApplicationCredentialSecret,
  OpenstackSecretFieldsId.ApplicationCredentialName,
] as const;

describe('openstackSecretFieldValidator - dispatch', () => {
  it('validates required fields and trims input', () => {
    for (const id of requiredFieldIds) {
      expect(openstackSecretFieldValidator(id, '').type).toBe(ValidationState.Error);
      expect(openstackSecretFieldValidator(id, '   ').type).toBe(ValidationState.Error);
      expect(openstackSecretFieldValidator(id, '  value  ').type).toBe(ValidationState.Success);
    }
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
    expect(
      openstackSecretFieldValidator('unknownField' as OpenstackSecretFieldsId, 'anything').type,
    ).toBe(ValidationState.Default);
  });
});
