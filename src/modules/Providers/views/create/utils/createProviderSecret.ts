import { Base64 } from 'js-base64';

import { type IoK8sApiCoreV1Secret, SecretModel, type V1beta1Provider } from '@kubev2v/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Creates a new Kubernetes secret using the provided provider and secret data.
 *
 * @param {V1beta1Provider} provider - The provider object which includes metadata and spec information.
 * @param {IoK8sApiCoreV1Secret} secret - The base secret object to be cloned and modified.
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
export async function createProviderSecret(
  provider: V1beta1Provider,
  secret: IoK8sApiCoreV1Secret,
) {
  const url = provider?.spec?.url;

  // Sanity check, don't try to create empty secret, or a secret without url
  if (!secret || !url) {
    return;
  }

  const encodedURL = url ? Base64.encode(url) : undefined;
  const generateName = `${provider.metadata.name}-`;
  const cleanedData = cleanObject(secret?.data);

  const newSecret: IoK8sApiCoreV1Secret = {
    ...secret,
    data: { ...cleanedData, url: encodedURL },
    metadata: {
      ...secret?.metadata,
      generateName,
      labels: {
        ...secret?.metadata?.labels,
        createdForProviderType: provider?.spec?.type,
        createdForResourceType: 'providers',
      },
    },
  };

  const obj = await k8sCreate({
    data: newSecret,
    model: SecretModel,
  });

  return obj;
}

function cleanObject(obj) {
  const result = {};
  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== '') {
      result[key] = obj[key];
    }
  }

  // Don't save cacert when insecureSkipVerify is true
  if (Base64.decode(obj?.insecureSkipVerify || '') === 'true') {
    delete result.cacert;
  }

  return result;
}
