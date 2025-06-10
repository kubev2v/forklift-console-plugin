import { decode } from 'js-base64';

import type { IoK8sApiCoreV1Secret } from '@kubev2v/types';

/**
 * Checks if a list of keys exist in a secret's data, and verifies they are not null or empty strings.
 *
 */
export const missingKeysInSecretData = (secret: IoK8sApiCoreV1Secret, keys: string[]): string[] => {
  if (!secret?.data) {
    return keys;
  }

  const missing: string[] = [];

  for (const key of keys) {
    const secretValue = secret.data[key] && decode(secret.data[key]);
    if (!secretValue || secretValue.trim() === '') {
      missing.push(key);
    }
  }

  return missing;
};
