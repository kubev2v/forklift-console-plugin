import React from 'react';

import { Alert } from '@patternfly/react-core';

export const AlertMessageForModals: React.FC<{ title: string; message: string }> = ({
  title,
  message,
}) => (
  <Alert className="co-alert co-alert--margin-top" isInline variant="danger" title={title}>
    {message}
  </Alert>
);
