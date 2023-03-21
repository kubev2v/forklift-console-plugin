import React from 'react';

import {
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { Spinner } from '@patternfly/react-core';

export const statusIcons = {
  ValidationFailed: <RedExclamationCircleIcon />,
  ConnectionFailed: <RedExclamationCircleIcon />,
  Ready: <GreenCheckCircleIcon />,
  Staging: <Spinner size="sm" />,
};

export const phaseLabels = {
  // t('Ready')
  Ready: 'Ready',
  // t('Connection Failed')
  ConnectionFailed: 'Connection Failed',
  // t('Validation Failed')
  ValidationFailed: 'Validation Failed',
  // t('Staging')
  Staging: 'Staging',
};
