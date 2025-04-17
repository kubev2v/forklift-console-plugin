import type { ReactNode } from 'react';

import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  MinusCircleIcon,
} from '@patternfly/react-icons';

export const getVirtualMachineStatusIcon = (status?: string): ReactNode | null => {
  const iconMap: Record<string, ReactNode> = {
    canceled: <MinusCircleIcon color="grey" />,
    danger: <ExclamationCircleIcon />,
    success: <CheckCircleIcon />,
    warning: <ExclamationTriangleIcon />,
  };

  if (!status) {
    return null;
  }

  return iconMap[status] ?? null;
};
