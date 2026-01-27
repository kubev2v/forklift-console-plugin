import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import InventoryCell from 'src/providers/components/InventoryCell';
import { ProvidersResourceFieldId } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { VSphereProvider } from '@forklift-ui/types';
import { OutlinedHddIcon } from '@patternfly/react-icons';

import type { InventoryDetailsItemProps } from './utils/types';

const HostCountDetailsItem: FC<InventoryDetailsItemProps> = ({
  helpContent,
  inventory,
  resource: provider,
}) => {
  const { t } = useForkliftTranslation();

  const defaultHelpContent = t(`Number of hosts in provider.`);

  return (
    <DetailsItem
      title={t('Hosts')}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['Inventory', 'providers', provider?.spec?.type ?? '', '[UID]', 'hostCount']}
      content={
        <InventoryCell
          icon={<OutlinedHddIcon />}
          data={{
            inventory,
            inventoryLoading: true,
            provider,
          }}
          fieldId={ProvidersResourceFieldId.HostCount}
          fields={[]}
          inventoryValue={(inventory as VSphereProvider).hostCount}
        />
      }
    />
  );
};

export default HostCountDetailsItem;
