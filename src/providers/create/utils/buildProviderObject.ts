import type { V1beta1Provider } from '@forklift-ui/types';
import { isEmpty } from '@utils/helpers';

type BuildProviderObjectParams = {
  name: string;
  namespace: string;
  settings?: Record<string, string>;
  type: string;
  url?: string;
};

export const buildProviderObject = ({
  name,
  namespace,
  settings,
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
    ...(settings && !isEmpty(settings) && { settings }),
    type,
    url,
  },
});
