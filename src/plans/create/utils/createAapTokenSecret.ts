import type { IoK8sApiCoreV1Secret } from '@forklift-ui/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

const SECRET_MODEL = {
  abbr: 'S',
  apiGroup: '',
  apiVersion: 'v1',
  crd: false,
  kind: 'Secret',
  label: 'Secret',
  labelPlural: 'Secrets',
  namespaced: true,
  plural: 'secrets',
};

export const createAapTokenSecret = async (
  token: string,
  planName: string,
  planProject: string,
): Promise<IoK8sApiCoreV1Secret> => {
  const secret: IoK8sApiCoreV1Secret = {
    apiVersion: 'v1',
    kind: 'Secret',
    metadata: {
      generateName: `${planName}-aap-token-`,
      labels: {
        createdForResourceType: 'hooks',
      },
      namespace: planProject,
    },
    stringData: {
      token,
    },
    type: 'Opaque',
  };

  return k8sCreate({ data: secret, model: SECRET_MODEL });
};
