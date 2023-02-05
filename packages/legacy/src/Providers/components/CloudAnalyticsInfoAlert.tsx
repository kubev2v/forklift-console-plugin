import * as React from 'react';
import { Alert, AlertActionCloseButton, Text } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useLocalStorage } from '@migtools/lib-ui';
import { CLOUD_MA_LINK, PROVIDER_TYPE_NAMES } from 'legacy/src/common/constants';

/**
 * @deprecated
 */
export const CloudAnalyticsInfoAlert: React.FunctionComponent = () => {
  const [isAlertHidden, setIsAlertHidden] = useLocalStorage('isProvidersPageMAAlertHidden', false);

  const link = (
    <a href={CLOUD_MA_LINK.href} target="_blank" rel="noreferrer">
      {CLOUD_MA_LINK.label}
    </a>
  );

  const alertMessage = (
    <Text>
      You can analyze your {PROVIDER_TYPE_NAMES.vsphere} provider data with Migration Analytics.
      Migration Analytics generates a complete inventory of your {PROVIDER_TYPE_NAMES.vsphere}{' '}
      environment and VM recommendations for migration. Select your {PROVIDER_TYPE_NAMES.vsphere}{' '}
      providers and download the data file. Then log in to {link}, select Migration Analytics, and
      create a Migration Analytics report.
    </Text>
  );

  return isAlertHidden ? null : (
    <Alert
      variant="info"
      title="Analyze provider data"
      actionClose={<AlertActionCloseButton onClose={() => setIsAlertHidden(true)} />}
      className={spacing.mtMd}
    >
      {alertMessage}
    </Alert>
  );
};
