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
      isHorizontal
      horizontalTermWidthModifier={{ default: '15ch' }}
      columnModifier={{ default: '2Col' }}
    >
      {isCluster && (
        <>
          <ClusterCountDetailsItem
            resource={provider}
            inventory={inventory}
            helpContent={t('Number of Failover Clusters')}
          />
          <HostCountDetailsItem
            resource={provider}
            inventory={inventory}
            helpContent={t('Number of cluster nodes')}
          />
        </>
      )}
      <StorageCountDetailsItem resource={provider} inventory={inventory} />
      <VmCountDetailsItem
        resource={provider}
        inventory={inventory}
        helpContent={t('Number of virtual machines exported from Hyper-V')}
      />
    </DescriptionList>
  );
};

export default HyperVInventorySection;
