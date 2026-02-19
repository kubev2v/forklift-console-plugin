import type { FC } from 'react';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';

import AffinityModal, { type AffinityModalProps } from '@components/AffinityModal/AffinityModal';
import AffinityViewDetailsItemContent from '@components/AffinityViewDetailsItemContent/AffinityViewDetailsItemContent';
import { DetailsItem } from '@components/DetailItems/DetailItem';
import type { K8sIoApiCoreV1Affinity, V1beta1Plan } from '@forklift-ui/types';
import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { useForkliftTranslation } from '@utils/i18n';
import { DOC_MAIN_HELP_LINK } from '@utils/links';

import type { EditableDetailsItemProps } from '../../../utils/types';
import { patchPlanSpec } from '../../utils/patchPlanSpec';

const ConvertorAffinityDetailsItem: FC<EditableDetailsItemProps> = ({
  canPatch,
  plan,
  shouldRender,
}) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  if (!shouldRender) {
    return null;
  }

  const description = t(
    'Specify affinity rules for virt-v2v convertor pods during migration. This can apply hard and soft affinity and anti-affinity rules for convertor pods against workloads and nodes - for performance optimization (co-locating with storage) and ensuring network proximity to source infrastructure.',
  );

  const onConfirm = async (updatedAffinity: K8sIoApiCoreV1Affinity): Promise<V1beta1Plan> =>
    patchPlanSpec({
      currentValue: plan?.spec?.convertorAffinity,
      newValue: updatedAffinity,
      path: '/spec/convertorAffinity',
      plan,
    });

  const initialAffinity = plan?.spec?.convertorAffinity as K8sIoApiCoreV1Affinity;

  return (
    <DetailsItem
      testId="convertor-affinity-rules-detail-item"
      title={t('Convertor pod affinity rules')}
      content={<AffinityViewDetailsItemContent affinity={initialAffinity} />}
      helpContent={description}
      crumbs={['spec', 'convertorAffinity']}
      moreInfoLink={DOC_MAIN_HELP_LINK}
      onEdit={() => {
        launcher<AffinityModalProps>(AffinityModal, {
          initialAffinity,
          onConfirm,
          title: t('Edit convertor pod affinity rules'),
        });
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default ConvertorAffinityDetailsItem;
