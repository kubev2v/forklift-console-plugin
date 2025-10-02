import type { FC } from 'react';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';

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
    <ModalHOC>
      <DescriptionList
        isHorizontal
        horizontalTermWidthModifier={{ default: '15ch' }}
        columnModifier={{ default: '2Col' }}
      >
        <NetworkCountDetailsItem resource={provider} inventory={inventory} />
        <StorageClassCountDetailsItem resource={provider} inventory={inventory} />
        <VmCountDetailsItem resource={provider} inventory={inventory} />
      </DescriptionList>
    </ModalHOC>
  );
};

export default OpenshiftInventorySection;
