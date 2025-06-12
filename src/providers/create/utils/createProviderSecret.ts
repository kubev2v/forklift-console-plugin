import { produce } from 'immer';
import { decode, encode } from 'js-base64';

import { type IoK8sApiCoreV1Secret, SecretModel, type V1beta1Provider } from '@kubev2v/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import { getUrl } from '@utils/crds/common/selectors';

const cleanObject = (obj: Record<string, string> | undefined): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
      result[key] = obj[key];
    }
  }

  // Don't save cacert when insecureSkipVerify is true
  if (decode(obj?.insecureSkipVerify ?? '') === 'true') {
    delete result.cacert;
  }

  return result;
};

/**
 * Creates a new Kubernetes secret using the provided provider and secret data.
 */
export const createProviderSecret = async (
  provider: V1beta1Provider,
  secret: IoK8sApiCoreV1Secret,
) => {
  const url = getUrl(provider);
  if (!secret || !url || !provider) {
    return undefined;
  }

  const encodedURL = url && encode(url);
  const generateName = `${provider?.metadata?.name}-`;
  const cleanedData = cleanObject(secret?.data);

  const newSecret: IoK8sApiCoreV1Secret = produce(secret, (draft) => {
    draft.data = cleanedData;
    if (draft.data) draft.data.url = encodedURL;
    if (draft.metadata) {
      draft.metadata.generateName = generateName;
      draft.metadata.labels = {
        ...secret?.metadata?.labels,
        createdForProviderType: provider?.spec?.type as unknown as string,
        createdForResourceType: 'providers',
      };
    }
  });

  const obj = await k8sCreate({
    data: newSecret,
    model: SecretModel,
  });

  return obj;
};
