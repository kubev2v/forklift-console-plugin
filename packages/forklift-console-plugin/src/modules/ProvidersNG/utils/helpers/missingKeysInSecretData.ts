import { Base64 } from 'js-base64';

import { V1Secret } from '@kubev2v/types';

/**
 * Checks if a list of keys exist in a secret's data, and verifies they are not null or empty strings.
 *
 * @param {V1Secret} secret - The secret to be checked.
 * @param {string[]} keys - The list of keys to check.
 * @returns {string[]} Returns a list of missing keys in secret data.
 */
export function missingKeysInSecretData(secret: V1Secret, keys: string[]): string[] {
  // If secret or secret's data is not defined, return false
  if (!secret?.data) {
    return keys;
  }

  const missing: string[] = [];

  for (const key of keys) {
    const secretValue = secret.data[key] && Base64.decode(secret.data[key]);

    // Check if the key exists and is not null or empty string
    if (!secretValue || secretValue.trim() === '') {
      missing.push(key);
    }
  }

  // All keys exist and are not null or empty string
  return missing;
}
