import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import InventoryCell from 'src/providers/components/InventoryCell';
import { ProvidersResourceFieldId } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { OpenshiftProvider } from '@forklift-ui/types';
import { DatabaseIcon } from '@patternfly/react-icons';

import type { InventoryDetailsItemProps } from './utils/types';

const StorageClassCountDetailsItem: FC<InventoryDetailsItemProps> = ({
  helpContent,
  inventory,
  resource: provider,
}) => {
  const { t } = useForkliftTranslation();

  const defaultHelpContent = t(`Number of storage classes in provider cluster.`);

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
          inventoryValue={(inventory as OpenshiftProvider).storageClassCount}
        />
      }
      crumbs={['Inventory', 'providers', provider?.spec?.type ?? '', '[UID]', 'storageClassCount']}
      helpContent={helpContent ?? defaultHelpContent}
      title={t('Storage classes')}
    />
  );
};

export default StorageClassCountDetailsItem;
