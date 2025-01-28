import React, { FC } from 'react';

import { Alert } from '@patternfly/react-core';

import { CreateVmMigrationPageState } from '../types';

interface FormAlertsProps {
  state: CreateVmMigrationPageState;
}

export const FormAlerts: FC<FormAlertsProps> = ({ state }) => (
  <Alert className="co-alert co-alert--margin-top" isInline variant="danger" title={'API Error'}>
    {state?.flow?.apiError?.message || state?.flow?.apiError?.toString()}
  </Alert>
);
