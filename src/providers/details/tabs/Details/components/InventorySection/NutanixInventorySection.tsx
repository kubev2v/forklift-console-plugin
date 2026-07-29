import type { FC } from 'react';

import { DescriptionList } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { InventorySectionProps } from './utils/types';
import ClusterCountDetailsItem from './ClusterCountDetailsItem';
import HostCountDetailsItem from './HostCountDetailsItem';
import NetworkCountDetailsItem from './NetworkCountDetailsItem';
import StorageCountDetailsItem from './StorageCountDetailsItem';
import VmCountDetailsItem from './VmCountDetailsItem';

const NutanixInventorySection: FC<InventorySectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();

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
      <ClusterCountDetailsItem
        resource={provider}
        inventory={inventory}
        helpContent={t('Number of Nutanix clusters')}
      />
      <HostCountDetailsItem
        resource={provider}
        inventory={inventory}
        helpContent={t('Number of AHV hypervisor hosts')}
      />
      <StorageCountDetailsItem
        resource={provider}
        inventory={inventory}
        helpContent={t('Number of storage containers')}
      />
      <NetworkCountDetailsItem
        resource={provider}
        inventory={inventory}
        helpContent={t('Number of subnets')}
      />
      <VmCountDetailsItem
        resource={provider}
        inventory={inventory}
        helpContent={t('Number of virtual machines')}
      />
    </DescriptionList>
  );
};

export default NutanixInventorySection;
