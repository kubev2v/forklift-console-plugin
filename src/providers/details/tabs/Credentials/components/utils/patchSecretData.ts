import { Base64 } from 'js-base64';

import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { type IoK8sApiCoreV1Secret, SecretModel } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

const cleanObject = (obj) => {
  const result = {};
  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== '') {
      result[key] = obj[key];
    }
  }

  // Don't save cacert when insecureSkipVerify is true
  if (Base64.decode(obj?.insecureSkipVerify ?? '') === 'true') {
    delete result.cacert;
  }

  return result;
};

// when patching a secret with new data, first remove all other fields
const emptyOpenstackCredentials = {
  applicationCredentialID: undefined,
  applicationCredentialName: undefined,
  applicationCredentialSecret: undefined,
  authType: undefined,
  domainName: undefined,
  password: undefined,
  projectID: undefined,
  projectName: undefined,
  regionName: undefined,
  token: undefined,
  userID: undefined,
  username: undefined,
};

/**
 * Updates the data of a Kubernetes secret resource.
 *
 * @param {IoK8sApiCoreV1Secret} secret - The secret object containing the updated data.
 * @param {boolean} clean - Clean old values from the secret before patching.
 * @returns {Promise<void>} A promise that resolves when the patch operation is complete.
 */
export const patchSecretData = async (secret: IoK8sApiCoreV1Secret, clean?: boolean) => {
  const op = secret?.data ? REPLACE : ADD;

  // Sanitize secret data
  const sanitizedData = cleanObject(secret.data);

  await k8sPatch({
    data: [
      {
        op,
        path: '/data',
        value: clean ? { ...emptyOpenstackCredentials, ...sanitizedData } : sanitizedData,
      },
    ],
    model: SecretModel,
    resource: secret,
  });
};
