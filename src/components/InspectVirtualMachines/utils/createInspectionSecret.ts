import { type IoK8sApiCoreV1Secret, SecretModel } from '@forklift-ui/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

export const createInspectionSecret = async (
  passphrases: string[],
  vmName: string,
  namespace: string,
): Promise<IoK8sApiCoreV1Secret> => {
  const secret: IoK8sApiCoreV1Secret = {
    data: Object.fromEntries(passphrases.map((value, idx) => [idx.toString(), btoa(value)])),
    metadata: {
      generateName: `inspect-luks-${vmName}-`,
      namespace,
    },
    type: 'Opaque',
  };

  return k8sCreate({ data: secret, model: SecretModel });
};
