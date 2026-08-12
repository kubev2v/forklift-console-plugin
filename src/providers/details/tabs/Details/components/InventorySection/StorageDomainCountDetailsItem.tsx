import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import InventoryCell from 'src/providers/components/InventoryCell';
import { ProvidersResourceFieldId } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { OVirtProvider } from '@forklift-ui/types';
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
          inventoryValue={(inventory as OVirtProvider).storageDomainCount}
        />
      }
      crumbs={['Inventory', 'providers', provider?.spec?.type ?? '', '[UID]', 'storageDomainCount']}
      helpContent={helpContent ?? defaultHelpContent}
      title={t('Storage domains')}
    />
  );
};

export default StorageDomainCountDetailsItem;
