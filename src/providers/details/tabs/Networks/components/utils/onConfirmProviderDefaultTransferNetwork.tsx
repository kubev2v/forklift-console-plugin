import { ProviderModel, type V1beta1Provider } from '@kubev2v/types';
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
    'forklift.konveyor.io/defaultTransferNetwork': !value || value === '' ? undefined : value,
  };

  const op = resource?.metadata?.annotations ? 'replace' : 'add';

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
