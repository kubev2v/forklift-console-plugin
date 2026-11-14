import { encode } from 'js-base64';

import type { IoK8sApiCoreV1Secret } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';

import { getCACertValue } from '../getCACertValue';

const CA_CERT = '-----BEGIN CERTIFICATE-----\nMIID...';
const LEGACY_CA_CERT = '-----BEGIN CERTIFICATE-----\nLEGACY...';

const secretWithData = (data: Record<string, string>): IoK8sApiCoreV1Secret => ({ data });

describe('getCACertValue', () => {
  it('decodes a secret that only has the canonical ca.crt key', () => {
    expect(getCACertValue(secretWithData({ 'ca.crt': encode(CA_CERT) }))).toBe(CA_CERT);
  });

  it('decodes a secret that only has the legacy cacert key', () => {
    expect(getCACertValue(secretWithData({ cacert: encode(LEGACY_CA_CERT) }))).toBe(LEGACY_CA_CERT);
  });

  it('prefers ca.crt when both keys are present', () => {
    const secret = secretWithData({
      'ca.crt': encode(CA_CERT),
      cacert: encode(LEGACY_CA_CERT),
    });

    expect(getCACertValue(secret)).toBe(CA_CERT);
  });

  it('falls back to cacert when ca.crt is empty', () => {
    const secret = secretWithData({ 'ca.crt': encode(''), cacert: encode(LEGACY_CA_CERT) });

    expect(getCACertValue(secret)).toBe(LEGACY_CA_CERT);
  });

  it('returns undefined when neither key is present', () => {
    expect(getCACertValue(secretWithData({ insecureSkipVerify: encode('false') }))).toBeUndefined();
  });

  it('returns undefined when data is missing', () => {
    expect(getCACertValue({})).toBeUndefined();
    expect(getCACertValue(undefined)).toBeUndefined();
  });

  it('returns undefined when data is empty', () => {
    expect(getCACertValue(secretWithData({}))).toBeUndefined();
  });
});
