import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import InventoryCell from 'src/providers/components/InventoryCell';
import { ProvidersResourceFieldId } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { VSphereProvider } from '@forklift-ui/types';

import type { InventoryDetailsItemProps } from './utils/types';

const DatacenterCountDetailsItem: FC<InventoryDetailsItemProps> = ({
  helpContent,
  inventory,
  resource: provider,
}) => {
  const { t } = useForkliftTranslation();

  const defaultHelpContent = t(`Number of data centers in provider.`);

  return (
    <DetailsItem
      title={t('Data centers')}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['Inventory', 'providers', provider?.spec?.type ?? '', '[UID]', 'datacenterCount']}
      content={
        <InventoryCell
          data={{
            inventory,
            inventoryLoading: true,
            provider,
          }}
          fieldId={ProvidersResourceFieldId.DatacenterCount}
          fields={[]}
          inventoryValue={(inventory as VSphereProvider).datacenterCount}
        />
      }
    />
  );
};

export default DatacenterCountDetailsItem;
