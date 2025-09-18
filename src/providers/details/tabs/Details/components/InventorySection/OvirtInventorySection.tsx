import type { FC } from 'react';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';

import { DescriptionList } from '@patternfly/react-core';

import type { InventorySectionProps } from './utils/types';
import ClusterCountDetailsItem from './ClusterCountDetailsItem';
import DatacenterCountDetailsItem from './DatacenterCountDetailsItem';
import HostCountDetailsItem from './HostCountDetailsItem';
import NetworkCountDetailsItem from './NetworkCountDetailsItem';
import StorageDomainCountDetailsItem from './StorageDomainCountDetailsItem';
import VmCountDetailsItem from './VmCountDetailsItem';

const OvirtInventorySection: FC<InventorySectionProps> = ({ data }) => {
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
        <StorageDomainCountDetailsItem resource={provider} inventory={inventory} />
        <VmCountDetailsItem resource={provider} inventory={inventory} />
        <HostCountDetailsItem resource={provider} inventory={inventory} />
        <ClusterCountDetailsItem resource={provider} inventory={inventory} />
        <DatacenterCountDetailsItem resource={provider} inventory={inventory} />
      </DescriptionList>
    </ModalHOC>
  );
};

export default OvirtInventorySection;
