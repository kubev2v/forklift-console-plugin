import { SecretModel, V1Secret } from '@kubev2v/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Creates a Kubernetes secret with the given data.
 *
 * @param {V1Secret} secret - The secret object containing the data to be created.
 * @returns {Promise<V1Secret>} A promise that resolves to the created secret.
 */
export async function createHostSecret(secret: V1Secret) {
  const secretData = cleanObject(secret.data);
  const cleanedSecret = { ...secret, data: secretData };

  const createdSecret = await k8sCreate({
    model: SecretModel,
    data: cleanedSecret,
  });

  return createdSecret;
}

/**
 * Removes null or empty string values from an object.
 *
 * @param {Record<string, any>} obj - The object to clean.
 * @returns {Record<string, any>} A new object with null or empty string values removed.
 */
function cleanObject(obj) {
  const result = {};
  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== '') {
      result[key] = obj[key];
    }
  }

  return result;
}
