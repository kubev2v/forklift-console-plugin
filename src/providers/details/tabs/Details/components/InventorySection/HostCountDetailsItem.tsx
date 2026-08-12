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
      content={
        <InventoryCell
          data={{
            inventory,
            inventoryLoading: true,
            provider,
          }}
          fieldId={ProvidersResourceFieldId.HostCount}
          fields={[]}
          icon={<OutlinedHddIcon />}
          inventoryValue={(inventory as VSphereProvider).hostCount}
        />
      }
      crumbs={['Inventory', 'providers', provider?.spec?.type ?? '', '[UID]', 'hostCount']}
      helpContent={helpContent ?? defaultHelpContent}
      title={t('Hosts')}
    />
  );
};

export default HostCountDetailsItem;
