import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import InventoryCell from 'src/providers/components/InventoryCell';
import { ProvidersResourceFieldId } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { VSphereProvider } from '@forklift-ui/types';

import type { InventoryDetailsItemProps } from './utils/types';

const ClusterCountDetailsItem: FC<InventoryDetailsItemProps> = ({
  helpContent,
  inventory,
  resource: provider,
}) => {
  const { t } = useForkliftTranslation();

  const defaultHelpContent = t(`Number of clusters in provider.`);

  return (
    <DetailsItem
      content={
        <InventoryCell
          data={{
            inventory,
            inventoryLoading: true,
            provider,
          }}
          fieldId={ProvidersResourceFieldId.ClusterCount}
          fields={[]}
          inventoryValue={(inventory as VSphereProvider).clusterCount}
        />
      }
      crumbs={['Inventory', 'providers', provider?.spec?.type ?? '', '[UID]', 'clusterCount']}
      helpContent={helpContent ?? defaultHelpContent}
      title={t('Clusters')}
    />
  );
};

export default ClusterCountDetailsItem;
