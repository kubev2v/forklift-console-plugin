import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import AffinityModal, { type AffinityModalProps } from '@components/AffinityModal/AffinityModal';
import AffinityViewDetailsItemContent from '@components/AffinityViewDetailsItemContent/AffinityViewDetailsItemContent';
import type { K8sIoApiCoreV1Affinity, V1beta1Plan } from '@forklift-ui/types';
import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { DOC_MAIN_HELP_LINK } from '@utils/links';

import type { EditableDetailsItemProps } from '../../../utils/types';
import { patchPlanSpec } from '../../utils/patchPlanSpec';

const TargetAffinityDetailsItem: FC<EditableDetailsItemProps> = ({ canPatch, plan }) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  const TARGET_AFFINITY_DETAILS_ITEM_DESCRIPTION = t(
    `Specify affinity rules that will be applied after migration to all target virtual machines of the migration plan.
    This can apply hard and soft affinity and anti-affinity rules for migrated virtual machines against workloads (of virtual machines and Pods) and against nodes - for performance optimization (co-locating related workloads) and High availability (spread virtual machines across nodes or zones).`,
  );

  const onConfirm = async (updatedAffinity: K8sIoApiCoreV1Affinity): Promise<V1beta1Plan> =>
    patchPlanSpec({
      currentValue: plan?.spec?.targetAffinity,
      newValue: updatedAffinity,
      path: '/spec/targetAffinity',
      plan,
    });

  const initialAffinity = plan?.spec?.targetAffinity as K8sIoApiCoreV1Affinity;

  return (
    <DetailsItem
      testId="vm-target-affinity-rules-detail-item"
      title={t('VM target affinity rules')}
      content={<AffinityViewDetailsItemContent affinity={initialAffinity} />}
      helpContent={TARGET_AFFINITY_DETAILS_ITEM_DESCRIPTION}
      crumbs={['spec', 'targetAffinity']}
      moreInfoLink={DOC_MAIN_HELP_LINK}
      onEdit={() => {
        launcher<AffinityModalProps>(AffinityModal, {
          initialAffinity,
          onConfirm,
          title: t('Edit VM target affinity rules'),
        });
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default TargetAffinityDetailsItem;
