import { produce } from 'immer';
import { EMPTY_VDDK_INIT_IMAGE_ANNOTATION, YES_VALUE } from 'src/providers/utils/constants';

import { type IoK8sApiCoreV1Secret, ProviderModel, type V1beta1Provider } from '@kubev2v/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import {
  getAnnotations,
  getName,
  getNamespace,
  getUrl,
  getUseVddkAioOptimization,
  getVddkInitImage,
} from '@utils/crds/common/selectors';

export const createProvider = async (
  provider: V1beta1Provider,
  secret: IoK8sApiCoreV1Secret | undefined,
) => {
  if (!provider) {
    return undefined;
  }

  const newProvider: V1beta1Provider = produce(provider, (draft) => {
    if ((!secret || getUrl(provider)) && draft?.spec) {
      draft.spec.secret = {
        name: getName(secret),
        namespace: getNamespace(secret),
      };
    }
  });

  // Remove empty settings (replace empty str with undefined)
  for (const key in newProvider?.spec?.settings) {
    if (newProvider.spec.settings[key] === '') {
      newProvider.spec.settings[key] = undefined!;
    }
  }

  const readEmptyVddkInitImage = getAnnotations(newProvider)?.[EMPTY_VDDK_INIT_IMAGE_ANNOTATION];

  if (readEmptyVddkInitImage === YES_VALUE && getVddkInitImage(newProvider)) {
    delete newProvider?.spec?.settings?.vddkInitImage;
  }

  if (readEmptyVddkInitImage === YES_VALUE && getUseVddkAioOptimization(newProvider)) {
    delete newProvider?.spec?.settings?.useVddkAioOptimization;
  }

  const obj = await k8sCreate({
    data: newProvider,
    model: ProviderModel,
  });

  return obj;
};
