import type { FC } from 'react';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';

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
    <ModalHOC>
      <DescriptionList
        isHorizontal
        horizontalTermWidthModifier={{ default: '15ch' }}
        columnModifier={{ default: '2Col' }}
      >
        <NetworkCountDetailsItem resource={provider} inventory={inventory} />
        <VolumeCountDetailsItem resource={provider} inventory={inventory} />
        <VolumeTypeCountDetailsItem resource={provider} inventory={inventory} />
        <VmCountDetailsItem resource={provider} inventory={inventory} />
        <ProjectCountDetailsItem resource={provider} inventory={inventory} />
        <RegionCountDetailsItem resource={provider} inventory={inventory} />
      </DescriptionList>
    </ModalHOC>
  );
};

export default OpenstackInventorySection;
