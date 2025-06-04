import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import InventoryCell from 'src/providers/components/InventoryCell';
import { ProvidersResourceFieldId } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import { NetworkIcon } from '@patternfly/react-icons';

import type { InventoryDetailsItemProps } from './utils/types';

const NetworkCountDetailsItem: FC<InventoryDetailsItemProps> = ({
  helpContent,
  inventory,
  resource: provider,
}) => {
  const { t } = useForkliftTranslation();

  const defaultHelpContent = t(`Number of network interfaces in provider cluster.`);

  return (
    <DetailsItem
      title={t('Network interfaces')}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['Inventory', 'providers', provider?.spec?.type ?? '', '[UID]', 'networkCount']}
      content={
        <InventoryCell
          icon={<NetworkIcon />}
          data={{
            inventory,
            inventoryLoading: true,
            provider,
          }}
          fieldId={ProvidersResourceFieldId.NetworkCount}
          fields={[]}
          inventoryValue={inventory.networkCount}
        />
      }
    />
  );
};

export default NetworkCountDetailsItem;
