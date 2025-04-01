import React from 'react';

import { Alert } from '@patternfly/react-core';

import './alerts.style.css';

export const AlertMessageForModals: React.FC<{
  title: string;
  message: React.ReactNode | string;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'custom';
}> = ({ title, message, variant = 'danger' }) => (
  <Alert className="co-alert forklift-alert--margin-top" isInline variant={variant} title={title}>
    {message}
  </Alert>
);
