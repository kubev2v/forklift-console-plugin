import type { FC } from 'react';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/planStatusPermissions';

import { DetailsItem } from '@components/DetailItems/DetailItem';
import LabelsModal, { type LabelsModalProps } from '@components/LabelsModal/LabelsModal';
import LabelsViewDetailsItemContent from '@components/LabelsViewDetailsItemContent/LabelsViewDetailsItemContent';
import type { V1beta1Plan } from '@forklift-ui/types';
import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { Stack, StackItem } from '@patternfly/react-core';
import { ForkliftTrans, useForkliftTranslation } from '@utils/i18n';
import { DOC_MAIN_HELP_LINK } from '@utils/links';

import type { EditableDetailsItemProps } from '../../../utils/types';
import { patchPlanSpec } from '../../utils/patchPlanSpec';

const ConvertorLabelsDetailsItem: FC<EditableDetailsItemProps> = ({
  canPatch,
  plan,
  shouldRender,
}) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();

  if (!shouldRender) {
    return null;
  }

  const description = t(
    'Specify custom labels to apply to virt-v2v convertor pods during migration. This can help with organizational labeling, monitoring, or targeting convertor pods with network policies.',
  );

  const onConfirm = async (newLabels: Record<string, string | null>): Promise<V1beta1Plan> =>
    patchPlanSpec({
      currentValue: plan?.spec?.convertorLabels,
      newValue: newLabels,
      path: '/spec/convertorLabels',
      plan,
    });

  return (
    <DetailsItem
      canEdit={canPatch && isPlanEditable(plan)}
      content={<LabelsViewDetailsItemContent labels={plan?.spec?.convertorLabels} />}
      crumbs={['spec', 'convertorLabels']}
      helpContent={description}
      moreInfoLink={DOC_MAIN_HELP_LINK}
      onEdit={() => {
        launchOverlay<LabelsModalProps>(LabelsModal, {
          description: (
            <ForkliftTrans>
              <Stack hasGutter>
                <StackItem>{description}</StackItem>
                <StackItem>
                  Enter <strong>key=value</strong> pair(s). For example: project=myProject
                </StackItem>
              </Stack>
            </ForkliftTrans>
          ),
          initialLabels: plan?.spec?.convertorLabels,
          onConfirm,
          title: t('Edit convertor pod labels'),
        });
      }}
      testId="convertor-labels-detail-item"
      title={t('Convertor pod labels')}
    />
  );
};

export default ConvertorLabelsDetailsItem;
