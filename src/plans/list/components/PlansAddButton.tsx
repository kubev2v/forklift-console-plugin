import type { FC, MouseEvent } from 'react';
import { useNavigate } from 'react-router';
import { useHasSufficientProviders } from 'src/utils/fetch';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModelRef } from '@forklift-ui/types';
import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core';
import { TELEMETRY_EVENTS } from '@utils/analytics/constants';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';
import { getResourceUrl } from '@utils/getResourceUrl';

type PlansAddButtonProps = {
  canCreate?: boolean;
  namespace?: string;
  testId?: string;
};

const PlansAddButton: FC<PlansAddButtonProps> = ({ canCreate, namespace, testId }) => {
  const { t } = useForkliftTranslation();
  const navigate = useNavigate();
  const { trackEvent } = useForkliftAnalytics();
  const hasSufficientProviders = useHasSufficientProviders(namespace);

  const onClick = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    trackEvent(TELEMETRY_EVENTS.PLAN_CREATE_BUTTON_CLICKED, {
      hasSufficientProviders,
      planNamespace: namespace,
    });

    const planResourceUrl = getResourceUrl({
      namespaced: false,
      reference: PlanModelRef,
    });

    navigate(`${planResourceUrl}/~new`)?.catch(() => undefined);
  };

  const button = (
    <Button
      data-testid={testId}
      id="plans-add-button"
      isAriaDisabled={!hasSufficientProviders}
      isDisabled={!canCreate}
      onClick={onClick}
      variant={ButtonVariant.primary}
    >
      {t('Create plan')}
    </Button>
  );

  if (hasSufficientProviders) {
    return button;
  }

  return (
    <Tooltip
      content={
        namespace
          ? t(
              'At least one source and one target provider in the {{name}} project must be available.',
              { name: namespace },
            )
          : t('At least one source and one target provider must be available.')
      }
    >
      {button}
    </Tooltip>
  );
};

export default PlansAddButton;
