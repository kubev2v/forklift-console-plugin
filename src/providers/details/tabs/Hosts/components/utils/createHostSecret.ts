import { type IoK8sApiCoreV1Secret, SecretModel } from '@forklift-ui/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import { isEmpty } from '@utils/helpers';

/**
 * Removes null or empty string values from an object.
 */
const cleanObject = (obj: Record<string, string> | undefined) => {
  const result: Record<string, string> = {};
  for (const key in obj) {
    if (!isEmpty(obj[key])) {
      result[key] = obj[key];
    }
  }

  return result;
};

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
