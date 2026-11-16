// Azure inventory types are defined locally because @forklift-ui/types does not
// include Azure provider or inventory types yet.
// https://github.com/kubev2v/forklift/tree/main/pkg/provider/azure/inventory

import type { PROVIDER_TYPES } from '@utils/providers/constants';

export type AzureProvider = {
  diskCount: number;
  networkCount: number;
  storageCount: number;
  type?: string;
  vmCount: number;
};

// Azure storage entries are managed disk types (SKUs).
export type AzureStorage = {
  id: string;
  name: string;
  providerType: typeof PROVIDER_TYPES.azure;
  revision: number;
  selfLink: string;
};
