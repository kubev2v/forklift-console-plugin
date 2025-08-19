import type { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { useForkliftTranslation } from 'src/utils/i18n';

import { NetworkMapModelRef } from '@kubev2v/types';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { CreationMethod, TELEMETRY_EVENTS } from '@utils/analytics/constants';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';

const NetworkMapsAddButton: FC<{ namespace?: string; testId?: string }> = ({
  namespace,
  testId,
}) => {
  const { t } = useForkliftTranslation();
  const navigate = useNavigate();
  const { trackEvent } = useForkliftAnalytics();

  const NetworkMapsListURL = getResourceUrl({
    namespace,
    namespaced: namespace !== undefined,
    reference: NetworkMapModelRef,
  });

  const onClick = () => {
    trackEvent(TELEMETRY_EVENTS.NETWORK_MAP_CREATE_STARTED, {
      creationMethod: CreationMethod.YamlEditor,
      namespace,
    });
    navigate(`${NetworkMapsListURL}/~new`);
  };

  return (
    <Button data-testid={testId} variant={ButtonVariant.primary} onClick={onClick}>
      {t('Create network map')}
    </Button>
  );
};

export default NetworkMapsAddButton;
