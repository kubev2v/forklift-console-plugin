import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { DescriptionList } from '@patternfly/react-core';

import { DetailsItem } from '../../../../utils';

import type { InventoryProps } from './InventorySection';

export const OvirtInventorySection: React.FC<InventoryProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const { inventory, provider } = data;

  if (!provider || !inventory) {
    return <span className="text-muted">{t('No inventory data available.')}</span>;
  }

  const inventoryItems = {
    clusterCount: {
      helpContent: t('Number of cluster in provider'),
      title: t('Clusters'),
    },
    datacenterCount: {
      helpContent: t('Number of data centers in provider'),
      title: t('Data centers'),
    },
    hostCount: {
      helpContent: t('Number of hosts in provider clusters'),
      title: t('Hosts'),
    },
    networkCount: {
      helpContent: t('Number of network interfaces in provider cluster'),
      title: t('Network interfaces'),
    },
    storageDomainCount: {
      helpContent: t('Number of storage domains in provider'),
      title: t('Storage domains'),
    },
    vmCount: {
      helpContent: t('Number of virtual machines in cluster'),
      title: t('Virtual machines'),
    },
  };

  const items = [];

  for (const key in inventoryItems) {
    const item = inventoryItems?.[key];

    if (item) {
      const value = inventory[key] || '-';
      items.push(
        <DetailsItem
          title={item.title}
          content={value}
          helpContent={item.helpContent}
          crumbs={['Inventory', 'providers', provider.spec.type, '[UID]', key]}
        />,
      );
    }
  }

  return (
    <DescriptionList
      isHorizontal
      horizontalTermWidthModifier={{
        default: '12ch',
        md: '20ch',
        sm: '15ch',
      }}
      columnModifier={{
        default: '2Col',
      }}
    >
      {items}
    </DescriptionList>
  );
};
