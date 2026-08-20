import type { FC } from 'react';
import { useNavigate } from 'react-router';
import PlanCutoverMigrationModal from 'src/plans/actions/components/CutoverModal/PlanCutoverMigrationModal';
import type { PlanModalProps } from 'src/plans/actions/components/types';

import { ConsoleTimestamp } from '@components/ConsoleTimestamp/ConsoleTimestamp';
import { useDrawer } from '@components/DrawerContext/useDrawer';
import HelpText from '@components/HelpText';
import type { V1beta1Plan, V1beta1PlanStatusMigrationVms } from '@forklift-ui/types';
import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
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
import { getResourceUrl } from '@utils/getResourceUrl';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import {
  CUTOVER_NAME,
  getPipelineStepDisplayName,
  isVmInPostMigrationSetup,
  VIRTUAL_MACHINE_CREATION_NAME,
  WAIT_FOR_GUEST_REBOOTS_NAME,
} from '../../../../utils/utils';
import { getPipelineProgressIcon } from '../../../utils/icon';
import { getPipelineTasks } from '../../../utils/utils';
import PipelineTasksDrawer from '../PipelineTasksDrawer';

import './MigrationProgressTable.scss';

type MigrationProgressTableProps = {
  plan: V1beta1Plan;
  statusVM: V1beta1PlanStatusMigrationVms | undefined;
  targetNamespace?: string;
  vmCreated?: boolean;
  vmName?: string;
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
  const launchOverlay = useOverlay();
  const navigate = useNavigate();
  const pipeline = statusVM?.pipeline ?? [];
  const inPostMigrationSetup = isVmInPostMigrationSetup(statusVM);

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
          const isWaitForGuestRebootsPipeline = pipe?.name === WAIT_FOR_GUEST_REBOOTS_NAME;
          const isWaitForGuestRebootsRunning =
            isWaitForGuestRebootsPipeline && pipe?.phase === taskStatuses.running;
          const isTasksEmpty = isEmpty(pipe?.tasks);
          const displayName = getPipelineStepDisplayName(pipe?.name);

          return (
            <Tr key={pipe?.name}>
              <Td modifier="nowrap">
                <Split hasGutter>
                  <SplitItem>{getPipelineProgressIcon(pipe)}</SplitItem>
                  <SplitItem>{displayName}</SplitItem>
                </Split>
              </Td>
              <Td>
                {!isVMCreatedAndVMCreationPipeline &&
                  !isWaitForGuestRebootsRunning &&
                  isTasksEmpty &&
                  pipe?.description}
                {!isTasksEmpty && !isCutoverPipeline && (
                  <>
                    {t('Completed ')}
                    <Button
                      isInline
                      onClick={() => {
                        openDrawer(
                          <PipelineTasksDrawer name={displayName} tasks={pipe.tasks} />,
                          <h3>
                            {displayName}
                            <HelpText>{vmName}</HelpText>
                          </h3>,
                        );
                      }}
                      variant={ButtonVariant.link}
                    >
                      {t('{{completed}} of {{total}} {{name}}', getPipelineTasks(pipe))}
                    </Button>
                    {t(' tasks')}
                  </>
                )}
                {isVMCreatedAndVMCreationPipeline && !inPostMigrationSetup && (
                  <>
                    {t('Created ')}
                    <Button
                      isInline
                      onClick={() => {
                        navigate(
                          getResourceUrl({
                            groupVersionKind: VirtualMachineModelGroupVersionKind,
                            name: vmName,
                            namespace: targetNamespace,
                          }),
                        )?.catch(() => undefined);
                      }}
                      variant={ButtonVariant.link}
                    >
                      {vmName}
                    </Button>
                  </>
                )}
                {isVMCreatedAndVMCreationPipeline && inPostMigrationSetup && (
                  <>{t('Created {{vmName}}', { vmName })}</>
                )}
                {isWaitForGuestRebootsRunning && (
                  <Alert
                    isInline
                    isPlain
                    title={t('Do not access this VM')}
                    variant={AlertVariant.warning}
                  >
                    {t(
                      'Windows VM is installing drivers and completing post-migration setup. Multiple reboots are expected.',
                    )}
                  </Alert>
                )}
                {isCutoverPipeline && pipe?.phase === taskStatuses.completed && (
                  <>{pipe?.description}</>
                )}
                {isCutoverPipeline && pipe?.phase !== taskStatuses.completed && (
                  <Stack>
                    <StackItem>{t('Paused')}</StackItem>
                    <StackItem>
                      <Button
                        className="forklift-progress-table__schedule-cutover"
                        onClick={() => {
                          launchOverlay<PlanModalProps>(PlanCutoverMigrationModal, { plan });
                        }}
                        variant={ButtonVariant.link}
                      >
                        {t('Schedule cutover')}
                      </Button>
                    </StackItem>
                  </Stack>
                )}
                {pipe?.error?.reasons && !isEmpty(pipe?.error?.reasons) && (
                  <div className="pf-v6-u-mt-sm">
                    <Alert isInline isPlain title={t('Error details')} variant="danger">
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
                <ConsoleTimestamp showGlobalIcon={false} timestamp={pipe?.completed ?? null} />
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

export default MigrationProgressTable;
