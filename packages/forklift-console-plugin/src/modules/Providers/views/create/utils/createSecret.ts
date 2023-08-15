import { Base64 } from 'js-base64';

import { SecretModel, V1beta1Provider, V1Secret } from '@kubev2v/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Creates a new Kubernetes secret using the provided provider and secret data.
 *
 * @param {V1beta1Provider} provider - The provider object which includes metadata and spec information.
 * @param {V1Secret} secret - The base secret object to be cloned and modified.
 * @returns {Promise<Object>} A Promise that resolves to the created Kubernetes secret object.
 *
 * @async
 * @throws Will throw an error if the k8sCreate operation fails.
 *
 * @example
 *
 * const provider = { metadata: { name: 'my-provider', namespace: 'my-namespace' }, spec: { type: 'my-type', url: 'http://example.com' }};
 * const secret = { metadata: { namespace: 'my-namespace' }, data: {}};
 *
 * createSecret(provider, secret)
 *  .then(newSecret => console.log(newSecret))
 *  .catch(err => console.error(err));
 */
export async function createSecret(provider: V1beta1Provider, secret: V1Secret) {
  const url = provider?.spec?.url;

  // Sanity check, don't try to create empty secret, or a secret without url
  if (!secret || !url) {
    return;
  }

  const encodedURL = url ? Base64.encode(url) : undefined;
  const generateName = `${provider.metadata.name}-`;

  const newSecret: V1Secret = {
    ...secret,
    metadata: {
      ...secret?.metadata,
      generateName: generateName,
      labels: {
        ...secret?.metadata?.labels,
        createdForProviderType: provider?.spec?.type,
        createdForResourceType: 'providers',
      },
    },
    data: { ...secret?.data, url: encodedURL },
  };

  const obj = await k8sCreate({
    model: SecretModel,
    data: newSecret,
  });

  return obj;
}
