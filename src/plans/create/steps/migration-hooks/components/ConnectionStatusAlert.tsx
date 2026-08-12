import type { FC } from 'react';

import { Alert, AlertVariant, Spinner } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import {
  AAP_CONNECTION_STATUS_CONNECTED,
  AAP_CONNECTION_STATUS_CONNECTING,
  AAP_CONNECTION_STATUS_CONNECTION_FAILED,
  AAP_CONNECTION_STATUS_IDLE,
  type AapConnectionStatus,
} from '../constants';

const MAX_ERROR_MESSAGE_LENGTH = 200;

type ConnectionStatusAlertProps = {
  error: string | null;
  status: AapConnectionStatus;
  templateCount: number;
};

const ConnectionStatusAlert: FC<ConnectionStatusAlertProps> = ({
  error,
  status,
  templateCount,
}) => {
  const { t } = useForkliftTranslation();
  const truncatedError =
    error && error.length > MAX_ERROR_MESSAGE_LENGTH
      ? `${error.slice(0, MAX_ERROR_MESSAGE_LENGTH)}...`
      : error;

  switch (status) {
    case AAP_CONNECTION_STATUS_IDLE:
      return null;
    case AAP_CONNECTION_STATUS_CONNECTING:
      return (
        <Alert
          customIcon={<Spinner size="md" />}
          data-testid="aap-connection-status-connecting"
          isInline
          isPlain
          title={t('Loading AAP job templates...')}
          variant={AlertVariant.info}
        />
      );
    case AAP_CONNECTION_STATUS_CONNECTED:
      return (
        <Alert
          data-testid="aap-connection-status-connected"
          isInline
          isPlain
          title={t('Connected to AAP -- {{count}} job templates available', {
            count: templateCount,
          })}
          variant={AlertVariant.success}
        />
      );
    case AAP_CONNECTION_STATUS_CONNECTION_FAILED:
      return (
        <Alert
          data-testid="aap-connection-status-failed"
          isInline
          title={t('Failed to load AAP job templates')}
          variant={AlertVariant.warning}
        >
          {t(
            'Unable to fetch job templates from AAP. Verify the AAP URL and token secret are configured correctly in the ForkliftController settings.',
          )}
          {truncatedError ? ` (${truncatedError})` : ''}
        </Alert>
      );
    default:
      return null;
  }
};

export default ConnectionStatusAlert;
