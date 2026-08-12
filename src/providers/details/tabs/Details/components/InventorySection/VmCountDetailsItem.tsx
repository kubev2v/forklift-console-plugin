import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { VirtualMachinesCell } from 'src/providers/components/VirtualMachinesCell';
import { ProvidersResourceFieldId } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { InventoryDetailsItemProps } from './utils/types';

const VmCountDetailsItem: FC<InventoryDetailsItemProps> = ({
  helpContent,
  inventory,
  resource: provider,
}) => {
  const { t } = useForkliftTranslation();

  const defaultHelpContent = t(`Number of virtual machines in provider.`);

  return (
    <DetailsItem
      content={
        <VirtualMachinesCell
          data={{
            inventory,
            inventoryLoading: true,
            provider,
          }}
          fieldId={ProvidersResourceFieldId.VmCount}
          fields={[]}
          inventoryValue={inventory.vmCount}
        />
      }
      crumbs={['Inventory', 'providers', provider?.spec?.type ?? '', '[UID]', 'vmCount']}
      helpContent={helpContent ?? defaultHelpContent}
      title={t('Virtual machines')}
    />
  );
};

export default VmCountDetailsItem;
