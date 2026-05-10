import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { V1beta1Plan } from '@forklift-ui/types';
import { CATEGORY_TYPES, CONDITION_STATUS } from '@utils/constants';
import { getVddkInitImage } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import {
  isPlanArchived,
  isPlanExecuting,
  isPlanSucceeded,
} from '../components/PlanStatus/utils/utils';

import usePlanSourceProvider from './usePlanSourceProvider';

type UseCanInspectPlanResult = {
  canInspect: boolean;
  disabledReason: string | undefined;
  isVsphere: boolean;
  provider: ReturnType<typeof usePlanSourceProvider>['sourceProvider'];
};

export const useCanInspectPlan = (plan: V1beta1Plan): UseCanInspectPlanResult => {
  const { loaded, sourceProvider } = usePlanSourceProvider(plan);
  const { t } = useForkliftTranslation();
  const isVsphere = sourceProvider?.spec?.type === PROVIDER_TYPES.vsphere;
  const isVddkConfigured = !isEmpty(getVddkInitImage(sourceProvider));
  const providerReady =
    loaded &&
    sourceProvider?.status?.conditions?.some(
      (condition) =>
        condition.type === CATEGORY_TYPES.READY && condition.status === CONDITION_STATUS.TRUE,
    );

  const disabled = (reason?: string): UseCanInspectPlanResult => ({
    canInspect: false,
    disabledReason: reason,
    isVsphere,
    provider: sourceProvider,
  });

  if (!isVsphere) {
    return disabled();
  }

  if (!providerReady) {
    return disabled(t('Source provider is not ready.'));
  }

  if (!isVddkConfigured) {
    return disabled(
      t('VDDK image is required for deep inspection. Configure it in the provider settings.'),
    );
  }

  if (isPlanExecuting(plan)) {
    return disabled(t('Cannot inspect VMs while migration is in progress.'));
  }

  if (isPlanArchived(plan)) {
    return disabled(t('Cannot inspect VMs in an archived plan.'));
  }

  if (isPlanSucceeded(plan)) {
    return disabled(t('VMs in a completed migration cannot be inspected.'));
  }

  return { canInspect: true, disabledReason: undefined, isVsphere, provider: sourceProvider };
};
