import type { V1beta1Provider } from '@kubev2v/types';

export const getProviderUIAnnotation = (provider: V1beta1Provider): string | undefined =>
  provider?.metadata?.annotations?.['forklift.konveyor.io/providerUI'];
