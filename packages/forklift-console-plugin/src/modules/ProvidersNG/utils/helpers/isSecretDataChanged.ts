import { V1Secret } from '@kubev2v/types';

/**
 * Compares the data records between two versions of a secret.
 *
 * @param {V1Secret} secret1 - The first version of the secret.
 * @param {V1Secret} secret2 - The second version of the secret.
 * @returns {boolean} Returns true if the data records have changed, otherwise returns false.
 */
export function isSecretDataChanged(secret1: V1Secret, secret2: V1Secret): boolean {
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

  // No differences found
  return false;
}
