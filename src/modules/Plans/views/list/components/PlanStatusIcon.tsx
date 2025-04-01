import React from 'react';
import { PlanPhase } from 'src/modules/Plans/utils/types/PlanPhase';

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
  Ready: <CheckCircleIcon color="#3E8635" />,
  NotReady: <Spinner size="sm" />,
  Running: <SyncAltIcon />,
  Succeeded: <CheckCircleIcon color="#3E8635" />,
  Canceled: <ExclamationTriangleIcon color="#F0AB00" />,
  Failed: <ExclamationCircleIcon color="#C9190B" />,
  vmError: <ExclamationCircleIcon color="#C9190B" />,
  Archived: <ArchiveIcon />,
  Archiving: <Spinner size="sm" />,
  Error: <ExclamationCircleIcon color="#C9190B" />,
};
