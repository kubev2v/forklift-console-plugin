import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { type IoK8sApiCoreV1Secret, SecretModel, type V1beta1Provider } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Updates the owner reference of the specified secret to point to the provided provider.
 */
export const patchProviderSecretOwner = async (
  provider: V1beta1Provider | undefined,
  secret: IoK8sApiCoreV1Secret | undefined,
) => {
  if (!secret || !provider) {
    return;
  }

  const op = secret?.metadata?.ownerReferences ? REPLACE : ADD;

  await k8sPatch({
    data: [
      {
        op,
        path: '/metadata/ownerReferences',
        value: [
          {
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'Provider',
            name: provider.metadata?.name ?? '',
            uid: provider.metadata?.uid ?? '',
          },
        ],
      },
    ],
    model: SecretModel,
    resource: secret,
  });
};
