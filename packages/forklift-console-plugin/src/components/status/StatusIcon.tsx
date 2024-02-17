import React from 'react';

import {
  BlueInfoCircleIcon,
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { Spinner } from '@patternfly/react-core';
import { BanIcon } from '@patternfly/react-icons/dist/esm/icons/ban-icon';
import { ClipboardListIcon } from '@patternfly/react-icons/dist/esm/icons/clipboard-list-icon';
import { HourglassHalfIcon } from '@patternfly/react-icons/dist/esm/icons/hourglass-half-icon';
import { HourglassStartIcon } from '@patternfly/react-icons/dist/esm/icons/hourglass-start-icon';
import { NotStartedIcon } from '@patternfly/react-icons/dist/esm/icons/not-started-icon';
import { SyncAltIcon } from '@patternfly/react-icons/dist/esm/icons/sync-alt-icon';
import { UnknownIcon } from '@patternfly/react-icons/dist/esm/icons/unknown-icon';

export const StatusIcon: React.FC<{ phase: string }> = ({ phase }) => {
  switch (phase) {
    case 'New':
      return <HourglassStartIcon />;

    case 'Pending':
      return <HourglassHalfIcon />;

    case 'Planning':
      return <ClipboardListIcon />;

    case 'ContainerCreating':
    case 'UpgradePending':
    case 'PendingUpgrade':
    case 'PendingRollback':
      return <Spinner size="sm" />;

    case 'In Progress':
    case 'Installing':
    case 'InstallReady':
    case 'Replacing':
    case 'Running':
    case 'Updating':
    case 'Upgrading':
    case 'PendingInstall':
      return <SyncAltIcon />;

    case 'Cancelled':
    case 'Deleting':
    case 'Expired':
    case 'Not Ready':
    case 'Cancelling':
    case 'Terminating':
    case 'Superseded':
    case 'Uninstalling':
      return <BanIcon />;

    case 'Warning':
    case 'RequiresApproval':
      return <YellowExclamationTriangleIcon />;

    case 'ContainerCannotRun':
    case 'CrashLoopBackOff':
    case 'Critical':
    case 'ErrImagePull':
    case 'Error':
    case 'Failed':
    case 'Failure':
    case 'ImagePullBackOff':
    case 'InstallCheckFailed':
    case 'Lost':
    case 'Rejected':
    case 'UpgradeFailed':
      return <RedExclamationCircleIcon />;

    case 'Accepted':
    case 'Active':
    case 'Bound':
    case 'Complete':
    case 'Completed':
    case 'Created':
    case 'Enabled':
    case 'Succeeded':
    case 'Ready':
    case 'Up to date':
    case 'Loaded':
    case 'Provisioned as node':
    case 'Preferred':
    case 'Connected':
    case 'Deployed':
      return <GreenCheckCircleIcon />;

    case 'Info':
      return <BlueInfoCircleIcon />;

    case 'Unknown':
      return <UnknownIcon />;

    case 'PipelineNotStarted':
      return <NotStartedIcon />;

    default:
      return <>-</>;
  }
};

export default StatusIcon;
