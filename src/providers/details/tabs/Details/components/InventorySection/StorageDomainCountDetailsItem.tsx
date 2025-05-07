import type { FC } from 'react';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import InventoryCell from 'src/providers/components/InventoryCell';
import { ProvidersResourceFieldId } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import { DatabaseIcon } from '@patternfly/react-icons';

import type { InventoryDetailsItemProps } from './utils/types';

const StorageDomainCountDetailsItem: FC<InventoryDetailsItemProps> = ({
  helpContent,
  inventory,
  resource: provider,
}) => {
  const { t } = useForkliftTranslation();

  const defaultHelpContent = t(`Number of storage domains in provider.`);

  return (
    <DetailsItem
      title={t('Storage domains')}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['Inventory', 'providers', provider?.spec?.type ?? '', '[UID]', 'storageDomainCount']}
      content={
        <InventoryCell
          icon={<DatabaseIcon />}
          data={{
            inventory,
            inventoryLoading: true,
            provider,
          }}
          fieldId={ProvidersResourceFieldId.StorageCount}
          fields={[]}
          inventoryValue={inventory.storageDomainCount}
        />
      }
    />
  );
};

export default StorageDomainCountDetailsItem;
