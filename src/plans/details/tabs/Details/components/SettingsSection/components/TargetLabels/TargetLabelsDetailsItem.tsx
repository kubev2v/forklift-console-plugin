import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import LabelsModal from '@components/LabelsModal/LabelsModal';
import LabelsViewDetailsItemContent from '@components/LabelsViewDetailsItemContent/LabelsViewDetailsItemContent';
import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { PlanModel, type V1beta1Plan } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { Stack, StackItem } from '@patternfly/react-core';
import { DOC_MAIN_HELP_LINK } from '@utils/links';

import type { EditableDetailsItemProps } from '../../../utils/types';

const TargetLabelsDetailsItem: FC<EditableDetailsItemProps> = ({ canPatch, plan }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const TARGET_LABELS_DETAILS_ITEM_DESCRIPTION = t(
    'Specify custom labels that will be applied after migration to all target virtual machines of the migration plan. This can apply organizational or operational labels to migrated virtual machines for further identification and management.',
  );

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
      moreInfoLink={DOC_MAIN_HELP_LINK}
      onEdit={() => {
        showModal(
          <LabelsModal
            initialLabels={plan?.spec?.targetLabels}
            description={
              <ForkliftTrans>
                <Stack hasGutter>
                  <StackItem>{TARGET_LABELS_DETAILS_ITEM_DESCRIPTION}</StackItem>
                  <StackItem>
                    Enter <strong>key=value</strong> pair(s). For example: project=myProject
                  </StackItem>
                </Stack>
              </ForkliftTrans>
            }
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
