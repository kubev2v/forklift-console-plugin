import type { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';

import { ConsoleTimestamp } from '@components/ConsoleTimestamp/ConsoleTimestamp';
import { useDrawer } from '@components/DrawerContext/useDrawer';
import HelpText from '@components/HelpText';
import type { V1beta1PlanStatusMigrationVmsPipeline } from '@kubev2v/types';
import { Button, ButtonVariant, Split, SplitItem } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { VirtualMachineModelGroupVersionKind } from '@utils/crds/common/models';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { VIRTUAL_MACHINE_CREATION_NAME } from '../../../utils/utils';
import { getPipelineProgressIcon } from '../../utils/icon';
import { getPipelineTasks } from '../../utils/utils';

import PipelineTasksDrawer from './PipelineTasksDrawer';

type MigrationProgressTableProps = {
  pipeline: V1beta1PlanStatusMigrationVmsPipeline[];
  vmCreated?: boolean;
  vmName?: string;
  targetNamespace?: string;
};

const MigrationProgressTable: FC<MigrationProgressTableProps> = ({
  pipeline,
  targetNamespace,
  vmCreated,
  vmName,
}) => {
  const { t } = useForkliftTranslation();
  const { openDrawer } = useDrawer();
  const navigate = useNavigate();

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>{t('Name')}</Th>
          <Th>{t('Description')}</Th>
          <Th>{t('Completed at')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {(pipeline ?? []).map((pipe) => {
          const isVMCreatedAndVMCreationPipeline =
            pipe?.name === VIRTUAL_MACHINE_CREATION_NAME && vmCreated;
          const isTasksEmpty = isEmpty(pipe?.tasks);

          return (
            <Tr key={pipe?.name}>
              <Td modifier="nowrap">
                <Split hasGutter>
                  <SplitItem>{getPipelineProgressIcon(pipe)}</SplitItem>
                  <SplitItem>{pipe?.name}</SplitItem>
                </Split>
              </Td>
              <Td>
                {!isVMCreatedAndVMCreationPipeline && isTasksEmpty && pipe?.description}
                {!isTasksEmpty && (
                  <>
                    {t('Completed ')}
                    <Button
                      variant={ButtonVariant.link}
                      onClick={() => {
                        openDrawer(
                          <PipelineTasksDrawer name={pipe?.name} tasks={pipe.tasks} />,
                          <h3>
                            {pipe?.name}
                            <HelpText>{vmName}</HelpText>
                          </h3>,
                        );
                      }}
                      isInline
                    >
                      {t('{{completed}} of {{total}} {{name}}', getPipelineTasks(pipe))}
                    </Button>
                    {t(' tasks')}
                  </>
                )}
                {isVMCreatedAndVMCreationPipeline && (
                  <>
                    {t('Created ')}
                    <Button
                      variant={ButtonVariant.link}
                      onClick={() => {
                        navigate(
                          getResourceUrl({
                            groupVersionKind: VirtualMachineModelGroupVersionKind,
                            name: vmName,
                            namespace: targetNamespace,
                          }),
                        );
                      }}
                      isInline
                    >
                      {vmName}
                    </Button>
                  </>
                )}
              </Td>
              <Td>
                <ConsoleTimestamp timestamp={pipe?.completed ?? null} showGlobalIcon={false} />
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

export default MigrationProgressTable;
