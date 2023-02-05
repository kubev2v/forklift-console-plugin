import * as React from 'react';
import { INotification } from 'legacy/src/common/components/Notifications';

interface INotificationContext {
  pushNotification: (notification: INotification) => void;
  dismissNotification: (key: string) => void;
  notifications: INotification[];
}

const appContextDefaultValue = {} as INotificationContext;
export const NotificationContext =
  React.createContext<INotificationContext>(appContextDefaultValue);

interface INotificationContextProvider {
  children: React.ReactNode;
}

export const NotificationContextProvider: React.FunctionComponent<INotificationContextProvider> = ({
  children,
}: INotificationContextProvider) => {
  const [notifications, setNotifications] = React.useState<INotification[]>([]);

  const pushNotification = (notification: INotification) => {
    setNotifications([...notifications, notification]);
  };

  const dismissNotification = (key: string) => {
    const remainingNotifications = notifications.filter((n) => n.key !== key);
    setNotifications(remainingNotifications);
  };

  return (
    <NotificationContext.Provider
      value={{
        pushNotification,
        dismissNotification,
        notifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
