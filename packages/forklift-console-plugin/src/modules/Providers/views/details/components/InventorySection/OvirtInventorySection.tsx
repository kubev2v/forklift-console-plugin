import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { DescriptionList } from '@patternfly/react-core';

import { DetailsItem } from '../../../../utils';

import { InventoryProps } from './InventorySection';

export const OvirtInventorySection: React.FC<InventoryProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const { provider, inventory } = data;

  if (!provider || !inventory) {
    return <span className="text-muted">{t('No inventory data available.')}</span>;
  }

  const inventoryItems = {
    vmCount: {
      title: t('Virtual machines'),
      helpContent: t('Number of virtual machines in cluster'),
    },
    networkCount: {
      title: t('Network interfaces'),
      helpContent: t('Number of network interfaces in provider cluster'),
    },
    datacenterCount: {
      title: t('Data centers'),
      helpContent: t('Number of data centers in provider'),
    },
    storageDomainCount: {
      title: t('Storage domains'),
      helpContent: t('Number of storage domains in provider'),
    },
    clusterCount: {
      title: t('Clusters'),
      helpContent: t('Number of cluster in provider'),
    },
    hostCount: {
      title: t('Hosts'),
      helpContent: t('Number of hosts in provider clusters'),
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
          crumbs={['Inventory', 'providers', `${provider.spec.type}`, '[UID]', key]}
        />,
      );
    }
  }

  return (
    <DescriptionList
      isHorizontal
      horizontalTermWidthModifier={{
        default: '12ch',
        sm: '15ch',
        md: '20ch',
      }}
      columnModifier={{
        default: '2Col',
      }}
    >
      {items}
    </DescriptionList>
  );
};
