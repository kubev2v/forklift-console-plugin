import type { FC } from 'react';
import { isHypervClusterProvider } from 'src/providers/utils/helpers/isHypervClusterProvider';

import { DescriptionList } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { InventorySectionProps } from './utils/types';
import ClusterCountDetailsItem from './ClusterCountDetailsItem';
import HostCountDetailsItem from './HostCountDetailsItem';
import StorageCountDetailsItem from './StorageCountDetailsItem';
import VmCountDetailsItem from './VmCountDetailsItem';

const HyperVInventorySection: FC<InventorySectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();

  const { inventory, provider } = data;

  if (!provider || !inventory) {
    return null;
  }

  const isCluster = isHypervClusterProvider(provider);

  return (
    <DescriptionList
      columnModifier={{ default: '2Col' }}
      horizontalTermWidthModifier={{ default: '15ch' }}
      isHorizontal
    >
      {isCluster && (
        <>
          <ClusterCountDetailsItem
            helpContent={t('Number of Failover Clusters')}
            inventory={inventory}
            resource={provider}
          />
          <HostCountDetailsItem
            helpContent={t('Number of cluster nodes')}
            inventory={inventory}
            resource={provider}
          />
        </>
      )}
      <StorageCountDetailsItem inventory={inventory} resource={provider} />
      <VmCountDetailsItem
        helpContent={t('Number of virtual machines exported from Hyper-V')}
        inventory={inventory}
        resource={provider}
      />
    </DescriptionList>
  );
};

export default HyperVInventorySection;
