import type { FC } from 'react';

import { Flex } from '@patternfly/react-core';

import { migrationStatusIconMap } from './utils/statusIconMapper';
import type { MigrationVirtualMachineStatusIcon } from './utils/types';

type VMStatusIconsRowProps = {
  statuses: Record<MigrationVirtualMachineStatusIcon, number>;
};

const VMStatusIconsRow: FC<VMStatusIconsRowProps> = ({ statuses }) => {
  return (
    <Flex
      alignItems={{ default: 'alignItemsCenter' }}
      gap={{ default: 'gapSm' }}
      direction={{ default: 'row' }}
    >
      {(Object.entries(statuses) as [MigrationVirtualMachineStatusIcon, number][])
        .filter(([, count]) => count > 0)
        .map(([status, count]) => (
          <Flex gap={{ default: 'gapXs' }} key={status}>
            {migrationStatusIconMap[status]}
            <span>{count}</span>
          </Flex>
        ))}
    </Flex>
  );
};

export default VMStatusIconsRow;
