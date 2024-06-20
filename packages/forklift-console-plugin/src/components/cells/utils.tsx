import React from 'react';

import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';

export const categoryIcons = {
  Critical: { True: <ExclamationCircleIcon color="#C9190B" />, False: undefined },
  Error: { True: <ExclamationCircleIcon color="#C9190B" />, False: undefined },
  Required: { True: <CheckCircleIcon color="#3E8635" />, False: undefined },
  Warn: { True: <ExclamationTriangleIcon color="#F0AB00" />, False: undefined },
  Advisory: { True: <CheckCircleIcon color="#3E8635" />, False: undefined },
};
