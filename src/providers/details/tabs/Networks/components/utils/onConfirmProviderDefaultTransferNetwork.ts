import { DEFAULT_TRANSFER_NETWORK_ANNOTATION } from 'src/providers/utils/constants';

import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { ProviderModel, type V1beta1Provider } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

export const onConfirmProviderDefaultTransferNetwork = async ({
  resource,
  value,
}: {
  value: string | number;
  resource: V1beta1Provider;
}): Promise<V1beta1Provider> => {
  const currentAnnotations = resource?.metadata?.annotations;
  const newAnnotations = {
    ...currentAnnotations,
    [DEFAULT_TRANSFER_NETWORK_ANNOTATION]: !value || value === '' ? undefined : value,
  };

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
