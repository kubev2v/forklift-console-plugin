import React from 'react';
import { useModal } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@kubev2v/common';
import { V1beta1PlanStatusMigrationVmsPipeline } from '@kubev2v/types';
import { Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import { Modal, ModalVariant } from '@patternfly/react-core';

export interface PipelineTasksModalProps {
  name: string;
  tasks: V1beta1PlanStatusMigrationVmsPipeline[];
}

export const PipelineTasksModal: React.FC<PipelineTasksModalProps> = ({ name, tasks }) => {
  const { t } = useForkliftTranslation();
  const { toggleModal } = useModal();

  return (
    <Modal
      title={name}
      position="top"
      variant={ModalVariant.large}
      isOpen={true}
      onClose={toggleModal}
    >
      <TableComposable variant="compact">
        <Thead>
          <Tr>
            <Th>{t('Name')}</Th>
            <Th>{t('Phase')}</Th>
            <Th>{t('Progress')}</Th>
            <Th>{t('Started at')}</Th>
            <Th>{t('Error')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {(tasks || []).map((t) => (
            <Tr key={t?.name}>
              <Td>{t?.name}</Td>
              <Td>{t?.phase}</Td>
              <Td>{getTaskProgress(t)}</Td>
              <Td>
                <Timestamp timestamp={t?.started} />
              </Td>
              <Td>{t?.error?.reasons}</Td>
            </Tr>
          ))}
        </Tbody>
      </TableComposable>
    </Modal>
  );
};

const getTaskProgress = (task) => {
  if (!task || !task?.progress) {
    return { completed: '-', total: '-' };
  }

  const { completed, total } = task.progress;

  const completeString = completed !== undefined ? completed : '-';
  const totalString = total !== undefined ? total : '-';

  return `${completeString} / ${totalString} ${task.annotations?.unit || '-'}`;
};
