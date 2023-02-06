import * as React from 'react';
import { Button } from '@patternfly/react-core';
import { NotificationContext, MustGatherContext } from 'legacy/src/common/context';
import { useMustGatherQuery } from 'legacy/src/queries';
import { mustGatherStatus } from 'legacy/src/client/types';

interface IMustGatherWatcherProps {
  name: string;
  listStatus: mustGatherStatus;
}

export const MustGatherWatcher: React.FunctionComponent<IMustGatherWatcherProps> = ({
  name,
  listStatus,
}: IMustGatherWatcherProps) => {
  const { pushNotification } = React.useContext(NotificationContext);
  const completedPreviously = listStatus === 'completed';
  const erroredPreviously = listStatus === 'error';
  const [notified, setNotified] = React.useState(completedPreviously || erroredPreviously);
  const [hasCompleted, setHasCompleted] = React.useState(completedPreviously || erroredPreviously);
  const { data, isSuccess } = useMustGatherQuery(name, hasCompleted);
  const { withoutNs, fetchMustGatherResult, downloadMustGatherResult, notifyDownloadFailed } =
    React.useContext(MustGatherContext);

  React.useEffect(() => {
    const type = data?.command.toLowerCase().includes('plan') ? 'plan' : 'vm';
    const unprefixedName = data && withoutNs(data['custom-name'], type);
    if (
      data?.status === 'completed' ||
      completedPreviously ||
      data?.status === 'error' ||
      erroredPreviously
    ) {
      setHasCompleted(true);
    } else {
      setHasCompleted(false);
    }

    if (isSuccess && !!data?.['custom-name'] && listStatus === 'completed' && !notified) {
      pushNotification({
        title: 'Log collection complete.',
        message: (
          <div>
            You can download the migration logs for the {type}&nbsp;
            <Button
              onClick={() => {
                fetchMustGatherResult(data)
                  .then(
                    (tarBall) =>
                      tarBall &&
                      downloadMustGatherResult(
                        tarBall,
                        `must-gather-${data?.['custom-name']}.tar.gz`
                      )
                  )
                  .catch(() => notifyDownloadFailed());
              }}
              variant="link"
              isInline
            >
              {unprefixedName}
            </Button>
          </div>
        ),
        key: `${data?.['custom-name']}-completed`,
        variant: 'success',
        actionClose: true,
        timeout: false,
      });

      setNotified(true);
    }

    if (isSuccess && !!data?.['custom-name'] && listStatus === 'error' && !notified) {
      pushNotification({
        title: 'Log collection unsuccessful.',
        message: `An error was encountered while gathering the migration logs for the ${type} ${unprefixedName}`,
        key: `${data?.['custom-name']}-error`,
        variant: 'danger',
        actionClose: true,
        timeout: false,
      });

      setNotified(true);
    }
  }, [
    data,
    isSuccess,
    notified,
    listStatus,
    hasCompleted,
    completedPreviously,
    erroredPreviously,
    withoutNs,
    setNotified,
    setHasCompleted,
    pushNotification,
    downloadMustGatherResult,
    fetchMustGatherResult,
    notifyDownloadFailed,
  ]);

  return null;
};
