import type { FC } from 'react';

import { Alert, AlertActionCloseButton, type AlertVariant } from '@patternfly/react-core';

export const StateAlerts: FC<{
  variant: AlertVariant;
  messages: { key: string; title: string; body: string; blocker?: boolean }[];
  onClose?: (key: string) => void;
}> = ({ messages, onClose, variant }) => (
  <>
    {messages.map(({ blocker, body, key, title }) => (
      <Alert
        key={key}
        isInline
        actionClose={
          onClose && !blocker ? (
            <AlertActionCloseButton
              onClose={() => {
                onClose(key);
              }}
            />
          ) : undefined
        }
        variant={variant}
        title={title}
      >
        {body}
      </Alert>
    ))}
  </>
);
