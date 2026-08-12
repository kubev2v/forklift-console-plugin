import type { FC } from 'react';

import { DescriptionList } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { InventorySectionProps } from './utils/types';
import NetworkCountDetailsItem from './NetworkCountDetailsItem';
import VmCountDetailsItem from './VmCountDetailsItem';

const Ec2InventorySection: FC<InventorySectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const { inventory, provider } = data;

  if (!provider || !inventory) {
    return null;
  }

  return (
    <DescriptionList
      columnModifier={{ default: '2Col' }}
      horizontalTermWidthModifier={{ default: '15ch' }}
      isHorizontal
    >
      <VmCountDetailsItem
        helpContent={t('Number of EC2 instances discovered from the provider')}
        inventory={inventory}
        resource={provider}
      />
      <NetworkCountDetailsItem
        helpContent={t('Number of VPC networks discovered from the provider')}
        inventory={inventory}
        resource={provider}
      />
    </DescriptionList>
  );
};

export default Ec2InventorySection;
