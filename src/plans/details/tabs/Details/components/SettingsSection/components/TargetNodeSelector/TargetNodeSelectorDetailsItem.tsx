import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import NodeSelectorModal from '@components/NodeSelectorModal/NodeSelectorModal';
import NodeSelectorViewDetailsItemContent from '@components/NodeSelectorViewDetailsItemContent/NodeSelectorViewDetailsItemContent';
import { PlanModel, type V1beta1Plan } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { Stack, StackItem } from '@patternfly/react-core';

import type { EditableDetailsItemProps } from '../../../utils/types';

const TargetNodeSelectorDetailsItem: FC<EditableDetailsItemProps> = ({ canPatch, plan }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const TARGET_NODE_SELECTOR_DETAILS_ITEM_DESCRIPTION = t(
    'Specify node labels that will be applied after migration to all target virtual machines of the migration plan for constraining virtual machines scheduling to specific nodes, based on node labels. This will ensure that the migrated virtual machines will run on nodes with required capabilities (GPU, storage type, CPU architecture).',
  );

  const onConfirm: (newLabels: Record<string, string | null>) => Promise<V1beta1Plan> = async (
    newLabels: Record<string, string | null>,
  ) => {
    const currentValue = plan?.spec?.targetNodeSelector;
    const op = currentValue ? REPLACE : ADD;

    const result = await k8sPatch({
      data: [
        {
          op,
          path: '/spec/targetNodeSelector',
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
      title={t('VM target node selector')}
      content={<NodeSelectorViewDetailsItemContent labels={plan?.spec?.targetNodeSelector} />}
      helpContent={TARGET_NODE_SELECTOR_DETAILS_ITEM_DESCRIPTION}
      crumbs={['spec', 'targetNodeSelector']}
      onEdit={() => {
        showModal(
          <NodeSelectorModal
            initialLabels={plan?.spec?.targetNodeSelector}
            description={
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
            }
            title={t('Edit VM target node selector')}
            onConfirm={onConfirm}
          />,
        );
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default TargetNodeSelectorDetailsItem;
