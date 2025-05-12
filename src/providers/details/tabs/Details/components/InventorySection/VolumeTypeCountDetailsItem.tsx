import type { FC } from 'react';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import InventoryCell from 'src/providers/components/InventoryCell';
import { ProvidersResourceFieldId } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { InventoryDetailsItemProps } from './utils/types';

const VolumeTypeCountDetailsItem: FC<InventoryDetailsItemProps> = ({
  helpContent,
  inventory,
  resource: provider,
}) => {
  const { t } = useForkliftTranslation();

  const defaultHelpContent = t(`Number of storage types in provider.`);

  return (
    <DetailsItem
      title={t('Volume Types')}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['Inventory', 'providers', provider?.spec?.type ?? '', '[UID]', 'volumeTypeCount']}
      content={
        <InventoryCell
          data={{
            inventory,
            inventoryLoading: true,
            provider,
          }}
          fieldId={ProvidersResourceFieldId.VolumeTypeCount}
          fields={[]}
          inventoryValue={inventory.volumeTypeCount}
        />
      }
    />
  );
};

export default VolumeTypeCountDetailsItem;
