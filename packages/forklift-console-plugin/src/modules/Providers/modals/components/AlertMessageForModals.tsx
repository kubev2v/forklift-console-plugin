import React from 'react';

import { Alert } from '@patternfly/react-core';

import './alerts.style.css';

export const AlertMessageForModals: React.FC<{ title: string; message: string }> = ({
  title,
  message,
}) => (
  <Alert className="co-alert forklift-alert--margin-top" isInline variant="danger" title={title}>
    {message}
  </Alert>
);
