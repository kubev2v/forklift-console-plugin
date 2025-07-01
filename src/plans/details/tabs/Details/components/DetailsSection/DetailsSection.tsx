import type { FC } from 'react';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';

import CreatedAtDetailsItem from '@components/DetailItems/CreatedAtDetailItem';
import NameDetailsItem from '@components/DetailItems/NameDetailItem';
import NamespaceDetailsItem from '@components/DetailItems/NamespaceDetailItem';
import OwnerDetailsItem from '@components/DetailItems/OwnerDetailItem';
import { PlanModel, type V1beta1Plan } from '@kubev2v/types';
import { DescriptionList } from '@patternfly/react-core';
import { FEATURE_NAMES } from '@utils/constants';
import { getNamespace } from '@utils/crds/common/selectors';
import { useFeatureFlags } from '@utils/hooks/useFeatureFlags';

import usePlanSourceProvider from '../../../../hooks/usePlanSourceProvider';

import LiveDetailsItem from './components/PlanLive/LiveDetailsItem';
import TargetNamespaceDetailsItem from './components/PlanTargetNamespace/TargetNamespaceDetailsItem';
import WarmDetailsItem from './components/PlanWarm/WarmDetailsItem';
import StatusDetailsItem from './StatusDetailsItem';

type DetailsSectionProps = {
  plan: V1beta1Plan;
};

const DetailsSection: FC<DetailsSectionProps> = ({ plan }) => {
  const { sourceProvider } = usePlanSourceProvider(plan);
  const { isFeatureEnabled } = useFeatureFlags();

  const { canPatch } = useGetDeleteAndEditAccessReview({
    model: PlanModel,
    namespace: getNamespace(plan),
  });

  const isVsphere = sourceProvider?.spec?.type === 'vsphere';
  const isOvirt = sourceProvider?.spec?.type === 'ovirt';
  const isOpenshift = sourceProvider?.spec?.type === 'openshift';
  const isLiveMigrationEnabled = isFeatureEnabled(FEATURE_NAMES.OCP_LIVE_MIGRATION);
  return (
    <ModalHOC>
      <DescriptionList>
        <DescriptionList>
          <StatusDetailsItem plan={plan} />
        </DescriptionList>
        <DescriptionList
          columnModifier={{
            default: '2Col',
          }}
        >
          <NameDetailsItem resource={plan} />
          <WarmDetailsItem plan={plan} canPatch={canPatch} shouldRender={isOvirt || isVsphere} />
          <LiveDetailsItem
            plan={plan}
            canPatch={canPatch}
            shouldRender={isOpenshift && isLiveMigrationEnabled}
          />
          <NamespaceDetailsItem resource={plan} />
          <TargetNamespaceDetailsItem plan={plan} canPatch={canPatch} />
          <CreatedAtDetailsItem resource={plan} />
          <OwnerDetailsItem resource={plan} />
        </DescriptionList>
      </DescriptionList>
    </ModalHOC>
  );
};

export default DetailsSection;
