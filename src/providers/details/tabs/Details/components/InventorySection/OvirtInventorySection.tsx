import type { FC } from 'react';

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
    <DescriptionList
      columnModifier={{ default: '2Col' }}
      horizontalTermWidthModifier={{ default: '15ch' }}
      isHorizontal
    >
      <NetworkCountDetailsItem inventory={inventory} resource={provider} />
      <StorageDomainCountDetailsItem inventory={inventory} resource={provider} />
      <VmCountDetailsItem inventory={inventory} resource={provider} />
      <HostCountDetailsItem inventory={inventory} resource={provider} />
      <ClusterCountDetailsItem inventory={inventory} resource={provider} />
      <DatacenterCountDetailsItem inventory={inventory} resource={provider} />
    </DescriptionList>
  );
};

export default OvirtInventorySection;
