import { type IoK8sApiCoreV1Secret, SecretModel } from '@forklift-ui/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

export const SOURCE_SECRET_LABEL = 'forklift.konveyor.io/source-secret';

export const copyDecryptionSecret = async (
  existingSecret: IoK8sApiCoreV1Secret,
  planName: string,
  namespace: string,
): Promise<IoK8sApiCoreV1Secret> => {
  const newSecret: IoK8sApiCoreV1Secret = {
    data: existingSecret.data,
    metadata: {
      generateName: `${planName}-`,
      labels: {
        [SOURCE_SECRET_LABEL]: existingSecret.metadata?.name ?? '',
      },
      namespace,
    },
    type: existingSecret.type ?? 'Opaque',
  };

  return k8sCreate({ data: newSecret, model: SecretModel });
};
