import type { FC } from 'react';

import { DescriptionList } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { InventorySectionProps } from './utils/types';
import StorageCountDetailsItem from './StorageCountDetailsItem';
import VmCountDetailsItem from './VmCountDetailsItem';

const HyperVInventorySection: FC<InventorySectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();

  const { inventory, provider } = data;

  if (!provider || !inventory) {
    return null;
  }

  return (
    <DescriptionList
      isHorizontal
      horizontalTermWidthModifier={{ default: '15ch' }}
      columnModifier={{ default: '2Col' }}
    >
      <StorageCountDetailsItem resource={provider} inventory={inventory} />
      <VmCountDetailsItem
        resource={provider}
        inventory={inventory}
        helpContent={t('Number of virtual machines exported from Hyper-V')}
      />
    </DescriptionList>
  );
};

export default HyperVInventorySection;
