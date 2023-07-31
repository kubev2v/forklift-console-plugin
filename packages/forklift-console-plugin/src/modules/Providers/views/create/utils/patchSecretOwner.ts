import { SecretModel, V1beta1Provider, V1Secret } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Updates the owner reference of the specified secret to point to the provided provider.
 *
 * @param {V1beta1Provider} provider - The provider object to be set as the owner of the secret.
 * @param {V1Secret} secret - The secret object to be updated with the provider's owner reference.
 *
 * @async
 * @throws Will throw an error if the k8sPatch operation fails.
 *
 * @example
 *
 * const provider = { metadata: { name: 'my-provider', uid: 'uid-123' }};
 * const secret = { metadata: {}, data: {}};
 *
 * patchSecretOwner(provider, secret)
 *  .then(() => console.log('Secret owner patched successfully'))
 *  .catch(err => console.error(err));
 */
export async function patchSecretOwner(provider: V1beta1Provider, secret: V1Secret) {
  // Sanity check, don't try to patch empty secret
  if (!secret) {
    return;
  }

  const op = secret?.metadata?.ownerReferences ? 'replace' : 'add';

  await k8sPatch({
    model: SecretModel,
    resource: secret,
    data: [
      {
        op,
        path: '/metadata/ownerReferences',
        value: [
          {
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'Provider',
            name: provider.metadata.name,
            uid: provider.metadata.uid,
          },
        ],
      },
    ],
  });
}
