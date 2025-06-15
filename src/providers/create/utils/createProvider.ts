import { EMPTY_VDDK_INIT_IMAGE_ANNOTATION } from 'src/providers/utils/constants';

import { type IoK8sApiCoreV1Secret, ProviderModel, type V1beta1Provider } from '@kubev2v/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import {
  getAnnotations,
  getName,
  getNamespace,
  getUrl,
  getVddkInitImage,
} from '@utils/crds/common/selectors';

export const createProvider = async (provider: V1beta1Provider, secret: IoK8sApiCoreV1Secret) => {
  // Sanity check, don't try to create empty provider
  if (!provider) {
    return undefined;
  }

  let newProvider: V1beta1Provider;

  if (!secret || getUrl(provider)) {
    newProvider = {
      ...provider,
      spec: {
        ...provider?.spec,
        secret: {
          name: getName(secret),
          namespace: getNamespace(secret),
        },
      },
    };
  } else {
    newProvider = provider;
  }

  // Remove empty settings (replace empty str with undefined)
  for (const key in newProvider?.spec?.settings) {
    if (newProvider.spec.settings[key] === '') {
      newProvider.spec.settings[key] = undefined!;
    }
  }

  const readEmptyVddkInitImage = getAnnotations(provider)?.[EMPTY_VDDK_INIT_IMAGE_ANNOTATION];

  if (readEmptyVddkInitImage === 'yes' && getVddkInitImage(provider)) {
    provider.spec.settings.vddkInitImage = undefined!;
  }

  const obj = await k8sCreate({
    data: newProvider,
    model: ProviderModel,
  });

  return obj;
};
