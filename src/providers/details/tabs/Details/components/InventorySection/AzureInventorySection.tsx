import type { FC } from 'react';

import { DescriptionList } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { InventorySectionProps } from './utils/types';
import DiskCountDetailsItem from './DiskCountDetailsItem';
import NetworkCountDetailsItem from './NetworkCountDetailsItem';
import StorageCountDetailsItem from './StorageCountDetailsItem';
import VmCountDetailsItem from './VmCountDetailsItem';

const AzureInventorySection: FC<InventorySectionProps> = ({ data }) => {
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
      <VmCountDetailsItem
        helpContent={t('Number of Azure virtual machines discovered from the provider.')}
        inventory={inventory}
        resource={provider}
      />
      <NetworkCountDetailsItem
        helpContent={t('Number of Azure subnets discovered from the provider.')}
        inventory={inventory}
        resource={provider}
      />
      <DiskCountDetailsItem
        helpContent={t('Number of managed disks discovered from the provider.')}
        inventory={inventory}
        resource={provider}
      />
      <StorageCountDetailsItem
        helpContent={t('Number of Azure managed disk types available for storage mapping.')}
        inventory={inventory}
        resource={provider}
      />
    </DescriptionList>
  );
};

export default AzureInventorySection;
