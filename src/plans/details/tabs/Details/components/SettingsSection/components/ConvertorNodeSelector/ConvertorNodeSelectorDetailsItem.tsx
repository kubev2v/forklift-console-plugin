import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import NodeSelectorModal, {
  type NodeSelectorModalProps,
} from '@components/NodeSelectorModal/NodeSelectorModal';
import NodeSelectorViewDetailsItemContent from '@components/NodeSelectorViewDetailsItemContent/NodeSelectorViewDetailsItemContent';
import type { V1beta1Plan } from '@forklift-ui/types';
import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { Stack, StackItem } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import type { EditableDetailsItemProps } from '../../../utils/types';
import { patchPlanSpec } from '../../utils/patchPlanSpec';

const ConvertorNodeSelectorDetailsItem: FC<EditableDetailsItemProps> = ({
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
    'Specify node selector labels for virt-v2v convertor pods to constrain their scheduling to specific nodes. This ensures convertor pods run on nodes with required capabilities such as network proximity to source infrastructure or specific storage access.',
  );

  const onConfirm = async (newLabels: Record<string, string | null>): Promise<V1beta1Plan> =>
    patchPlanSpec({
      currentValue: plan?.spec?.convertorNodeSelector,
      newValue: isEmpty(newLabels) ? undefined : newLabels,
      path: '/spec/convertorNodeSelector',
      plan,
    });

  return (
    <DetailsItem
      testId="convertor-node-selector-detail-item"
      title={t('Convertor pod node selector')}
      content={<NodeSelectorViewDetailsItemContent labels={plan?.spec?.convertorNodeSelector} />}
      helpContent={description}
      crumbs={['spec', 'convertorNodeSelector']}
      onEdit={() => {
        launcher<NodeSelectorModalProps>(NodeSelectorModal, {
          description: (
            <ForkliftTrans>
              <Stack hasGutter>
                <StackItem>{description}</StackItem>
                <StackItem>
                  Add labels to specify qualifying nodes. For each nodes label, set{' '}
                  <strong>key, value</strong> pair(s). For example: key set to{' '}
                  <strong>beta.kubernetes.io/os</strong> and value set to <strong>linux</strong>
                </StackItem>
              </Stack>
            </ForkliftTrans>
          ),
          initialLabels: plan?.spec?.convertorNodeSelector,
          onConfirm,
          title: t('Edit convertor pod node selector'),
        });
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default ConvertorNodeSelectorDetailsItem;
