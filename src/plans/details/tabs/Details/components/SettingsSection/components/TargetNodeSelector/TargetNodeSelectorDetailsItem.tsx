import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/planStatusPermissions';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import NodeSelectorModal, {
  type NodeSelectorModalProps,
} from '@components/NodeSelectorModal/NodeSelectorModal';
import NodeSelectorViewDetailsItemContent from '@components/NodeSelectorViewDetailsItemContent/NodeSelectorViewDetailsItemContent';
import type { V1beta1Plan } from '@forklift-ui/types';
import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { Stack, StackItem } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import type { EditableDetailsItemProps } from '../../../utils/types';
import { patchPlanSpec } from '../../utils/patchPlanSpec';

const TargetNodeSelectorDetailsItem: FC<EditableDetailsItemProps> = ({ canPatch, plan }) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();

  const TARGET_NODE_SELECTOR_DETAILS_ITEM_DESCRIPTION = t(
    'Specify node labels that will be applied after migration to all target virtual machines of the migration plan for constraining virtual machines scheduling to specific nodes, based on node labels. This will ensure that the migrated virtual machines will run on nodes with required capabilities (GPU, storage type, CPU architecture).',
  );

  const onConfirm = async (newLabels: Record<string, string | null>): Promise<V1beta1Plan> =>
    patchPlanSpec({
      currentValue: plan?.spec?.targetNodeSelector,
      newValue: isEmpty(newLabels) ? undefined : newLabels,
      path: '/spec/targetNodeSelector',
      plan,
    });

  return (
    <DetailsItem
      canEdit={canPatch && isPlanEditable(plan)}
      content={<NodeSelectorViewDetailsItemContent labels={plan?.spec?.targetNodeSelector} />}
      crumbs={['spec', 'targetNodeSelector']}
      helpContent={TARGET_NODE_SELECTOR_DETAILS_ITEM_DESCRIPTION}
      onEdit={() => {
        launchOverlay<NodeSelectorModalProps>(NodeSelectorModal, {
          description: (
            <ForkliftTrans>
              <Stack hasGutter>
                <StackItem>{TARGET_NODE_SELECTOR_DETAILS_ITEM_DESCRIPTION}</StackItem>
                <StackItem>
                  Add labels to specify qualifying nodes. For each nodes label, set{' '}
                  <strong>key, value</strong> pair(s). For example: key set to{' '}
                  <strong>beta.kubernetes.io/os</strong> and value set to <strong>linux</strong>
                </StackItem>
              </Stack>
            </ForkliftTrans>
          ),
          initialLabels: plan?.spec?.targetNodeSelector,
          onConfirm,
          title: t('Edit VM target node selector'),
        });
      }}
      testId="vm-target-node-selector-detail-item"
      title={t('VM target node selector')}
    />
  );
};

export default TargetNodeSelectorDetailsItem;
