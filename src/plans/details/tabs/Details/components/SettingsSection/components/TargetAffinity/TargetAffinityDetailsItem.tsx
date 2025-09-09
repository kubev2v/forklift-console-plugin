import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import AffinityModal from '@components/AffinityModal/AffinityModal';
import AffinityViewDetailsItemContent from '@components/AffinityViewDetailsItemContent/AffinityViewDetailsItemContent';
import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { type K8sIoApiCoreV1Affinity, PlanModel, type V1beta1Plan } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { DOC_MAIN_HELP_LINK } from '@utils/links';

import type { EditableDetailsItemProps } from '../../../utils/types';

const TargetAffinityDetailsItem: FC<EditableDetailsItemProps> = ({ canPatch, plan }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const TARGET_AFFINITY_DETAILS_ITEM_DESCRIPTION = t(
    `Specify affinity rules that will be applied after migration to all target virtual machines of the migration plan.
    This can apply hard and soft affinity and anti-affinity rules for migrated virtual machines against workloads (of virtual machines and Pods) and against nodes - for performance optimization (co-locating related workloads) and High availability (spread virtual machines across nodes or zones).`,
  );

  const onConfirm: (updatedAffinity: K8sIoApiCoreV1Affinity) => Promise<V1beta1Plan> = async (
    updatedAffinity: K8sIoApiCoreV1Affinity,
  ) => {
    const currentValue = plan?.spec?.targetAffinity;
    const op = currentValue ? REPLACE : ADD;

    const result = await k8sPatch({
      data: [
        {
          op,
          path: '/spec/targetAffinity',
          value: updatedAffinity,
        },
      ],
      model: PlanModel,
      resource: plan,
    });

    return result;
  };

  return (
    <DetailsItem
      title={t('VM target affinity rules')}
      content={<AffinityViewDetailsItemContent affinity={plan?.spec?.targetAffinity} />}
      helpContent={TARGET_AFFINITY_DETAILS_ITEM_DESCRIPTION}
      crumbs={['spec', 'targetAffinity']}
      moreInfoLink={DOC_MAIN_HELP_LINK}
      onEdit={() => {
        showModal(
          <AffinityModal
            initialAffinity={plan?.spec?.targetAffinity}
            title={t('Edit VM target affinity rules')}
            onConfirm={onConfirm}
          />,
        );
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default TargetAffinityDetailsItem;
