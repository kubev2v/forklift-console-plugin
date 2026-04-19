import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { validateHookRunnerImage, validateHookServiceAccount } from '../utils';

describe('validateHookRunnerImage', () => {
  it('returns error for empty string', () => {
    expect(validateHookRunnerImage('')).toBeDefined();
  });

  it('returns undefined for valid container image', () => {
    expect(validateHookRunnerImage('quay.io/konveyor/hook-runner')).toBeUndefined();
  });

  it('returns undefined for image with tag', () => {
    expect(validateHookRunnerImage('quay.io/konveyor/hook-runner:latest')).toBeUndefined();
  });
});

describe('validateHookServiceAccount', () => {
  it('returns undefined for empty string', () => {
    expect(validateHookServiceAccount('')).toBeUndefined();
  });

  it('returns undefined for valid K8s name', () => {
    expect(validateHookServiceAccount('my-sa')).toBeUndefined();
  });

  it('returns error for name with uppercase', () => {
    expect(validateHookServiceAccount('My-SA')).toBeDefined();
  });
});
