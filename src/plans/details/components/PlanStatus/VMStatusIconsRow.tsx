import type { FC } from 'react';

import type { V1beta1Plan } from '@kubev2v/types';
import { Flex } from '@patternfly/react-core';

import {
  type MigrationVirtualMachinesStatusCountObject,
  type MigrationVirtualMachineStatus,
  statusPriority,
} from './utils/types';
import StatusPopover from './StatusPopover';

type VMStatusIconsRowProps = {
  statuses: Record<MigrationVirtualMachineStatus, MigrationVirtualMachinesStatusCountObject>;
  plan: V1beta1Plan;
};

const VMStatusIconsRow: FC<VMStatusIconsRowProps> = ({ plan, statuses }) => {
  return (
    <Flex
      alignItems={{ default: 'alignItemsCenter' }}
      gap={{ default: 'gapSm' }}
      direction={{ default: 'row' }}
    >
      {(
        Object.entries(statuses) as [
          MigrationVirtualMachineStatus,
          MigrationVirtualMachinesStatusCountObject,
        ][]
      )
        .filter(([, { count }]) => count > 0)
        .sort(([statusA], [statusB]) => statusPriority[statusA] - statusPriority[statusB])
        .map(([status, { count, vms }]) => {
          return (
            <Flex gap={{ default: 'gapXs' }} key={status}>
              <StatusPopover count={count} plan={plan} status={status} vms={vms} />
            </Flex>
          );
        })}
    </Flex>
  );
};

export default VMStatusIconsRow;
