import { describe, expect, it } from '@jest/globals';
import { ValidationState } from '@utils/validation/Validation';

import {
  validatePassword,
  validateProjectName,
  validateRegionName,
  validateUsername,
} from '../openstackSecretFieldValidators';

const requiredValidators = [
  validateUsername,
  validatePassword,
  validateRegionName,
  validateProjectName,
] as const;

describe('openstackSecretFieldValidators - required', () => {
  it('errors on empty values and spaces for each validator', () => {
    for (const validate of requiredValidators) {
      expect(validate('').type).toBe(ValidationState.Error);
      expect(validate('has space').type).toBe(ValidationState.Error);
    }
  });

  it('succeeds for non-empty values without spaces', () => {
    expect(validateUsername('admin').type).toBe(ValidationState.Success);
    expect(validatePassword('secret').type).toBe(ValidationState.Success);
    expect(validateRegionName('RegionOne').type).toBe(ValidationState.Success);
    expect(validateProjectName('admin').type).toBe(ValidationState.Success);
  });
});
