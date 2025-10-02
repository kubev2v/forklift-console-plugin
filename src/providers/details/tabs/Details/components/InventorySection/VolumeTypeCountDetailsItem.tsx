import { type FC, useMemo } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import InventoryCell from 'src/providers/components/InventoryCell';
import { PROVIDER_TYPES, ProvidersResourceFieldId } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { OpenstackProvider } from '@kubev2v/types';

import type { InventoryDetailsItemProps } from './utils/types';

const VolumeTypeCountDetailsItem: FC<InventoryDetailsItemProps> = ({
  helpContent,
  inventory,
  resource: provider,
}) => {
  const { t } = useForkliftTranslation();

  const defaultHelpContent = t(`Number of storage types in provider.`);

  const volumeTypeCount = useMemo(() => {
    if (inventory?.type === PROVIDER_TYPES.openstack) {
      return (inventory as OpenstackProvider).volumeTypeCount;
    }

    return undefined;
  }, [inventory]);

  return (
    <DetailsItem
      title={t('Volume types')}
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
          inventoryValue={volumeTypeCount}
        />
      }
    />
  );
};

export default VolumeTypeCountDetailsItem;
