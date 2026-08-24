/* eslint-disable @cspell/spellchecker */
import { validatePublicCert } from 'src/utils/validation/common';

describe('validatePublicCert', () => {
  it('should return true for valid certificates', () => {
    const certs = [
      `
-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAJC1HiIAZAiIMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRtZSBXaWRn
-----END CERTIFICATE-----
        `,
    ];
    for (const ca of certs) {
      expect(validatePublicCert(ca.trim())).toBe(true);
    }
  });

  it('should return false for invalid certificates', () => {
    const certs = [
      `
-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAJC1HiIAZAiIMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRtZSBXaWRn
        `,
      `
-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAJC1HiIAZAiIMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN 0YXRlMSEwHwYDVQQKDBhJ=
-----END CERTIFICATE-----
        `,
      '-----BEGIN CERTIFICATE-----',
    ];
    for (const ca of certs) {
      expect(validatePublicCert(ca.trim())).toBe(false);
    }
  });
});
