import type { FC } from 'react';

import { Spinner } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
  MinusCircleIcon,
  PlusCircleIcon,
} from '@patternfly/react-icons';
import { BanIcon } from '@patternfly/react-icons/dist/esm/icons/ban-icon';
import { ClipboardListIcon } from '@patternfly/react-icons/dist/esm/icons/clipboard-list-icon';
import { HourglassHalfIcon } from '@patternfly/react-icons/dist/esm/icons/hourglass-half-icon';
import { HourglassStartIcon } from '@patternfly/react-icons/dist/esm/icons/hourglass-start-icon';
import { NotStartedIcon } from '@patternfly/react-icons/dist/esm/icons/not-started-icon';
import { SyncAltIcon } from '@patternfly/react-icons/dist/esm/icons/sync-alt-icon';
import { UnknownIcon } from '@patternfly/react-icons/dist/esm/icons/unknown-icon';

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
      return <ExclamationTriangleIcon color="#F0AB00" />;

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
      return <ExclamationCircleIcon color="#C9190B" />;

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
      return <CheckCircleIcon color="#3E8635" />;

    case 'Info':
      return <InfoCircleIcon color="#2B9AF3" />;

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
