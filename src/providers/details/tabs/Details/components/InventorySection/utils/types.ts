import type { ReactNode } from 'react';

import type { ProviderInventory, V1beta1Provider } from '@forklift-ui/types';
import type { ProviderData } from '@utils/providers/types';

export type InventoryDetailsItemProps = {
  resource: V1beta1Provider;
  inventory: ProviderInventory;
  helpContent?: ReactNode;
};

export type InventorySectionProps = {
  data: ProviderData;
};
