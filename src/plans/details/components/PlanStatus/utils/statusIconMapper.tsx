import type { ReactNode } from 'react';

import { Icon } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  MinusCircleIcon,
  NewProcessIcon,
  PauseCircleIcon,
} from '@patternfly/react-icons';

import { MigrationVirtualMachineStatusIcon } from './types';

export const migrationStatusIconMap: Record<MigrationVirtualMachineStatusIcon, ReactNode> = {
  [MigrationVirtualMachineStatusIcon.Canceled]: (
    <Icon isInline>
      <MinusCircleIcon />
    </Icon>
  ),
  [MigrationVirtualMachineStatusIcon.CantStart]: (
    <Icon status="warning">
      <ExclamationTriangleIcon />
    </Icon>
  ),
  [MigrationVirtualMachineStatusIcon.Failed]: (
    <Icon status="danger">
      <ExclamationCircleIcon />
    </Icon>
  ),
  [MigrationVirtualMachineStatusIcon.InProgress]: (
    <Icon isInline>
      <NewProcessIcon />
    </Icon>
  ),
  [MigrationVirtualMachineStatusIcon.Paused]: (
    <Icon status="warning">
      <PauseCircleIcon />
    </Icon>
  ),
  [MigrationVirtualMachineStatusIcon.Succeeded]: (
    <Icon status="success">
      <CheckCircleIcon />
    </Icon>
  ),
};
