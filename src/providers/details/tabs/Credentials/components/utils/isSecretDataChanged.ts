import type { IoK8sApiCoreV1Secret } from '@kubev2v/types';

export const isSecretDataChanged = (
  secret1: IoK8sApiCoreV1Secret,
  secret2: IoK8sApiCoreV1Secret,
): boolean => {
  // Both secrets don't have data records
  if (!secret1.data && !secret2.data) {
    return false;
  }

  // One of the secrets doesn't have data records
  if (!secret1.data || !secret2.data) {
    return true;
  }

  // Both secrets have data records, but the number of records is different
  if (Object.keys(secret1.data).length !== Object.keys(secret2.data).length) {
    return true;
  }

  // Compare each data record
  for (const key in secret1.data) {
    if (secret1.data[key] !== secret2.data[key]) {
      return true;
    }
  }

  return false;
};
