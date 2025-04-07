import type { FC, ReactNode } from 'react';
import { ConsoleTimestamp } from 'src/components/ConsoleTimestamp/ConsoleTimestamp';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1PlanStatusMigrationVmsPipeline } from '@kubev2v/types';
import { Modal, ModalVariant } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

type PipelineTasksModalProps = {
  name: string;
  tasks: V1beta1PlanStatusMigrationVmsPipeline[];
};

export const PipelineTasksModal: FC<PipelineTasksModalProps> = ({ name, tasks }) => {
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
      <Table variant="compact">
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
                <ConsoleTimestamp timestamp={t?.started} />
              </Td>
              <Td>{t?.error?.reasons}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Modal>
  );
};

const getTaskProgress = (task): ReactNode => {
  if (!task?.progress) {
    return '- / -';
  }

  const { completed, total } = task.progress;

  const completeString = completed !== undefined ? completed : '-';
  const totalString = total !== undefined ? total : '-';

  return `${completeString} / ${totalString} ${task.annotations?.unit || '-'}`;
};
