import { describe, expect, it } from '@jest/globals';
import { ValidationState } from '@utils/validation/Validation';

import {
  validatePassword,
  validateProjectName,
  validateRegionName,
  validateUsername,
} from '../openstackSecretFieldValidators';

describe('openstackSecretFieldValidators - required', () => {
  it('errors on empty values and spaces', () => {
    expect(validateUsername('').type).toBe(ValidationState.Error);
    expect(validatePassword('bad pass').type).toBe(ValidationState.Error);
    expect(validateRegionName('RegionOne').type).toBe(ValidationState.Success);
    expect(validateProjectName('admin').type).toBe(ValidationState.Success);
  });
});
