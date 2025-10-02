import type { FC } from 'react';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';

import { DescriptionList } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { InventorySectionProps } from './utils/types';
import StorageCountDetailsItem from './StorageCountDetailsItem';
import VmCountDetailsItem from './VmCountDetailsItem';

const OVAInventorySection: FC<InventorySectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();

  const { inventory, provider } = data;

  if (!provider || !inventory) {
    return null;
  }

  return (
    <ModalHOC>
      <DescriptionList
        isHorizontal
        horizontalTermWidthModifier={{ default: '15ch' }}
        columnModifier={{ default: '2Col' }}
      >
        <StorageCountDetailsItem resource={provider} inventory={inventory} />
        <VmCountDetailsItem
          resource={provider}
          inventory={inventory}
          helpContent={t('Number of virtual machines in OVA files')}
        />
      </DescriptionList>
    </ModalHOC>
  );
};

export default OVAInventorySection;
