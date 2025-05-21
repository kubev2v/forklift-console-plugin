import type { FC } from 'react';

import { Flex, FlexItem } from '@patternfly/react-core';
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
} from '@patternfly/react-icons';
import { ForkliftTrans, useForkliftTranslation } from '@utils/i18n';

const ConcernsColumnPopover: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
      <p>
        {t(
          'Issues we have detected that might impact your virtual machines or their ability to migrate. There is no guarantee for a successful migration with any of the issues.',
        )}
      </p>

      {/* Informational */}
      <Flex flexWrap={{ default: 'nowrap' }} spaceItems={{ default: 'spaceItemsSm' }}>
        <FlexItem>
          <InfoCircleIcon color="var(--pf-v5-global--info-color--100)" />
        </FlexItem>

        <FlexItem>
          <ForkliftTrans>
            <strong>Informational:</strong> Will not cause a big impact on your VMs.
          </ForkliftTrans>
        </FlexItem>
      </Flex>

      {/* Warning */}
      <Flex flexWrap={{ default: 'nowrap' }} spaceItems={{ default: 'spaceItemsSm' }}>
        <FlexItem>
          <ExclamationTriangleIcon color="var(--pf-v5-global--warning-color--100)" />
        </FlexItem>

        <FlexItem>
          <ForkliftTrans>
            <strong>Warning:</strong> This might cause impact on your VMs. A feature might not be
            migrated and will need to be re-configured after migration.
          </ForkliftTrans>
        </FlexItem>
      </Flex>

      {/* Critical */}
      <Flex flexWrap={{ default: 'nowrap' }} spaceItems={{ default: 'spaceItemsSm' }}>
        <FlexItem>
          <ExclamationCircleIcon color="var(--pf-v5-global--danger-color--100)" />
        </FlexItem>

        <FlexItem>
          <ForkliftTrans>
            <strong>Critical: </strong> VM migration will fail due to this issue. Action must be
            taken to remove the critical concern.
          </ForkliftTrans>
        </FlexItem>
      </Flex>
    </Flex>
  );
};

export default ConcernsColumnPopover;
