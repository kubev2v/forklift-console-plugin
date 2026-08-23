import type { FC, ReactNode } from 'react';

import { Alert } from '@patternfly/react-core';
import { t } from '@utils/i18n';

import './alerts.style.css';

export const AlertMessageForModals: FC<{
  className?: string;
  message: ReactNode | string;
  title?: string;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'custom';
}> = ({ className, message, title, variant = 'danger' }) => (
  <Alert
    className={className ?? 'co-alert forklift-alert--margin-top'}
    isInline
    title={title ?? t('Error')}
    variant={variant}
  >
    {message}
  </Alert>
);
