import { PlanModelGroupVersionKind, type V1beta1Plan } from '@forklift-ui/types';
import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { getNamespace, getOwnerReference } from '@utils/crds/common/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import { PlanStatuses } from '../details/components/PlanStatus/utils/types';
import { getPlanStatus, isPlanEditable } from '../details/components/PlanStatus/utils/utils';

type OwnerPlanActionGate = {
  isBlocked: boolean;
  disabledReason: string | undefined;
};

const getMapDisabledReason = (
  planStatus: PlanStatuses,
  t: (key: string) => string,
): string | undefined => {
  if (planStatus === PlanStatuses.Archived) return t('Owning plan is archived');
  if (
    planStatus === PlanStatuses.Executing ||
    planStatus === PlanStatuses.Paused ||
    planStatus === PlanStatuses.Pending
  )
    return t('Owning plan is currently migrating');
  if (planStatus === PlanStatuses.Completed) return t('Owning plan has completed');
  return t('Owning plan cannot be modified');
};

export const useOwnerPlanActionGate = (
  resource: K8sResourceCommon | undefined,
): OwnerPlanActionGate => {
  const { t } = useForkliftTranslation();
  const owner = resource ? getOwnerReference(resource) : undefined;
  const hasPlanOwner = owner?.kind === 'Plan';

  const [plan, loaded] = useK8sWatchResource<V1beta1Plan>(
    hasPlanOwner
      ? {
          groupVersionKind: PlanModelGroupVersionKind,
          name: owner.name,
          namespace: getNamespace(resource),
          namespaced: true,
        }
      : null,
  );

  if (!hasPlanOwner) {
    return { disabledReason: undefined, isBlocked: false };
  }

  if (!loaded || !plan) {
    return { disabledReason: t('Checking plan status…'), isBlocked: true };
  }

  if (isPlanEditable(plan)) {
    return { disabledReason: undefined, isBlocked: false };
  }

  const planStatus = getPlanStatus(plan);
  return { disabledReason: getMapDisabledReason(planStatus, t), isBlocked: true };
};
