import { type ReactNode, useState } from 'react';

import ModalForm from '@components/ModalForm/ModalForm';
import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Form, Stack, StackItem } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { NODE_SELECTOR_MODAL_DESCRIPTION } from './utils/constants';
import { labelsArrayToObject } from './utils/labelsArrayToObject';
import { labelsObjectToArray } from './utils/labelsObjectToArray';
import type { LabelFields } from './utils/types';
import LabelsList from './LabelList';
import LabelRow from './LabelRow';

type NodeSelectorModalProps = {
  onConfirm: (labels: Record<string, string | null>) => Promise<K8sResourceCommon>;
  title?: string;
  description?: ReactNode;
  initialLabels?: Record<string, string>;
};

const NodeSelectorModal: React.FC<NodeSelectorModalProps> = ({
  description,
  initialLabels,
  onConfirm,
  title,
}) => {
  const { t } = useForkliftTranslation();
  const [labels, setLabels] = useState<LabelFields[]>(labelsObjectToArray(initialLabels));

  const onLabelChange = (changedLabel: LabelFields): void => {
    setLabels(
      labels.map((label) => {
        if (label.id === changedLabel.id) {
          return changedLabel;
        }
        return label;
      }),
    );
  };

  const onLabelAdd = (newEntity: LabelFields): void => {
    const id = labels[labels.length - 1]?.id + 1 || 0;
    setLabels([...labels, { ...newEntity, id }]);
  };

  const onLabelDelete = (idToDelete: number): void => {
    setLabels(labels.filter(({ id }) => id !== idToDelete));
  };

  const onSelectorLabelAdd = () => {
    onLabelAdd({ id: -1, key: '', value: '' });
  };

  return (
    <ModalForm
      title={title ?? t('Edit node selectors')}
      onConfirm={async () => onConfirm(labelsArrayToObject(labels)) ?? {}}
    >
      <Form>
        <Stack hasGutter>
          <StackItem>{description ?? NODE_SELECTOR_MODAL_DESCRIPTION}</StackItem>

          <LabelsList isEmpty={isEmpty(labels)} onLabelAdd={onSelectorLabelAdd}>
            {!isEmpty(labels) && (
              <>
                {labels.map((label, index) => (
                  <LabelRow
                    key={label.id}
                    label={label}
                    onChange={onLabelChange}
                    onDelete={onLabelDelete}
                    isLabelsVisible={index === 0}
                  />
                ))}
              </>
            )}
          </LabelsList>
        </Stack>
      </Form>
    </ModalForm>
  );
};

export default NodeSelectorModal;
