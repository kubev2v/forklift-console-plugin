import type { FC } from 'react';

import { DescriptionList } from '@patternfly/react-core';

import type { InventorySectionProps } from './utils/types';
import ClusterCountDetailsItem from './ClusterCountDetailsItem';
import DatacenterCountDetailsItem from './DatacenterCountDetailsItem';
import DatastoreCountCountDetailsItem from './DatastoreCountCountDetailsItem';
import HostCountDetailsItem from './HostCountDetailsItem';
import NetworkCountDetailsItem from './NetworkCountDetailsItem';
import ProductDetailsItem from './ProductDetailsItem';
import VmCountDetailsItem from './VmCountDetailsItem';

const VSphereInventorySection: FC<InventorySectionProps> = ({ data }) => {
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
      <ProductDetailsItem inventory={inventory} resource={provider} />
      <NetworkCountDetailsItem inventory={inventory} resource={provider} />
      <DatastoreCountCountDetailsItem inventory={inventory} resource={provider} />
      <VmCountDetailsItem inventory={inventory} resource={provider} />
      <HostCountDetailsItem inventory={inventory} resource={provider} />
      <ClusterCountDetailsItem inventory={inventory} resource={provider} />
      <DatacenterCountDetailsItem inventory={inventory} resource={provider} />
    </DescriptionList>
  );
};

export default VSphereInventorySection;
