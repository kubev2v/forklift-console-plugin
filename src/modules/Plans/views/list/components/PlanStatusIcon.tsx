import React from 'react';
import type { PlanPhase } from 'src/modules/Plans/utils';

import { Spinner } from '@patternfly/react-core';
import {
  ArchiveIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  SyncAltIcon,
} from '@patternfly/react-icons';

export const PlanStatusIcon: React.FC<{ phase: PlanPhase }> = ({ phase }) =>
  statusIcons[phase] || <ExclamationTriangleIcon color="#F0AB00" />;

const statusIcons = {
  Archived: <ArchiveIcon />,
  Archiving: <Spinner size="sm" />,
  Canceled: <ExclamationTriangleIcon color="#F0AB00" />,
  Error: <ExclamationCircleIcon color="#C9190B" />,
  Failed: <ExclamationCircleIcon color="#C9190B" />,
  NotReady: <Spinner size="sm" />,
  Ready: <CheckCircleIcon color="#3E8635" />,
  Running: <SyncAltIcon />,
  Succeeded: <CheckCircleIcon color="#3E8635" />,
  vmError: <ExclamationCircleIcon color="#C9190B" />,
};
