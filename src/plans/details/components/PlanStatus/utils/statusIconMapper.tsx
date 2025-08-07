import type { ReactNode } from 'react';

import { Icon } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  MinusCircleIcon,
  PauseCircleIcon,
} from '@patternfly/react-icons';

import InProgressIcon from './InProgressIcon';
import { MigrationVirtualMachineStatus } from './types';

export const migrationStatusIconMap: Record<MigrationVirtualMachineStatus, ReactNode> = {
  [MigrationVirtualMachineStatus.Canceled]: (
    <Icon isInline>
      <MinusCircleIcon />
    </Icon>
  ),
  [MigrationVirtualMachineStatus.CantStart]: (
    <Icon status="danger">
      <ExclamationCircleIcon />
    </Icon>
  ),
  [MigrationVirtualMachineStatus.Failed]: (
    <Icon status="danger">
      <ExclamationCircleIcon />
    </Icon>
  ),
  [MigrationVirtualMachineStatus.InProgress]: (
    <Icon>
      <InProgressIcon />
    </Icon>
  ),
  [MigrationVirtualMachineStatus.Paused]: (
    <Icon status="warning">
      <PauseCircleIcon />
    </Icon>
  ),
  [MigrationVirtualMachineStatus.Succeeded]: (
    <Icon status="success">
      <CheckCircleIcon />
    </Icon>
  ),
};
