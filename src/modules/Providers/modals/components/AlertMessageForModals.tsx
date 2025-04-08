import type { FC, ReactNode } from 'react';

import { Alert } from '@patternfly/react-core';

import './alerts.style.css';

export const AlertMessageForModals: FC<{
  title: string;
  message: ReactNode | string;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'custom';
}> = ({ message, title, variant = 'danger' }) => (
  <Alert className="co-alert forklift-alert--margin-top" isInline variant={variant} title={title}>
    {message}
  </Alert>
);
