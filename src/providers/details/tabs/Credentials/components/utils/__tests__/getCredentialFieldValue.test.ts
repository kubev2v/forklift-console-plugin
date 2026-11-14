import { encode } from 'js-base64';
import { SecretFieldsId } from 'src/providers/utils/constants';

import type { IoK8sApiCoreV1Secret } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';

import { getCredentialFieldValue } from '../getCredentialFieldValue';

const CANONICAL_CA_CERT = 'canonical-cert';
const LEGACY_CA_CERT = 'legacy-cert';

describe('getCredentialFieldValue', () => {
  it('resolves the CA field from the canonical ca.crt key first', () => {
    const secret: IoK8sApiCoreV1Secret = {
      data: { 'ca.crt': encode(CANONICAL_CA_CERT), cacert: encode(LEGACY_CA_CERT) },
    };

    expect(getCredentialFieldValue(secret, SecretFieldsId.CaCert)).toBe(CANONICAL_CA_CERT);
  });

  it('resolves the CA field from the legacy cacert key', () => {
    const secret: IoK8sApiCoreV1Secret = { data: { cacert: encode(LEGACY_CA_CERT) } };

    expect(getCredentialFieldValue(secret, SecretFieldsId.CaCert)).toBe(LEGACY_CA_CERT);
  });

  it('does a plain lookup for non-CA keys', () => {
    const secret: IoK8sApiCoreV1Secret = {
      data: { 'ca.crt': encode(CANONICAL_CA_CERT), user: encode('admin') },
    };

    expect(getCredentialFieldValue(secret, SecretFieldsId.User)).toBe('admin');
  });

  it('does not alias missing non-CA keys to the CA value', () => {
    const secret: IoK8sApiCoreV1Secret = { data: { 'ca.crt': encode(CANONICAL_CA_CERT) } };

    expect(getCredentialFieldValue(secret, SecretFieldsId.Password)).toBeUndefined();
  });
});
