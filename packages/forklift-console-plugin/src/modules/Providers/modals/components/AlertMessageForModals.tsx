import React from 'react';

import { Alert } from '@patternfly/react-core';

import './alerts.style.css';

export const AlertMessageForModals: React.FC<{
  title: string;
  message: React.ReactNode | string;
  variant?: 'default' | 'danger' | 'success' | 'warning' | 'info';
}> = ({ title, message, variant = 'danger' }) => (
  <Alert className="co-alert forklift-alert--margin-top" isInline variant={variant} title={title}>
    {message}
  </Alert>
);
