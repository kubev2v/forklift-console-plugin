import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import {
  validateAapToken,
  validateAapUrl,
  validateHookRunnerImage,
  validateHookServiceAccount,
  validateJobTemplateId,
} from '../utils';

describe('validateAapUrl', () => {
  it('returns error for empty string', () => {
    expect(validateAapUrl('')).toBeDefined();
  });

  it('returns error for whitespace-only string', () => {
    expect(validateAapUrl('   ')).toBeDefined();
  });

  it('returns error for invalid URL', () => {
    expect(validateAapUrl('not-a-url')).toBeDefined();
  });

  it('returns error for URL without protocol', () => {
    expect(validateAapUrl('aap.example.com')).toBeDefined();
  });

  it('returns undefined for valid https URL', () => {
    expect(validateAapUrl('https://aap.example.com')).toBeUndefined();
  });

  it('returns undefined for valid http URL', () => {
    expect(validateAapUrl('http://aap.example.com')).toBeUndefined();
  });

  it('returns undefined for URL with port', () => {
    expect(validateAapUrl('https://aap.example.com:8443')).toBeUndefined();
  });
});

describe('validateAapToken', () => {
  it('returns error for empty string', () => {
    expect(validateAapToken('')).toBeDefined();
  });

  it('returns error for whitespace-only string', () => {
    expect(validateAapToken('   ')).toBeDefined();
  });

  it('returns undefined for non-empty token', () => {
    expect(validateAapToken('some-token-value')).toBeUndefined();
  });
});

describe('validateJobTemplateId', () => {
  it('returns undefined for undefined value', () => {
    expect(validateJobTemplateId(undefined)).toBeUndefined();
  });

  it('returns error for zero', () => {
    expect(validateJobTemplateId(0)).toBeDefined();
  });

  it('returns error for negative number', () => {
    expect(validateJobTemplateId(-1)).toBeDefined();
  });

  it('returns error for non-integer', () => {
    expect(validateJobTemplateId(1.5)).toBeDefined();
  });

  it('returns undefined for positive integer', () => {
    expect(validateJobTemplateId(7)).toBeUndefined();
  });

  it('returns undefined for large positive integer', () => {
    expect(validateJobTemplateId(999)).toBeUndefined();
  });
});

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
