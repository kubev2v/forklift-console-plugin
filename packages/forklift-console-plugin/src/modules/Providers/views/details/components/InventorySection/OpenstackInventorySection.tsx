import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { DescriptionList } from '@patternfly/react-core';

import { DetailsItem } from '../../../../utils';

import { InventoryProps } from './InventorySection';

export const OpenstackInventorySection: React.FC<InventoryProps> = ({ data }) => {
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
    regionCount: {
      title: t('Regions'),
      helpContent: t('Number of regions in OpenStack cluster'),
    },
    projectCount: {
      title: t('Projects'),
      helpContent: t('Number of projects in OpenStack cluster'),
    },
    volumeCount: {
      title: t('Volumes'),
      helpContent: t('Number of storage volumes in cluster'),
    },
    volumeTypeCount: {
      title: t('Volume Types'),
      helpContent: t('Number of storage types in cluster'),
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
