import type { FC } from 'react';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import InventoryCell from 'src/providers/components/InventoryCell';
import { ProvidersResourceFieldId } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { InventoryDetailsItemProps } from './utils/types';

const RegionCountDetailsItem: FC<InventoryDetailsItemProps> = ({
  helpContent,
  inventory,
  resource: provider,
}) => {
  const { t } = useForkliftTranslation();

  const defaultHelpContent = t(`Number of regions in provider.`);

  return (
    <DetailsItem
      title={t('Regions')}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['Inventory', 'providers', provider?.spec?.type ?? '', '[UID]', 'regionCount']}
      content={
        <InventoryCell
          data={{
            inventory,
            inventoryLoading: true,
            provider,
          }}
          fieldId={ProvidersResourceFieldId.RegionCount}
          fields={[]}
          inventoryValue={inventory.regionCount}
        />
      }
    />
  );
};

export default RegionCountDetailsItem;
