import React, { FC } from 'react';

import { Alert, AlertActionCloseButton, AlertVariant } from '@patternfly/react-core';

export const StateAlerts: FC<{
  variant: AlertVariant;
  messages: { key: string; title: string; body: string }[];
  onClose?: (key: string) => void;
}> = ({ variant, messages, onClose }) => (
  <>
    {messages.map(({ key, title, body }) => (
      <Alert
        key={key}
        isInline
        actionClose={onClose ? <AlertActionCloseButton onClose={() => onClose(key)} /> : undefined}
        variant={variant}
        title={title}
      >
        {body}
      </Alert>
    ))}
  </>
);
