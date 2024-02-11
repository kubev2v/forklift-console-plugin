import { SecretModel, V1Secret } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Patches a Kubernetes secret with the given owner reference.
 *
 * @param {V1Secret} secret - The secret object to be patched.
 * @param {{ name: string; uid: string }} ownerRef - The owner reference to be added to the secret.
 * @returns {Promise<void>} A promise that resolves when the patch operation is complete.
 */
export async function patchHostSecretOwner(
  secret: V1Secret,
  ownerRef: { name: string; uid: string },
) {
  const patchedSecret = await k8sPatch({
    model: SecretModel,
    resource: secret,
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
  });

  return patchedSecret;
}
