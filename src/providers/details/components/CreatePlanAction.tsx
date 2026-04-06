import type { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import { TELEMETRY_EVENTS } from 'src/utils/analytics/constants';
import { useForkliftAnalytics } from 'src/utils/analytics/hooks/useForkliftAnalytics';
import useGetDeleteAndEditAccessReview from 'src/utils/hooks/useGetDeleteAndEditAccessReview';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel, PlanModelRef, type V1beta1Provider } from '@forklift-ui/types';
import { Button, ButtonVariant, ToolbarItem } from '@patternfly/react-core';
import { getName, getNamespace } from '@utils/crds/common/selectors';
import { getResourceUrl } from '@utils/getResourceUrl';
import { useClusterIsAwsPlatform } from '@utils/hooks/useClusterIsAwsPlatform';

type CreatePlanActionProps = {
  namespace: string | undefined;
  provider?: V1beta1Provider;
};

const CreatePlanAction: FC<CreatePlanActionProps> = ({ namespace, provider }) => {
  const { t } = useForkliftTranslation();
  const navigate = useNavigate();
  const { trackEvent } = useForkliftAnalytics();
  const isAwsPlatform = useClusterIsAwsPlatform();
  const isEc2OnNonAwsCluster = provider?.spec?.type === PROVIDER_TYPES.ec2 && !isAwsPlatform;

  const { canCreate } = useGetDeleteAndEditAccessReview({
    model: PlanModel,
    namespace,
  });

  const handleCreatePlan = (): void => {
    trackEvent(TELEMETRY_EVENTS.PLAN_CREATE_FROM_PROVIDER_CLICKED, {
      planNamespace: namespace,
      providerId: getName(provider),
      providerNamespace: getNamespace(provider),
      providerType: provider?.spec?.type,
    });

    const planResourceUrl = getResourceUrl({
      namespaced: false,
      reference: PlanModelRef,
    });

    const searchParams = new URLSearchParams();
    const providerName = getName(provider);

    if (providerName) {
      searchParams.set('sourceProvider', providerName);
    }

    const providerNamespace = getNamespace(provider);

    if (providerNamespace) {
      searchParams.set('planProject', providerNamespace);
    }

    const query = searchParams.toString();
    const queryString = query ? `?${query}` : '';
    navigate(`${planResourceUrl}/~new${queryString}`);
  };

  if (isEc2OnNonAwsCluster) {
    return null;
  }

  return (
    <ToolbarItem>
      <Button
        data-testid="create-plan-from-provider-button"
        variant={ButtonVariant.primary}
        onClick={handleCreatePlan}
        isDisabled={!canCreate}
      >
        {t('Create migration plan')}
      </Button>
    </ToolbarItem>
  );
};

export default CreatePlanAction;
