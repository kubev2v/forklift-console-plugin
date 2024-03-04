import React from 'react';
import { PlanPhase } from 'src/modules/Plans/utils';

import {
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { Spinner } from '@patternfly/react-core';
import ArchiveIcon from '@patternfly/react-icons/dist/esm/icons/archive-icon';
import SyncAltIcon from '@patternfly/react-icons/dist/esm/icons/sync-alt-icon';

export const PlanStatusIcon: React.FC<{ phase: PlanPhase }> = ({ phase }) =>
  statusIcons[phase] || <YellowExclamationTriangleIcon />;

const statusIcons = {
  Ready: <GreenCheckCircleIcon />,
  NotReady: <Spinner size="sm" />,
  Running: <SyncAltIcon />,
  Succeeded: <GreenCheckCircleIcon />,
  Canceled: <YellowExclamationTriangleIcon />,
  Failed: <RedExclamationCircleIcon />,
  vmError: <RedExclamationCircleIcon />,
  Archived: <ArchiveIcon />,
  Archiving: <Spinner size="sm" />,
  Error: <RedExclamationCircleIcon />,
};
