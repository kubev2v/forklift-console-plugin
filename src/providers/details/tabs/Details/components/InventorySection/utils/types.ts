import type { ReactNode } from 'react';

import type { ProviderInventory, V1beta1Provider } from '@forklift-ui/types';
import type { ProviderData } from '@utils/providers/types';

export type InventoryDetailsItemProps = {
  helpContent?: ReactNode;
  inventory: ProviderInventory;
  resource: V1beta1Provider;
};

export type InventorySectionProps = {
  data: ProviderData;
};
