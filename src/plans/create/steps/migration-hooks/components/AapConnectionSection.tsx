import { type FC, useEffect, useRef } from 'react';

import { Alert, AlertVariant, Spinner } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import type { AapJobTemplate } from '@utils/types/aap';

import { AAP_CONNECTION_STATUS_CONNECTED } from '../constants';
import useAapConfig from '../hooks/useAapConfig';
import useAapConnection from '../hooks/useAapConnection';

import ConnectionStatusAlert from './ConnectionStatusAlert';

type AapConnectionSectionProps = {
  onConnected: (jobTemplates: AapJobTemplate[]) => void;
};

const AapConnectionSection: FC<AapConnectionSectionProps> = ({ onConnected }) => {
  const { t } = useForkliftTranslation();
  const { aapUrl, isConfigured, loaded: configLoaded } = useAapConfig();
  const { connect, error, isConnecting, jobTemplates, status } = useAapConnection();

  const onConnectedRef = useRef(onConnected);
  onConnectedRef.current = onConnected;

  useEffect(() => {
    if (!configLoaded || !isConfigured) {
      return undefined;
    }

    let cancelled = false;

    connect().then(
      (result) => {
        if (!cancelled && result?.status === AAP_CONNECTION_STATUS_CONNECTED) {
          onConnectedRef.current(result.templates);
        }
      },
      () => {
        // errors are handled inside useAapConnection
      },
    );

    return () => {
      cancelled = true;
    };
  }, [configLoaded, isConfigured, connect]);

  if (!configLoaded) {
    return <Spinner size="md" />;
  }

  if (!isConfigured) {
    return (
      <Alert variant={AlertVariant.info} isInline title={t('AAP is not configured')}>
        {t(
          'An administrator must set the AAP URL and token secret in the ForkliftController settings before AAP hooks can be used.',
        )}
      </Alert>
    );
  }

  return (
    <>
      {aapUrl && !isConnecting && status !== AAP_CONNECTION_STATUS_CONNECTED && (
        <Alert
          variant={AlertVariant.info}
          isInline
          isPlain
          title={t('AAP: {{url}}', { url: aapUrl })}
        />
      )}

      <ConnectionStatusAlert status={status} error={error} templateCount={jobTemplates.length} />
    </>
  );
};

export default AapConnectionSection;
