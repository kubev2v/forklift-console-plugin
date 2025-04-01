import { type IoK8sApiCoreV1Secret, ProviderModel, type V1beta1Provider } from '@kubev2v/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Creates a new provider with the specified secret information.
 *
 * @param {V1beta1Provider} provider - The provider object to be cloned and modified.
 * @param {IoK8sApiCoreV1Secret} secret - The secret object used to update the provider's secret information.
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
export async function createProvider(provider: V1beta1Provider, secret: IoK8sApiCoreV1Secret) {
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

  // Remove empty settings
  for (const key in newProvider?.spec?.settings) {
    // if spec.settings.* is '' replace with undefined
    if (newProvider.spec.settings[key] === '') {
      newProvider.spec.settings[key] = undefined;
    }
  }

  // Remove vddkInitImage when emptyVddkInitImage flag is on
  const emptyVddkInitImage =
    provider?.metadata?.annotations?.['forklift.konveyor.io/empty-vddk-init-image'];

  if (emptyVddkInitImage === 'yes' && provider?.spec?.settings?.vddkInitImage) {
    provider.spec.settings.vddkInitImage = undefined;
  }

  const obj = await k8sCreate({
    data: newProvider,
    model: ProviderModel,
  });

  return obj;
}
