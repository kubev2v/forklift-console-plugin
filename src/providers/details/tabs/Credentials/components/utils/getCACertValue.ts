import { CA_CERT_SECRET_KEY, SecretFieldsId } from 'src/providers/utils/constants';

import type { IoK8sApiCoreV1Secret } from '@forklift-ui/types';

import { getDecodedValue } from './getDecodedValue';

// Mirrors backend GetCACert: prefer the canonical key, fall back to the deprecated one.
// An empty canonical value falls through so legacy secrets keep rendering their certificate.
export const getCACertValue = (secret: IoK8sApiCoreV1Secret | undefined): string | undefined => {
  const canonicalCaCert = getDecodedValue(secret?.data?.[CA_CERT_SECRET_KEY]);

  if (canonicalCaCert) {
    return canonicalCaCert;
  }

  return getDecodedValue(secret?.data?.[SecretFieldsId.CaCert]);
};
