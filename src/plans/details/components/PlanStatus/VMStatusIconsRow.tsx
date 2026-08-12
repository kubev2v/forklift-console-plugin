import type { FC } from 'react';

import type { V1beta1Plan } from '@forklift-ui/types';
import { Flex } from '@patternfly/react-core';

import {
  type MigrationVirtualMachinesStatusCountObject,
  type MigrationVirtualMachineStatus,
  statusPriority,
} from './utils/types';
import StatusPopover from './StatusPopover';

type VMStatusIconsRowProps = {
  plan: V1beta1Plan;
  statuses: Record<MigrationVirtualMachineStatus, MigrationVirtualMachinesStatusCountObject>;
};

const VMStatusIconsRow: FC<VMStatusIconsRowProps> = ({ plan, statuses }) => {
  return (
    <Flex
      alignItems={{ default: 'alignItemsCenter' }}
      direction={{ default: 'row' }}
      flexWrap={{ default: 'nowrap' }}
      gap={{ default: 'gapSm' }}
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
            <Flex flexWrap={{ default: 'nowrap' }} gap={{ default: 'gapXs' }} key={status}>
              <StatusPopover count={count} plan={plan} status={status} vms={vms} />
            </Flex>
          );
        })}
    </Flex>
  );
};

export default VMStatusIconsRow;
