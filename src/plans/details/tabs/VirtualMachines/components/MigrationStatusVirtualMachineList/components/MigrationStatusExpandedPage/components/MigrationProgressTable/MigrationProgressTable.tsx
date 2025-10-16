import type { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import PlanCutoverMigrationModal from 'src/plans/actions/components/CutoverModal/PlanCutoverMigrationModal';

import { ConsoleTimestamp } from '@components/ConsoleTimestamp/ConsoleTimestamp';
import { useDrawer } from '@components/DrawerContext/useDrawer';
import HelpText from '@components/HelpText';
import type { V1beta1Plan, V1beta1PlanStatusMigrationVms } from '@kubev2v/types';
import {
  Alert,
  Button,
  ButtonVariant,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { taskStatuses } from '@utils/constants';
import { VirtualMachineModelGroupVersionKind } from '@utils/crds/common/models';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { CUTOVER_NAME, VIRTUAL_MACHINE_CREATION_NAME } from '../../../../utils/utils';
import { getPipelineProgressIcon } from '../../../utils/icon';
import { getPipelineTasks } from '../../../utils/utils';
import PipelineTasksDrawer from '../PipelineTasksDrawer';

import './MigrationProgressTable.scss';

type MigrationProgressTableProps = {
  plan: V1beta1Plan;
  statusVM: V1beta1PlanStatusMigrationVms | undefined;
  vmCreated?: boolean;
  vmName?: string;
  targetNamespace?: string;
};

const MigrationProgressTable: FC<MigrationProgressTableProps> = ({
  plan,
  statusVM,
  targetNamespace,
  vmCreated,
  vmName,
}) => {
  const { t } = useForkliftTranslation();
  const { openDrawer } = useDrawer();
  const { showModal } = useModal();
  const navigate = useNavigate();
  const pipeline = statusVM?.pipeline ?? [];

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
          const isCutoverPipeline = pipe?.name === CUTOVER_NAME;
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
                {!isTasksEmpty && !isCutoverPipeline && (
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
                {isCutoverPipeline && pipe?.phase === taskStatuses.completed && (
                  <>{pipe?.description}</>
                )}
                {isCutoverPipeline && pipe?.phase !== taskStatuses.completed && (
                  <Stack>
                    <StackItem>{t('Paused')}</StackItem>
                    <StackItem>
                      <Button
                        onClick={() => {
                          showModal(<PlanCutoverMigrationModal plan={plan} />);
                        }}
                        variant={ButtonVariant.link}
                        className="forklift-progress-table__schedule-cutover"
                      >
                        {t('Schedule cutover')}
                      </Button>
                    </StackItem>
                  </Stack>
                )}
                {pipe?.error?.reasons && !isEmpty(pipe?.error?.reasons) && (
                  <div className="pf-v6-u-mt-sm">
                    <Alert variant="danger" title={t('Error details')} isInline isPlain>
                      <ul>
                        {pipe.error.reasons.map((reason: string, idx: number) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </Alert>
                  </div>
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
