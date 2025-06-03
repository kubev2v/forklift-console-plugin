import { type IoK8sApiCoreV1Secret, SecretModel } from '@kubev2v/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Creates a Kubernetes secret for disk decryption passphrases
 */
export const createDecryptionSecret = async (
  diskDecryptionPassPhrases: { value: string }[],
  planName: string,
  planProject: string,
): Promise<IoK8sApiCoreV1Secret> => {
  const secret: IoK8sApiCoreV1Secret = {
    data: Object.fromEntries(
      diskDecryptionPassPhrases.map(({ value }, i) => [i.toString(), btoa(value)]),
    ),
    metadata: {
      generateName: `${planName}-`,
      namespace: planProject,
    },
    type: 'Opaque',
  };

  return k8sCreate({ data: secret, model: SecretModel });
};
