import React from 'react';

import {
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { Spinner } from '@patternfly/react-core';

export const categoryIcons = {
  Critical: { True: <RedExclamationCircleIcon />, False: undefined },
  Error: { True: <RedExclamationCircleIcon />, False: undefined },
  Required: { True: <GreenCheckCircleIcon />, False: undefined },
  Warn: { True: <YellowExclamationTriangleIcon />, False: undefined },
  Advisory: { True: <GreenCheckCircleIcon />, False: undefined },
};

export const statusIcons = {
  ValidationFailed: <RedExclamationCircleIcon />,
  ConnectionFailed: <RedExclamationCircleIcon />,
  Ready: <GreenCheckCircleIcon />,
  Staging: <Spinner size="sm" />,
};

export const phaseLabes = {
  // t('Ready')
  Ready: 'Ready',
  // t('Connection Failed')
  ConnectionFailed: 'Connection Failed',
  // t('Validation Failed')
  ValidationFailed: 'Validation Failed',
  // t('Staging')
  Staging: 'Staging',
};
