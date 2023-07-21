import { SecretModel, V1Secret } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Updates the data of a Kubernetes secret resource.
 *
 * @param {V1Secret} secret - The secret object containing the updated data.
 * @param {boolean} clean - Clean old values from the secret before patching.
 * @returns {Promise<void>} A promise that resolves when the patch operation is complete.
 */
export async function patchSecretData(secret: V1Secret, clean?: boolean) {
  const op = secret?.data ? 'replace' : 'add';

  await k8sPatch({
    model: SecretModel,
    resource: secret,
    data: [
      {
        op,
        path: '/data',
        value: clean ? { ...EmptyOpenstackCredentials, ...secret.data } : secret.data,
      },
    ],
  });
}

// when patching a secret with new data, first remove all other fields
const EmptyOpenstackCredentials = {
  authType: undefined,
  username: undefined,
  password: undefined,
  regionName: undefined,
  projectName: undefined,
  domainName: undefined,
  token: undefined,
  userID: undefined,
  projectID: undefined,
  applicationCredentialID: undefined,
  applicationCredentialSecret: undefined,
  applicationCredentialName: undefined,
};
