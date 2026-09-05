/* eslint-disable @cspell/spellchecker */
import { describe, expect, it } from '@jest/globals';
import { ValidationState } from '@utils/validation/Validation';

import { validateCacert } from '../validateCacert';

// Known-good PEM reused from validatePublicCert.test.ts
const VALID_PEM = `
-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAJC1HiIAZAiIMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRtZSBXaWRn
-----END CERTIFICATE-----
`.trim();

describe('validateCacert - validation', () => {
  it('defaults for empty and errors for invalid PEM', () => {
    expect(validateCacert('').type).toBe(ValidationState.Default);
    expect(validateCacert('not-a-cert').type).toBe(ValidationState.Error);
  });

  it('succeeds for a valid PEM certificate', () => {
    expect(validateCacert(VALID_PEM).type).toBe(ValidationState.Success);
  });
});
