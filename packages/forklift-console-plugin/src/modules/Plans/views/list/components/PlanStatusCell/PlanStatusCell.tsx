import React from 'react';
import { usePlanMigration } from 'src/modules/Plans/hooks';
import { PlanStartMigrationModal } from 'src/modules/Plans/modals';
import {
  getMigrationVmsCounts,
  getPlanSummaryStatus,
  isPlanArchived,
  isPlanExecuting,
  PlanSummaryStatus,
} from 'src/modules/Plans/utils';
import { useModal } from 'src/modules/Providers/modals';
import { getResourceUrl } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel, PlanModelRef } from '@kubev2v/types';
import { Button, Flex, FlexItem, Split, SplitItem } from '@patternfly/react-core';
import StartIcon from '@patternfly/react-icons/dist/esm/icons/play-icon';

import { CellProps } from '../CellProps';
import { PlanStatusVmCount } from '../PlanStatusVmCount';

import { PlanStatusCellLabel } from './PlanStatusCellLabel';

import './PlanStatusCell.style.scss';

type VmPipelineTask = {
  vmName: string;
  task: string;
  status: string;
};

export const PlanStatusCell: React.FC<CellProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const plan = data?.obj;
  const [lastMigration] = usePlanMigration(plan);

  const vmPipelineTasks = lastMigration?.status.vms?.reduce(
    (acc: VmPipelineTask[], migrationVm) => {
      migrationVm.pipeline.forEach((pipelineStep) => {
        acc.push({ vmName: migrationVm.name, task: pipelineStep.name, status: pipelineStep.phase });
      });

      return acc;
    },
    [],
  );

  const vmStatuses = lastMigration?.status.vms;
  const planStatus = getPlanSummaryStatus(data);
  const isWarmAndExecuting = plan.spec?.warm && isPlanExecuting(plan);
  const isWaitingForCutover = isWarmAndExecuting && !isPlanArchived(plan);
  const isPlanLoading = !isWaitingForCutover && planStatus === PlanSummaryStatus.Running;
  const planURL = getResourceUrl({
    reference: PlanModelRef,
    name: plan?.metadata?.name,
    namespace: plan?.metadata?.namespace,
  });

  // All VM count links point to the same place for now,
  // but will be updated to target only affected VMs in the future.
  // Could possibly use a querystring to dictate a table filter for the list of VMs.
  const vmCountLinkPath = `${planURL}/vms`;

  if (planStatus === PlanSummaryStatus.ReadyToStart) {
    return (
      <Button
        variant="secondary"
        icon={<StartIcon />}
        onClick={() =>
          showModal(
            <PlanStartMigrationModal resource={plan} model={PlanModel} title={t('Start')} />,
          )
        }
      >
        {t('Start')}
      </Button>
    );
  }

  const vmCount = getMigrationVmsCounts(vmStatuses);
  const completedVmPipelineTasks = vmPipelineTasks?.filter(
    (pipelineTask) => pipelineTask.status === 'Completed',
  );
  const progressValue = vmPipelineTasks?.length
    ? (100 * completedVmPipelineTasks.length) / vmPipelineTasks.length
    : 0;

  return (
    <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        spaceItems={{ default: 'spaceItemsSm' }}
        className="plan-status-cell-label-section"
      >
        <FlexItem>
          <PlanStatusCellLabel status={planStatus} isLoading={isPlanLoading} />
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
              />
            </SplitItem>
          )}

          {vmCount.canceled > 0 && (
            <SplitItem>
              <PlanStatusVmCount
                count={vmCount.canceled}
                status="warning"
                linkPath={vmCountLinkPath}
              />
            </SplitItem>
          )}

          {vmCount.error > 0 && (
            <SplitItem>
              <PlanStatusVmCount count={vmCount.error} status="danger" linkPath={vmCountLinkPath} />
            </SplitItem>
          )}
        </Split>
      </FlexItem>
    </Flex>
  );
};