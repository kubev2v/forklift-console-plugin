import type { FC } from 'react';

import { STATUS_ICONS } from '@components/status/statusIcons';
import { Flex, FlexItem } from '@patternfly/react-core';
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

      <Flex flexWrap={{ default: 'nowrap' }} alignItems={{ default: 'alignItemsCenter' }}>
        <FlexItem className="pf-v6-u-mr-sm">{STATUS_ICONS.info}</FlexItem>

        <FlexItem>
          <ForkliftTrans>
            <strong>Informational:</strong> Will not cause a big impact on your VMs.
          </ForkliftTrans>
        </FlexItem>
      </Flex>

      <Flex flexWrap={{ default: 'nowrap' }} alignItems={{ default: 'alignItemsCenter' }}>
        <FlexItem className="pf-v6-u-mr-sm">{STATUS_ICONS.warning}</FlexItem>

        <FlexItem>
          <ForkliftTrans>
            <strong>Warning:</strong> This might cause impact on your VMs. A feature might not be
            migrated and will need to be re-configured after migration.
          </ForkliftTrans>
        </FlexItem>
      </Flex>

      <Flex flexWrap={{ default: 'nowrap' }} alignItems={{ default: 'alignItemsCenter' }}>
        <FlexItem className="pf-v6-u-mr-sm">{STATUS_ICONS.danger}</FlexItem>

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
