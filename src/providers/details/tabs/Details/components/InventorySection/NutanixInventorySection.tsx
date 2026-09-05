import type { FC } from 'react';

import { DescriptionList } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { InventorySectionProps } from './utils/types';
import ClusterCountDetailsItem from './ClusterCountDetailsItem';
import HostCountDetailsItem from './HostCountDetailsItem';
import NetworkCountDetailsItem from './NetworkCountDetailsItem';
import StorageContainerCountDetailsItem from './StorageContainerCountDetailsItem';
import VmCountDetailsItem from './VmCountDetailsItem';

const NutanixInventorySection: FC<InventorySectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();

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
      <ClusterCountDetailsItem
        helpContent={t('Number of Nutanix clusters')}
        inventory={inventory}
        resource={provider}
      />
      <HostCountDetailsItem
        helpContent={t('Number of AHV hypervisor hosts')}
        inventory={inventory}
        resource={provider}
      />
      <StorageContainerCountDetailsItem
        helpContent={t('Number of storage containers')}
        inventory={inventory}
        resource={provider}
      />
      <NetworkCountDetailsItem
        helpContent={t('Number of subnets')}
        inventory={inventory}
        resource={provider}
      />
      <VmCountDetailsItem
        helpContent={t('Number of virtual machines')}
        inventory={inventory}
        resource={provider}
      />
    </DescriptionList>
  );
};

export default NutanixInventorySection;
