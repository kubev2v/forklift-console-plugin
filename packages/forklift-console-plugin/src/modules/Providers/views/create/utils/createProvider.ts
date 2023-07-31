import { ProviderModel, V1beta1Provider, V1Secret } from '@kubev2v/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Creates a new provider with the specified secret information.
 *
 * @param {V1beta1Provider} provider - The provider object to be cloned and modified.
 * @param {V1Secret} secret - The secret object used to update the provider's secret information.
 * @returns {Promise<Object>} A Promise that resolves to the created provider object.
 *
 * @async
 * @throws Will throw an error if the k8sCreate operation fails.
 *
 * @example
 *
 * const provider = { metadata: { name: 'my-provider' }, spec: {}};
 * const secret = { metadata: { name: 'my-secret', namespace: 'my-namespace' }};
 *
 * createProvider(provider, secret)
 *  .then(newProvider => console.log(newProvider))
 *  .catch(err => console.error(err));
 */
export async function createProvider(provider: V1beta1Provider, secret: V1Secret) {
  // Sanity check, don't try to create empty provider
  if (!provider) {
    return;
  }

  let newProvider: V1beta1Provider;

  // Skip referencing to empty secret or a secret with no url
  if (!secret || provider?.spec?.url) {
    newProvider = {
      ...provider,
      spec: {
        ...provider?.spec,
        secret: { name: secret?.metadata?.name, namespace: secret?.metadata?.namespace },
      },
    };
  } else {
    newProvider = provider;
  }

  const obj = await k8sCreate({
    model: ProviderModel,
    data: newProvider,
  });

  return obj;
}
