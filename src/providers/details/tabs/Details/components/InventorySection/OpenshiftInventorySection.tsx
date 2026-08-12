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
      columnModifier={{ default: '2Col' }}
      horizontalTermWidthModifier={{ default: '15ch' }}
      isHorizontal
    >
      <NetworkCountDetailsItem inventory={inventory} resource={provider} />
      <StorageClassCountDetailsItem inventory={inventory} resource={provider} />
      <VmCountDetailsItem inventory={inventory} resource={provider} />
    </DescriptionList>
  );
};

export default OpenshiftInventorySection;
