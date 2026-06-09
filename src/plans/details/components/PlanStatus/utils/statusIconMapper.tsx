import type { ReactNode } from 'react';

import { Icon } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  MinusCircleIcon,
  PauseCircleIcon,
} from '@patternfly/react-icons';
import { PF_LABEL_STATUS } from '@utils/constants';

import InProgressIcon from './InProgressIcon';
import { MigrationVirtualMachineStatus } from './types';

export const migrationStatusIconMap: Record<MigrationVirtualMachineStatus, ReactNode> = {
  [MigrationVirtualMachineStatus.Canceled]: (
    <Icon isInline>
      <MinusCircleIcon />
    </Icon>
  ),
  [MigrationVirtualMachineStatus.CantStart]: (
    <Icon status={PF_LABEL_STATUS.DANGER}>
      <ExclamationCircleIcon />
    </Icon>
  ),
  [MigrationVirtualMachineStatus.Failed]: (
    <Icon status={PF_LABEL_STATUS.DANGER}>
      <ExclamationCircleIcon />
    </Icon>
  ),
  [MigrationVirtualMachineStatus.InProgress]: (
    <Icon>
      <InProgressIcon />
    </Icon>
  ),
  [MigrationVirtualMachineStatus.Paused]: (
    <Icon status={PF_LABEL_STATUS.WARNING}>
      <PauseCircleIcon />
    </Icon>
  ),
  [MigrationVirtualMachineStatus.Succeeded]: (
    <Icon status={PF_LABEL_STATUS.SUCCESS}>
      <CheckCircleIcon />
    </Icon>
  ),
};
