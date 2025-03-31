import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { DescriptionList } from '@patternfly/react-core';

import { DetailsItem } from '../../../../utils';

import type { InventoryProps } from './InventorySection';

export const OpenstackInventorySection: React.FC<InventoryProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const { inventory, provider } = data;

  if (!provider || !inventory) {
    return <span className="text-muted">{t('No inventory data available.')}</span>;
  }

  const inventoryItems = {
    networkCount: {
      helpContent: t('Number of network interfaces in provider cluster'),
      title: t('Network interfaces'),
    },
    projectCount: {
      helpContent: t('Number of projects in OpenStack cluster'),
      title: t('Projects'),
    },
    regionCount: {
      helpContent: t('Number of regions in OpenStack cluster'),
      title: t('Regions'),
    },
    vmCount: {
      helpContent: t('Number of virtual machines in cluster'),
      title: t('Virtual machines'),
    },
    volumeCount: {
      helpContent: t('Number of storage volumes in cluster'),
      title: t('Volumes'),
    },
    volumeTypeCount: {
      helpContent: t('Number of storage types in cluster'),
      title: t('Volume Types'),
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
