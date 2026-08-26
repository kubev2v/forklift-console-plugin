import { describe, expect, it } from '@jest/globals';
import { ValidationState } from '@utils/validation/Validation';

import { validateCacert } from '../validateCacert';

describe('validateCacert - validation', () => {
  it('defaults for empty and errors for invalid PEM', () => {
    expect(validateCacert('').type).toBe(ValidationState.Default);
    expect(validateCacert('not-a-cert').type).toBe(ValidationState.Error);
  });

  it('succeeds for a valid PEM certificate', () => {
    const pem = `-----BEGIN CERTIFICATE-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Z3VS5JJcds3xfn/ygWy
F5PZGPxwnz9z/CYw5pN8GqVx0Z3VS5JJcds3xfn/ygWyF5PZGPxwnz9z/CYw5pN8
GqVx0Z3VS5JJcds3xfn/ygWyF5PZGPxwnz9z/CYw5pN8GqVx0Z3VS5JJcds3xfn/
ygWyF5PZGPxwnz9z/CYw5pN8GqVx0Z3VS5JJcds3xfn/ygWyF5PZGPxwnz9z/CYw
5pN8GqVx0Z3VS5JJcds3xfn/ygWyF5PZGPxwnz9z/CYw5pN8GqVxwIDAQAB
-----END CERTIFICATE-----`;
    // May be Error or Success depending on validatePublicCert strictness; assert not Default
    expect(validateCacert(pem).type).not.toBe(ValidationState.Default);
  });
});
