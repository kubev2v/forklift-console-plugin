import type { FC } from 'react';

import { Flex, FlexItem, Icon } from '@patternfly/react-core';
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
      <Flex flexWrap={{ default: 'nowrap' }} alignItems={{ default: 'alignItemsCenter' }}>
        <FlexItem className="pf-v6-u-mr-sm">
          <Icon size="md">
            <InfoCircleIcon color="var(--pf-t--global--color--status--info--default)" />
          </Icon>
        </FlexItem>

        <FlexItem>
          <ForkliftTrans>
            <strong>Informational:</strong> Will not cause a big impact on your VMs.
          </ForkliftTrans>
        </FlexItem>
      </Flex>

      {/* Warning */}
      <Flex flexWrap={{ default: 'nowrap' }} alignItems={{ default: 'alignItemsCenter' }}>
        <FlexItem className="pf-v6-u-mr-sm">
          <Icon size="md">
            <ExclamationTriangleIcon color="var(--pf-t--global--color--status--warning--default)" />
          </Icon>
        </FlexItem>

        <FlexItem>
          <ForkliftTrans>
            <strong>Warning:</strong> This might cause impact on your VMs. A feature might not be
            migrated and will need to be re-configured after migration.
          </ForkliftTrans>
        </FlexItem>
      </Flex>

      {/* Critical */}
      <Flex flexWrap={{ default: 'nowrap' }} alignItems={{ default: 'alignItemsCenter' }}>
        <FlexItem className="pf-v6-u-mr-sm">
          <Icon size="md">
            <ExclamationCircleIcon color="var(--pf-t--global--color--status--danger--default)" />
          </Icon>
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
