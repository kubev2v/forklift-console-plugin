import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import InventoryCell from 'src/providers/components/InventoryCell';
import { ProvidersResourceFieldId } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import { DatabaseIcon } from '@patternfly/react-icons';
import type { AzureProvider } from '@utils/types/azureInventory';

import type { InventoryDetailsItemProps } from './utils/types';

const DiskCountDetailsItem: FC<InventoryDetailsItemProps> = ({
  helpContent,
  inventory,
  resource: provider,
}) => {
  const { t } = useForkliftTranslation();

  const defaultHelpContent = t('Number of managed disks discovered from the provider.');

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
          inventoryValue={(inventory as AzureProvider)?.diskCount}
        />
      }
      crumbs={['Inventory', 'providers', provider?.spec?.type ?? '', '[UID]', 'diskCount']}
      helpContent={helpContent ?? defaultHelpContent}
      title={t('Disks')}
    />
  );
};

export default DiskCountDetailsItem;
