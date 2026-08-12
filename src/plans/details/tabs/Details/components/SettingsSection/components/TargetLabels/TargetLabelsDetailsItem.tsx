import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import LabelsModal, { type LabelsModalProps } from '@components/LabelsModal/LabelsModal';
import LabelsViewDetailsItemContent from '@components/LabelsViewDetailsItemContent/LabelsViewDetailsItemContent';
import type { V1beta1Plan } from '@forklift-ui/types';
import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { Stack, StackItem } from '@patternfly/react-core';
import { DOC_MAIN_HELP_LINK } from '@utils/links';

import type { EditableDetailsItemProps } from '../../../utils/types';
import { patchPlanSpec } from '../../utils/patchPlanSpec';

const TargetLabelsDetailsItem: FC<EditableDetailsItemProps> = ({ canPatch, plan }) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  const TARGET_LABELS_DETAILS_ITEM_DESCRIPTION = t(
    'Specify custom labels that will be applied after migration to all target virtual machines of the migration plan. This can apply organizational or operational labels to migrated virtual machines for further identification and management.',
  );

  const onConfirm = async (newLabels: Record<string, string | null>): Promise<V1beta1Plan> =>
    patchPlanSpec({
      currentValue: plan?.spec?.targetLabels,
      newValue: newLabels,
      path: '/spec/targetLabels',
      plan,
    });

  return (
    <DetailsItem
      canEdit={canPatch && isPlanEditable(plan)}
      content={<LabelsViewDetailsItemContent labels={plan?.spec?.targetLabels} />}
      crumbs={['spec', 'targetLabels']}
      helpContent={TARGET_LABELS_DETAILS_ITEM_DESCRIPTION}
      moreInfoLink={DOC_MAIN_HELP_LINK}
      onEdit={() => {
        launcher<LabelsModalProps>(LabelsModal, {
          description: (
            <ForkliftTrans>
              <Stack hasGutter>
                <StackItem>{TARGET_LABELS_DETAILS_ITEM_DESCRIPTION}</StackItem>
                <StackItem>
                  Enter <strong>key=value</strong> pair(s). For example: project=myProject
                </StackItem>
              </Stack>
            </ForkliftTrans>
          ),
          initialLabels: plan?.spec?.targetLabels,
          onConfirm,
          title: t('Edit VM target labels'),
        });
      }}
      testId="vm-target-labels-detail-item"
      title={t('VM target labels')}
    />
  );
};

export default TargetLabelsDetailsItem;
