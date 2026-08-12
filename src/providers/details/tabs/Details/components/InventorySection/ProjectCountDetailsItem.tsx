import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import InventoryCell from 'src/providers/components/InventoryCell';
import { ProvidersResourceFieldId } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { OpenstackProvider } from '@forklift-ui/types';

import type { InventoryDetailsItemProps } from './utils/types';

const ProjectCountDetailsItem: FC<InventoryDetailsItemProps> = ({
  helpContent,
  inventory,
  resource: provider,
}) => {
  const { t } = useForkliftTranslation();

  const defaultHelpContent = t(`Number of projects in OpenStack cluster.`);

  return (
    <DetailsItem
      content={
        <InventoryCell
          data={{
            inventory,
            inventoryLoading: true,
            provider,
          }}
          fieldId={ProvidersResourceFieldId.ProjectCount}
          fields={[]}
          inventoryValue={(inventory as OpenstackProvider).projectCount}
        />
      }
      crumbs={['Inventory', 'providers', provider?.spec?.type ?? '', '[UID]', 'projectCount']}
      helpContent={helpContent ?? defaultHelpContent}
      title={t('Projects')}
    />
  );
};

export default ProjectCountDetailsItem;
