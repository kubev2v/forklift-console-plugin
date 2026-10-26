import { MigrationTypeValue } from 'src/plans/create/steps/migration-type/constants';
import { hasLiveMigrationProviderType } from 'src/plans/create/utils/hasLiveMigrationProviderType';
import { getPlanMigrationType } from 'src/plans/details/utils/utils';
import useGetDeleteAndEditAccessReview from 'src/utils/hooks/useGetDeleteAndEditAccessReview';

import type { V1beta1Plan } from '@forklift-ui/types';
import { PlanModel } from '@forklift-ui/types';
import { FEATURE_NAMES } from '@utils/constants';
import { getNamespace } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';
import { useFeatureFlags } from '@utils/hooks/useFeatureFlags';

import usePlanSourceProvider from '../../../hooks/usePlanSourceProvider';
import type { PlanSettingsVisibilityInput } from '../utils/planSettingsVisibility';

export type PlanSettingsVisibility = PlanSettingsVisibilityInput & {
  canPatch: boolean;
  isVddkInitImageNotSet: boolean;
  plan: V1beta1Plan;
};

export const usePlanSettingsVisibility = (plan: V1beta1Plan): PlanSettingsVisibility => {
  const { sourceProvider } = usePlanSourceProvider(plan);
  const { isFeatureEnabled } = useFeatureFlags();

  const { canPatch } = useGetDeleteAndEditAccessReview({
    model: PlanModel,
    namespace: getNamespace(plan),
  });

  const isVsphere = sourceProvider?.spec?.type === 'vsphere';
  const isOvirt = sourceProvider?.spec?.type === 'ovirt';
  const migrationType = getPlanMigrationType(plan);
  const isVddkInitImageNotSet = isEmpty(sourceProvider?.spec?.settings?.vddkInitImage);

  const isTransferNetworkVisible =
    !hasLiveMigrationProviderType(sourceProvider) ||
    !isFeatureEnabled(FEATURE_NAMES.OCP_LIVE_MIGRATION) ||
    migrationType !== MigrationTypeValue.Live;

  return {
    canPatch,
    isOvirt,
    isTransferNetworkVisible,
    isVddkInitImageNotSet,
    isVsphere,
    plan,
  };
};
