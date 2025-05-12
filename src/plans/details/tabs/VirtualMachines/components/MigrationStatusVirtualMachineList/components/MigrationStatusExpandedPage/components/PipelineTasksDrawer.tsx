import type { FC } from 'react';

import type { V1beta1PlanStatusMigrationVmsPipelineTasks } from '@kubev2v/types';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useForkliftTranslation } from '@utils/i18n';

import { getTaskProgress } from '../../utils/utils';

type PipelineTasksDrawerProps = {
  name: string;
  tasks: V1beta1PlanStatusMigrationVmsPipelineTasks[] | undefined;
};

const PipelineTasksDrawer: FC<PipelineTasksDrawerProps> = ({ tasks }) => {
  const { t } = useForkliftTranslation();

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>{t('Name')}</Th>
          <Th>{t('Description')}</Th>
          <Th>{t('Progress')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {(tasks ?? []).map((task) => (
          <Tr key={task?.name}>
            <Td>{task?.name}</Td>
            <Td>{task?.phase}</Td>
            <Td>{getTaskProgress(task)}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default PipelineTasksDrawer;
