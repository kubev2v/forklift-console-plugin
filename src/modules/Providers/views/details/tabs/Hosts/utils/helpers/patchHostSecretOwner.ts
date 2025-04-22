import { type IoK8sApiCoreV1Secret, SecretModel } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Patches a Kubernetes secret with the given owner reference.
 *
 * @param {IoK8sApiCoreV1Secret} secret - The secret object to be patched.
 * @param {{ name: string; uid: string }} ownerRef - The owner reference to be added to the secret.
 * @returns {Promise<void>} A promise that resolves when the patch operation is complete.
 */
export const patchHostSecretOwner = async (
  secret: IoK8sApiCoreV1Secret,
  ownerRef: { name: string; uid: string },
) => {
  const patchedSecret = await k8sPatch({
    data: [
      {
        op: 'replace',
        path: '/metadata/ownerReferences',
        value: [
          {
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'Host',
            name: ownerRef.name,
            uid: ownerRef.uid,
          },
        ],
      },
    ],
    model: SecretModel,
    resource: secret,
  });

  return patchedSecret;
};
