import React from 'react';

import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';

export const categoryIcons = {
  Advisory: { False: undefined, True: <CheckCircleIcon color="#3E8635" /> },
  Critical: { False: undefined, True: <ExclamationCircleIcon color="#C9190B" /> },
  Error: { False: undefined, True: <ExclamationCircleIcon color="#C9190B" /> },
  Required: { False: undefined, True: <CheckCircleIcon color="#3E8635" /> },
  Warn: { False: undefined, True: <ExclamationTriangleIcon color="#F0AB00" /> },
};
