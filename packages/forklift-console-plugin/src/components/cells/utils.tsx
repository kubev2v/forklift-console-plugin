import React from 'react';

import {
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';

export const categoryIcons = {
  Critical: { True: <RedExclamationCircleIcon />, False: undefined },
  Error: { True: <RedExclamationCircleIcon />, False: undefined },
  Required: { True: <GreenCheckCircleIcon />, False: undefined },
  Warn: { True: <YellowExclamationTriangleIcon />, False: undefined },
  Advisory: { True: <GreenCheckCircleIcon />, False: undefined },
};
