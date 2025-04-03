import { type FC, useState } from 'react';
import { usePlanMigration } from 'src/modules/Plans/hooks/usePlanMigration';
import { PlanStartMigrationModal } from 'src/modules/Plans/modals/PlanStartMigrationModal';
import { getMigrationVmsCounts } from 'src/modules/Plans/utils/helpers/getMigrationVmsCounts';
import {
  getPlanPhase,
  isPlanArchived,
  isPlanExecuting,
} from 'src/modules/Plans/utils/helpers/getPlanPhase';
import { PlanPhase } from 'src/modules/Plans/utils/types/PlanPhase';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel, PlanModelRef } from '@kubev2v/types';
import { Button, ButtonVariant, Flex, FlexItem, Split, SplitItem } from '@patternfly/react-core';
import StartIcon from '@patternfly/react-icons/dist/esm/icons/play-icon';

import type { CellProps } from '../utils/types';

import PlanStatusVmCount from './components/PlanStatusVmCount';
import StatusPhaseLoader from './components/StatusPhaseLoader';
import type { VmPipelineTask } from './utils/types';

import './PlanStatus.style.scss';

const PlanStatus: FC<CellProps> = ({ plan }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();
  const [isButtonEnabled, setIsButtonEnabled] = useState(true);
  const [lastMigration] = usePlanMigration(plan);

  const vms = plan?.status?.migration?.vms;
  const phase = getPlanPhase({ plan });

  if (phase === PlanPhase.Ready) {
    return (
      <Button
        variant={ButtonVariant.secondary}
        icon={<StartIcon />}
        isDisabled={!isButtonEnabled}
        onClick={() => {
          showModal(
            <PlanStartMigrationModal
              resource={plan}
              model={PlanModel}
              title={t('Start')}
              setButtonEnabledOnChange={setIsButtonEnabled}
            />,
          );
        }}
      >
        {t('Start')}
      </Button>
    );
  }

  const planURL = getResourceUrl({
    name: plan?.metadata?.name,
    namespace: plan?.metadata?.namespace,
    reference: PlanModelRef,
  });

  // All VM count links point to the same place for now,
  // but will be updated to target only affected VMs in the future.
  // Could possibly use a querystring to dictate a table filter for the list of VMs.
  const vmCountLinkPath = `${planURL}/vms`;

  const isWaitingForCutover = plan?.spec?.warm && isPlanExecuting(plan) && !isPlanArchived(plan);
  const isPlanLoading =
    !isWaitingForCutover && (phase === PlanPhase.Running || phase === PlanPhase.Archiving);

  const vmPipelineTasks = lastMigration?.status?.vms?.reduce(
    (acc: VmPipelineTask[], migrationVm) => {
      migrationVm.pipeline.forEach((pipelineStep) => {
        acc.push({
          status: pipelineStep.phase!,
          task: pipelineStep.name,
          vmName: migrationVm.name!,
        });
      });

      return acc;
    },
    [],
  );

  const vmCount = getMigrationVmsCounts(vms ?? []);
  const completedVmPipelineTasks = vmPipelineTasks?.filter(
    (pipelineTask) => pipelineTask.status === 'Completed',
  );
  const progressValue = vmPipelineTasks?.length
    ? (100 * (completedVmPipelineTasks?.length ?? 0)) / vmPipelineTasks.length
    : 0;

  return (
    <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        spaceItems={{ default: 'spaceItemsSm' }}
        className="plan-status-cell-label-section"
      >
        <FlexItem>
          <StatusPhaseLoader phase={phase} loading={isPlanLoading} />
        </FlexItem>

        {progressValue !== 0 && isPlanLoading && (
          <FlexItem className="pf-v5-u-font-size-sm">{Math.trunc(progressValue)}%</FlexItem>
        )}
      </Flex>

      <FlexItem>
        <Split hasGutter>
          {vmCount.success > 0 && (
            <SplitItem>
              <PlanStatusVmCount
                count={vmCount.success}
                status="success"
                linkPath={vmCountLinkPath}
                tooltipLabel={t('Succeeded')}
              />
            </SplitItem>
          )}

          {vmCount.canceled > 0 && (
            <SplitItem>
              <PlanStatusVmCount
                count={vmCount.canceled}
                status="canceled"
                linkPath={vmCountLinkPath}
                tooltipLabel={t('Canceled')}
              />
            </SplitItem>
          )}

          {vmCount.error > 0 && (
            <SplitItem>
              <PlanStatusVmCount
                count={vmCount.error}
                status="danger"
                linkPath={vmCountLinkPath}
                tooltipLabel={t('Failed')}
              />
            </SplitItem>
          )}
        </Split>
      </FlexItem>
    </Flex>
  );
};

export default PlanStatus;
