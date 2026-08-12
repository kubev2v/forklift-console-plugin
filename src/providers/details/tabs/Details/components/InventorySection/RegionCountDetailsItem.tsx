import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import InventoryCell from 'src/providers/components/InventoryCell';
import { ProvidersResourceFieldId } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { OpenstackProvider } from '@forklift-ui/types';

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
      content={
        <InventoryCell
          data={{
            inventory,
            inventoryLoading: true,
            provider,
          }}
          fieldId={ProvidersResourceFieldId.RegionCount}
          fields={[]}
          inventoryValue={(inventory as OpenstackProvider).regionCount}
        />
      }
      crumbs={['Inventory', 'providers', provider?.spec?.type ?? '', '[UID]', 'regionCount']}
      helpContent={helpContent ?? defaultHelpContent}
      title={t('Regions')}
    />
  );
};

export default RegionCountDetailsItem;
