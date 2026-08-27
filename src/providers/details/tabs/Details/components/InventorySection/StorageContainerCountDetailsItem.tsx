import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import InventoryCell from 'src/providers/components/InventoryCell';
import { ProvidersResourceFieldId } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import { DatabaseIcon } from '@patternfly/react-icons';
import { isNutanixProviderInventory } from '@utils/types/nutanixInventory';

import type { InventoryDetailsItemProps } from './utils/types';

const StorageContainerCountDetailsItem: FC<InventoryDetailsItemProps> = ({
  helpContent,
  inventory,
  resource: provider,
}) => {
  const { t } = useForkliftTranslation();

  const defaultHelpContent = t('Number of storage containers');
  const storageContainerCount = isNutanixProviderInventory(inventory)
    ? inventory.storageContainerCount
    : undefined;

  return (
    <DetailsItem
      content={
        <InventoryCell
          data={{
            inventory,
            inventoryLoading: true,
            provider,
          }}
          fieldId={ProvidersResourceFieldId.StorageCount}
          fields={[]}
          icon={<DatabaseIcon />}
          inventoryValue={storageContainerCount}
        />
      }
      crumbs={[
        'Inventory',
        'providers',
        provider?.spec?.type ?? '',
        '[UID]',
        'storageContainerCount',
      ]}
      helpContent={helpContent ?? defaultHelpContent}
      title={t('Storage')}
    />
  );
};

export default StorageContainerCountDetailsItem;
