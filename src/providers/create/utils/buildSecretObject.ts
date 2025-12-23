import type { IoK8sApiCoreV1Secret } from '@kubev2v/types';

type BuildSecretObjectParams = {
  data?: Record<string, string>;
  namespace: string;
};

export const buildSecretObject = ({
  data,
  namespace,
}: BuildSecretObjectParams): IoK8sApiCoreV1Secret => ({
  apiVersion: 'v1',
  kind: 'Secret',
  metadata: {
    namespace,
  },
  type: 'Opaque',
  ...(data && { data }),
});
