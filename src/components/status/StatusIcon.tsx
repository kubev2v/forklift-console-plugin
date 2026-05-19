import type { FC } from 'react';

import { Spinner } from '@patternfly/react-core';
import {
  BanIcon,
  ClipboardListIcon,
  HourglassHalfIcon,
  HourglassStartIcon,
  MinusCircleIcon,
  NotStartedIcon,
  PlusCircleIcon,
  SyncAltIcon,
  UnknownIcon,
} from '@patternfly/react-icons';

import { STATUS_ICONS } from './statusIcons';

const StatusIcon: FC<{ phase: string }> = ({ phase }) => {
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
      return STATUS_ICONS.warning;

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
      return STATUS_ICONS.danger;

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
      return STATUS_ICONS.success;

    case 'Info':
      return STATUS_ICONS.info;

    case 'Unknown':
      return <UnknownIcon />;

    case 'PipelineNotStarted':
      return <NotStartedIcon />;

    case 'True':
      return <PlusCircleIcon />;

    case 'False':
      return <MinusCircleIcon />;

    default:
      return <>-</>;
  }
};

export default StatusIcon;
