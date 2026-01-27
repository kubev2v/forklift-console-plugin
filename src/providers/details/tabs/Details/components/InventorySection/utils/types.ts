import type { ReactNode } from 'react';
import type { ProviderData } from 'src/providers/utils/types/ProviderData';

import type { ProviderInventory, V1beta1Provider } from '@forklift-ui/types';

export type InventoryDetailsItemProps = {
  resource: V1beta1Provider;
  inventory: ProviderInventory;
  helpContent?: ReactNode;
};

export type InventorySectionProps = {
  data: ProviderData;
};
