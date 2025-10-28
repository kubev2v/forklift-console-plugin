import type { FC } from 'react';

import { DescriptionList } from '@patternfly/react-core';

import type { InventorySectionProps } from './utils/types';
import NetworkCountDetailsItem from './NetworkCountDetailsItem';
import StorageClassCountDetailsItem from './StorageClassCountDetailsItem';
import VmCountDetailsItem from './VmCountDetailsItem';

const OpenshiftInventorySection: FC<InventorySectionProps> = ({ data }) => {
  const { inventory, provider } = data;

  if (!provider || !inventory) {
    return null;
  }

  return (
    <DescriptionList
      isHorizontal
      horizontalTermWidthModifier={{ default: '15ch' }}
      columnModifier={{ default: '2Col' }}
    >
      <NetworkCountDetailsItem resource={provider} inventory={inventory} />
      <StorageClassCountDetailsItem resource={provider} inventory={inventory} />
      <VmCountDetailsItem resource={provider} inventory={inventory} />
    </DescriptionList>
  );
};

export default OpenshiftInventorySection;
