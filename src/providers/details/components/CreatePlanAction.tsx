import type { FC } from 'react';
import { useHistory } from 'react-router';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { TELEMETRY_EVENTS } from 'src/utils/analytics/constants';
import { useForkliftAnalytics } from 'src/utils/analytics/hooks/useForkliftAnalytics';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel, PlanModelRef, type V1beta1Provider } from '@kubev2v/types';
import { Button, ButtonVariant, ToolbarItem } from '@patternfly/react-core';
import { getNamespace } from '@utils/crds/common/selectors';

type CreatePlanActionProps = {
  namespace: string | undefined;
  provider?: V1beta1Provider;
};

const CreatePlanAction: FC<CreatePlanActionProps> = ({ namespace, provider }) => {
  const { t } = useForkliftTranslation();
  const history = useHistory();
  const { trackEvent } = useForkliftAnalytics();

  const { canCreate } = useGetDeleteAndEditAccessReview({
    model: PlanModel,
    namespace,
  });

  const handleCreatePlan = () => {
    trackEvent(TELEMETRY_EVENTS.PLAN_CREATE_FROM_PROVIDER_CLICKED, {
      planNamespace: namespace,
      providerId: provider?.metadata?.name,
      providerNamespace: getNamespace(provider),
      providerType: provider?.spec?.type,
    });

    const planResourceUrl = getResourceUrl({
      namespaced: false,
      reference: PlanModelRef,
    });

    history.push({
      pathname: `${planResourceUrl}/~new`,
      state: {
        planProject: provider ? getNamespace(provider) : '',
        sourceProvider: provider,
      },
    });
  };

  return (
    <ToolbarItem>
      <Button variant={ButtonVariant.primary} onClick={handleCreatePlan} isDisabled={!canCreate}>
        {t('Create migration plan')}
      </Button>
    </ToolbarItem>
  );
};

export default CreatePlanAction;
