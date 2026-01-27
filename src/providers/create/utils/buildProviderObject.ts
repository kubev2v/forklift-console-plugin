import type { V1beta1Provider } from '@forklift-ui/types';

type BuildProviderObjectParams = {
  name: string;
  namespace: string;
  type: string;
  url?: string;
};

export const buildProviderObject = ({
  name,
  namespace,
  type,
  url,
}: BuildProviderObjectParams): V1beta1Provider => ({
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Provider',
  metadata: {
    name,
    namespace,
  },
  spec: {
    secret: {
      name: undefined,
      namespace,
    },
    type,
    url,
  },
});
