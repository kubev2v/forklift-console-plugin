import type { FC } from 'react';

import { DescriptionList } from '@patternfly/react-core';

import type { InventorySectionProps } from './utils/types';
import NetworkCountDetailsItem from './NetworkCountDetailsItem';
import ProjectCountDetailsItem from './ProjectCountDetailsItem';
import RegionCountDetailsItem from './RegionCountDetailsItem';
import VmCountDetailsItem from './VmCountDetailsItem';
import VolumeCountDetailsItem from './VolumeCountDetailsItem';
import VolumeTypeCountDetailsItem from './VolumeTypeCountDetailsItem';

const OpenstackInventorySection: FC<InventorySectionProps> = ({ data }) => {
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
      <VolumeCountDetailsItem inventory={inventory} resource={provider} />
      <VolumeTypeCountDetailsItem inventory={inventory} resource={provider} />
      <VmCountDetailsItem inventory={inventory} resource={provider} />
      <ProjectCountDetailsItem inventory={inventory} resource={provider} />
      <RegionCountDetailsItem inventory={inventory} resource={provider} />
    </DescriptionList>
  );
};

export default OpenstackInventorySection;
