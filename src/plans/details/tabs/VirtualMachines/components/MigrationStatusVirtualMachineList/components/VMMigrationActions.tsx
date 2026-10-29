import type { FC } from 'react';

import type { V1beta1Migration, V1beta1PlanStatusMigrationVms } from '@forklift-ui/types';
import { Flex, FlexItem } from '@patternfly/react-core';

import VMCutoverActionsDropdown from './VMMigrationActionsDropdown';

type VMMigrationActionsProps = {
  migration: V1beta1Migration;
  statusVM: V1beta1PlanStatusMigrationVms;
  vmId: string;
  vmName: string;
};

const VMMigrationActions: FC<VMMigrationActionsProps> = ({ migration, statusVM, vmId, vmName }) => {
  const isCompleted = Boolean(statusVM?.completed);
  const isInStorePowerState = statusVM?.phase === 'StorePowerState';

  return (
    <Flex flex={{ default: 'flex_3' }} flexWrap={{ default: 'nowrap' }}>
      <FlexItem align={{ default: 'alignRight' }}>
        <VMCutoverActionsDropdown
          isCompleted={isCompleted}
          isInStorePowerState={isInStorePowerState}
          migration={migration}
          vmId={vmId}
          vmName={vmName}
        />
      </FlexItem>
    </Flex>
  );
};

export default VMMigrationActions;
