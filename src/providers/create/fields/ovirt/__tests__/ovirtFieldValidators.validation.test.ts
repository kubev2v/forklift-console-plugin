import { describe, expect, it } from '@jest/globals';

import { validateOvirtPassword, validateOvirtUsername } from '../ovirtFieldValidators';

describe('ovirtFieldValidators - validation', () => {
  it('requires username/password without spaces', () => {
    expect(validateOvirtUsername(undefined)).toMatch(/required/i);
    expect(validateOvirtUsername('')).toMatch(/required/i);
    expect(validateOvirtUsername('   ')).toMatch(/required/i);
    expect(validateOvirtUsername('name with spaces')).toMatch(/spaces/i);
    expect(validateOvirtUsername('admin@internal')).toBeUndefined();

    expect(validateOvirtPassword('')).toMatch(/required/i);
    expect(validateOvirtPassword('   ')).toMatch(/required/i);
    expect(validateOvirtPassword('bad pass')).toMatch(/spaces/i);
    expect(validateOvirtPassword('secret')).toBeUndefined();
  });
});
