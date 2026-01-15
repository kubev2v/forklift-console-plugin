import type { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { ProviderModelRef } from '@kubev2v/types';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { getResourceUrl } from '@utils/getResourceUrl';

import { ProviderCreateSource, TELEMETRY_EVENTS } from '../../../utils/analytics/constants';
import { useForkliftAnalytics } from '../../../utils/analytics/hooks/useForkliftAnalytics';
import { useForkliftTranslation } from '../../../utils/i18n';

type ProvidersAddButtonProps = {
  namespace?: string;
  testId?: string;
  canCreate?: boolean;
};

const ProvidersAddButton: FC<ProvidersAddButtonProps> = ({ canCreate, namespace, testId }) => {
  const { t } = useForkliftTranslation();
  const navigate = useNavigate();
  const { trackEvent } = useForkliftAnalytics();

  const providersListURL = getResourceUrl({
    namespace,
    namespaced: namespace !== undefined,
    reference: ProviderModelRef,
  });

  const onClick = () => {
    trackEvent(TELEMETRY_EVENTS.PROVIDER_CREATE_CLICKED, {
      createSource: ProviderCreateSource.ProvidersPage,
      namespace,
    });

    navigate(`${providersListURL}/~new`);
  };

  return (
    <Button
      data-testid={testId}
      variant={ButtonVariant.primary}
      onClick={onClick}
      isDisabled={!canCreate}
    >
      {t('Create provider')}
    </Button>
  );
};

export default ProvidersAddButton;
