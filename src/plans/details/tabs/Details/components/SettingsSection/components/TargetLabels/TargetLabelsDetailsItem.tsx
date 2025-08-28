import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import LabelsModal from '@components/LabelsModal/LabelsModal';
import LabelsViewDetailsItemContent from '@components/LabelsViewDetailsItemContent/LabelsViewDetailsItemContent';
import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { PlanModel, type V1beta1Plan } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import type { EditableDetailsItemProps } from '../../../utils/types';

import {
  TARGET_LABELS_DETAILS_ITEM_DESCRIPTION,
  TARGET_LABELS_MODAL_DESCRIPTION,
} from './utils/constants';

const TargetLabelsDetailsItem: FC<EditableDetailsItemProps> = ({ canPatch, plan }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const onConfirm: (newLabels: Record<string, string | null>) => Promise<V1beta1Plan> = async (
    newLabels: Record<string, string | null>,
  ) => {
    const currentValue = plan?.spec?.targetLabels;
    const op = currentValue ? REPLACE : ADD;

    const result = await k8sPatch({
      data: [
        {
          op,
          path: '/spec/targetLabels',
          value: newLabels,
        },
      ],
      model: PlanModel,
      resource: plan,
    });

    return result;
  };

  return (
    <DetailsItem
      title={t('VM target labels')}
      content={<LabelsViewDetailsItemContent labels={plan?.spec?.targetLabels} />}
      helpContent={TARGET_LABELS_DETAILS_ITEM_DESCRIPTION}
      crumbs={['spec', 'targetLabels']}
      onEdit={() => {
        showModal(
          <LabelsModal
            initialLabels={plan?.spec?.targetLabels}
            description={TARGET_LABELS_MODAL_DESCRIPTION}
            title={t('Edit VM target labels')}
            onConfirm={onConfirm}
          />,
        );
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default TargetLabelsDetailsItem;
