import { type IoK8sApiCoreV1Secret, SecretModel } from '@kubev2v/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Creates a Kubernetes secret with the given data.
 *
 * @param {IoK8sApiCoreV1Secret} secret - The secret object containing the data to be created.
 * @returns {Promise<IoK8sApiCoreV1Secret>} A promise that resolves to the created secret.
 */
export const createHostSecret = async (secret: IoK8sApiCoreV1Secret) => {
  const secretData = cleanObject(secret.data);
  const cleanedSecret = { ...secret, data: secretData };

  const createdSecret = await k8sCreate({
    data: cleanedSecret,
    model: SecretModel,
  });

  return createdSecret;
};

/**
 * Removes null or empty string values from an object.
 *
 * @param {Record<string, any>} obj - The object to clean.
 * @returns {Record<string, any>} A new object with null or empty string values removed.
 */
const cleanObject = (obj) => {
  const result = {};
  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== '') {
      result[key] = obj[key];
    }
  }

  return result;
};
