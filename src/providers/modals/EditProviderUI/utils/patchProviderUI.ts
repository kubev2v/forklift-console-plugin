import { providerUiAnnotation } from 'src/providers/utils/constants';

import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { ProviderModel, type V1beta1Provider } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

type PatchProviderUIParams = {
  newValue: string;
  resource: V1beta1Provider;
};

/**
 * Patches the provider UI annotation in the resource's metadata.
 */
export const patchProviderUI = async ({
  newValue: value,
  resource,
}: PatchProviderUIParams): Promise<V1beta1Provider> => {
  const currentAnnotations: Record<string, unknown> = resource?.metadata?.annotations ?? {};
  const newAnnotations = { ...currentAnnotations };
  if (value) {
    newAnnotations[providerUiAnnotation] = value;
  } else {
    delete newAnnotations[providerUiAnnotation];
  }

  const op = resource?.metadata?.annotations ? REPLACE : ADD;

  const obj = await k8sPatch({
    data: [
      {
        op,
        path: '/metadata/annotations',
        value: newAnnotations,
      },
    ],
    model: ProviderModel,
    resource,
  });

  return obj;
};
