import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@forklift-ui/types';

import type { buildProviderResources } from './buildProviderResources';

export type ProviderResources = ReturnType<typeof buildProviderResources>;

export type ProviderCreationProgress = {
  inFlight?: Promise<V1beta1Provider>;
  ownerPatched?: boolean;
  provider?: V1beta1Provider;
  resources?: ProviderResources;
  secret?: IoK8sApiCoreV1Secret;
};
