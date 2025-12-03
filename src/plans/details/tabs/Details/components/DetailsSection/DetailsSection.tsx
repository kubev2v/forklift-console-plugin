import type { FC } from 'react';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import { hasLiveMigrationProviderType } from 'src/plans/create/utils/hasLiveMigrationProviderType';

import CreatedAtDetailsItem from '@components/DetailItems/CreatedAtDetailItem';
import NameDetailsItem from '@components/DetailItems/NameDetailItem';
import NamespaceDetailsItem from '@components/DetailItems/NamespaceDetailItem';
import OwnerDetailsItem from '@components/DetailItems/OwnerDetailItem';
import { PlanModel, type V1beta1Plan } from '@kubev2v/types';
import { DescriptionList } from '@patternfly/react-core';
import { FEATURE_NAMES } from '@utils/constants';
import { getNamespace } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';
import { useFeatureFlags } from '@utils/hooks/useFeatureFlags';
import { useForkliftTranslation } from '@utils/i18n';

import usePlanSourceProvider from '../../../../hooks/usePlanSourceProvider';

import DescriptionDetailItem from './components/Description/DescriptionDetailItem';
import LiveDetailsItem from './components/PlanLive/LiveDetailsItem';
import TargetNamespaceDetailsItem from './components/PlanTargetNamespace/TargetNamespaceDetailsItem';
import WarmDetailsItem from './components/PlanWarm/WarmDetailsItem';
import StatusDetailsItem from './StatusDetailsItem';

type DetailsSectionProps = {
  plan: V1beta1Plan;
};

const DetailsSection: FC<DetailsSectionProps> = ({ plan }) => {
  const { t } = useForkliftTranslation();
  const { sourceProvider } = usePlanSourceProvider(plan);
  const { isFeatureEnabled } = useFeatureFlags();

  const { canPatch } = useGetDeleteAndEditAccessReview({
    model: PlanModel,
    namespace: getNamespace(plan),
  });

  const isVsphere = sourceProvider?.spec?.type === 'vsphere';
  const isOvirt = sourceProvider?.spec?.type === 'ovirt';
  const isLiveMigrationEnabled =
    isFeatureEnabled(FEATURE_NAMES.OCP_LIVE_MIGRATION) &&
    hasLiveMigrationProviderType(sourceProvider);
  const isVddkInitImageNotSet = isEmpty(sourceProvider?.spec?.settings?.vddkInitImage);

  return (
    <>
      <DescriptionList>
        <StatusDetailsItem plan={plan} />
      </DescriptionList>
      <DescriptionList
        columnModifier={{
          default: '2Col',
        }}
      >
        <NameDetailsItem resource={plan} />
        <WarmDetailsItem
          plan={plan}
          isVddkInitImageNotSet={isVddkInitImageNotSet}
          canPatch={canPatch}
          shouldRender={isOvirt || isVsphere}
        />
        <LiveDetailsItem plan={plan} canPatch={canPatch} shouldRender={isLiveMigrationEnabled} />
        <NamespaceDetailsItem title={t('Plan project')} resource={plan} />
        <TargetNamespaceDetailsItem plan={plan} canPatch={canPatch} />
        <DescriptionDetailItem plan={plan} canPatch={canPatch} />
        <CreatedAtDetailsItem resource={plan} />
        <OwnerDetailsItem resource={plan} />
      </DescriptionList>
    </>
  );
};

export default DetailsSection;
