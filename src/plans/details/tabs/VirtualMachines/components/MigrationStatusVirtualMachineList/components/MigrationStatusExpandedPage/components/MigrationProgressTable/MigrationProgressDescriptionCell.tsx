import type { FC } from 'react';
import { useNavigate } from 'react-router';
import PlanCutoverMigrationModal from 'src/plans/actions/components/CutoverModal/PlanCutoverMigrationModal';
import type { PlanModalProps } from 'src/plans/actions/components/types';

import { useDrawer } from '@components/DrawerContext/useDrawer';
import HelpText from '@components/HelpText';
import type { V1beta1Plan, V1beta1PlanStatusMigrationVms } from '@forklift-ui/types';
import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { taskStatuses } from '@utils/constants';
import { VirtualMachineModelGroupVersionKind } from '@utils/crds/common/models';
import { getResourceUrl } from '@utils/getResourceUrl';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import {
  CUTOVER_NAME,
  VIRTUAL_MACHINE_CREATION_NAME,
  WAIT_FOR_GUEST_REBOOTS_NAME,
} from '../../../../utils/utils';
import { getPipelineTasks } from '../../../utils/utils';
import PipelineTasksDrawer from '../PipelineTasksDrawer';

import MigrationProgressErrorReasons from './MigrationProgressErrorReasons';

type MigrationProgressDescriptionCellProps = {
  displayName: string;
  inPostMigrationSetup: boolean;
  pipe: NonNullable<V1beta1PlanStatusMigrationVms['pipeline']>[number];
  plan: V1beta1Plan;
  targetNamespace?: string;
  vmCreated?: boolean;
  vmName?: string;
};

const MigrationProgressDescriptionCell: FC<MigrationProgressDescriptionCellProps> = ({
  displayName,
  inPostMigrationSetup,
  pipe,
  plan,
  targetNamespace,
  vmCreated,
  vmName,
}) => {
  const { t } = useForkliftTranslation();
  const { openDrawer } = useDrawer();
  const launchOverlay = useOverlay();
  const navigate = useNavigate();

  const isVMCreatedAndVMCreationPipeline =
    pipe?.name === VIRTUAL_MACHINE_CREATION_NAME && vmCreated;
  const isCutoverPipeline = pipe?.name === CUTOVER_NAME;
  const isWaitForGuestRebootsPipeline = pipe?.name === WAIT_FOR_GUEST_REBOOTS_NAME;
  const isWaitForGuestRebootsRunning =
    isWaitForGuestRebootsPipeline && pipe?.phase === taskStatuses.running;
  const isTasksEmpty = isEmpty(pipe?.tasks);

  return (
    <>
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
        <Alert isInline isPlain title={t('Do not access this VM')} variant={AlertVariant.warning}>
          {t(
            'Windows VM is installing drivers and completing post-migration setup. Multiple reboots are expected.',
          )}
        </Alert>
      )}
      {isCutoverPipeline && pipe?.phase === taskStatuses.completed && <>{pipe?.description}</>}
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
        <MigrationProgressErrorReasons reasons={pipe.error.reasons} />
      )}
    </>
  );
};

export default MigrationProgressDescriptionCell;
