import { PlanModelGroupVersionKind, type V1beta1Plan } from '@forklift-ui/types';
import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { getNamespace } from '@utils/crds/common/selectors';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';
import { useForkliftTranslation } from '@utils/i18n';

import { isPlanEditable } from '../details/components/PlanStatus/utils/planStatusPermissions';
import { getPlanStatus } from '../details/components/PlanStatus/utils/planStatusResolver';
import { PlanStatuses } from '../details/components/PlanStatus/utils/types';

type OwnerPlanActionGate = {
  disabledReason: string | undefined;
  isBlocked: boolean;
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
  const planOwner = resource?.metadata?.ownerReferences?.find((ref) => ref.kind === 'Plan');
  const hasPlanOwner = Boolean(planOwner);

  const [plan, loaded] = useK8sWatchResource<V1beta1Plan>(
    hasPlanOwner
      ? {
          groupVersionKind: PlanModelGroupVersionKind,
          name: planOwner?.name ?? '',
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
