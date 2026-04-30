import usePlanSourceProvider from 'src/plans/details/hooks/usePlanSourceProvider';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { V1beta1Plan } from '@forklift-ui/types';
import { getVddkInitImage } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';

import {
  isPlanArchived,
  isPlanExecuting,
  isPlanSucceeded,
} from '../../../plans/details/components/PlanStatus/utils/utils';

type UseCanInspectPlanResult = {
  canInspect: boolean;
  disabledReason: string | undefined;
  isVsphere: boolean;
  provider: ReturnType<typeof usePlanSourceProvider>['sourceProvider'];
};

export const useCanInspectPlan = (plan: V1beta1Plan): UseCanInspectPlanResult => {
  const { loaded, sourceProvider } = usePlanSourceProvider(plan);
  const isVsphere = sourceProvider?.spec?.type === PROVIDER_TYPES.vsphere;
  const isVddkConfigured = !isEmpty(getVddkInitImage(sourceProvider));
  const providerReady =
    loaded &&
    sourceProvider?.status?.conditions?.some(
      (condition) => condition.type === 'Ready' && condition.status === 'True',
    );

  if (!isVsphere) {
    return { canInspect: false, disabledReason: undefined, isVsphere, provider: sourceProvider };
  }

  if (!providerReady) {
    return {
      canInspect: false,
      disabledReason: 'Source provider is not ready.',
      isVsphere,
      provider: sourceProvider,
    };
  }

  if (!isVddkConfigured) {
    return {
      canInspect: false,
      disabledReason:
        'VDDK image is required for deep inspection. Configure it in the provider settings.',
      isVsphere,
      provider: sourceProvider,
    };
  }

  if (isPlanExecuting(plan)) {
    return {
      canInspect: false,
      disabledReason: 'Cannot inspect VMs while migration is in progress.',
      isVsphere,
      provider: sourceProvider,
    };
  }

  if (isPlanArchived(plan)) {
    return {
      canInspect: false,
      disabledReason: 'Cannot inspect VMs in an archived plan.',
      isVsphere,
      provider: sourceProvider,
    };
  }

  if (isPlanSucceeded(plan)) {
    return {
      canInspect: false,
      disabledReason: 'VMs in a completed migration cannot be inspected.',
      isVsphere,
      provider: sourceProvider,
    };
  }

  return { canInspect: true, disabledReason: undefined, isVsphere, provider: sourceProvider };
};
