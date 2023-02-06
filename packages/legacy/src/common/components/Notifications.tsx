import * as React from 'react';
import { Alert, AlertGroup, AlertActionCloseButton } from '@patternfly/react-core';
import { NotificationContext } from 'legacy/src/common/context';

export type notificationType = 'success' | 'info' | 'warning' | 'danger' | 'default';

export interface INotification {
  title: string;
  message: string | JSX.Element;
  variant: notificationType;
  key: string;
  actionClose?: boolean;
  timeout?: number | boolean;
}

export const Notifications: React.FunctionComponent = () => {
  const appContext = React.useContext(NotificationContext);
  return (
    <AlertGroup isToast aria-live="polite">
      {appContext.notifications.map((notification) => {
        return (
          <Alert
            title={notification.title}
            variant={notification.variant}
            key={notification.key}
            {...(notification.actionClose && {
              actionClose: (
                <AlertActionCloseButton
                  onClose={() => {
                    appContext.dismissNotification(notification.key);
                  }}
                />
              ),
            })}
            timeout={notification.timeout}
          >
            {notification.message}
          </Alert>
        );
      })}
    </AlertGroup>
  );
};
