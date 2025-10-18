import type { FC } from 'react';
import { ModalHOC, useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import PlanStartMigrationModal from 'src/plans/actions/components/StartPlanModal/PlanStartMigrationModal';
import PlanStatusLabel from 'src/plans/details/components/PlanStatus/PlanStatusLabel';
import { PlanStatuses } from 'src/plans/details/components/PlanStatus/utils/types';
import {
  getCantStartVMStatusCount,
  getMigrationVMsStatusCounts,
  getPlanStatus,
  isPlanArchived,
  isPlanExecuting,
} from 'src/plans/details/components/PlanStatus/utils/utils';
import VMStatusIconsRow from 'src/plans/details/components/PlanStatus/VMStatusIconsRow';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Button, ButtonVariant, Flex, FlexItem, Spinner, Split } from '@patternfly/react-core';
import { PlayIcon as StartIcon } from '@patternfly/react-icons';
import {
  getPlanVirtualMachines,
  getPlanVirtualMachinesMigrationStatus,
} from '@utils/crds/plans/selectors';

import type { PlanFieldProps } from '../utils/types';

import usePipelineTaskProgress from './hooks/usePipelineTaskProgress';

import './PlanStatus.style.scss';

const PlanStatus: FC<PlanFieldProps> = ({ plan }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();
  const pipelinesProgressPercentage = usePipelineTaskProgress(plan);
  const planStatus = getPlanStatus(plan);

  if (planStatus === PlanStatuses.Ready) {
    return (
      <Split hasGutter>
        <Button
          variant={ButtonVariant.secondary}
          icon={<StartIcon />}
          onClick={() => {
            showModal(<PlanStartMigrationModal plan={plan} title={t('Start')} />);
          }}
          isInline
          data-testid="plan-start-button-status"
        >
          {t('Start')}
        </Button>
      </Split>
    );
  }

  const isPlanRunning = isPlanExecuting(plan) && !isPlanArchived(plan);

  const vmStatuses =
    PlanStatuses.CannotStart === planStatus
      ? getCantStartVMStatusCount(getPlanVirtualMachines(plan))
      : getMigrationVMsStatusCounts(
          getPlanVirtualMachinesMigrationStatus(plan),
          getPlanVirtualMachinesMigrationStatus(plan).length,
          planStatus,
        );

  return (
    <>
      <Flex
        direction={{ default: 'row' }}
        alignItems={{ default: 'alignItemsCenter' }}
        spaceItems={{ default: 'spaceItemsSm' }}
      >
        <FlexItem className="plan-status-cell-label-section">
          {isPlanRunning && PlanStatuses.Paused !== planStatus ? (
            <Split hasGutter>
              <Spinner size="md" data-testid="plan-progress-spinner" />
              <span className="pf-v6-u-font-size-sm" data-testid="plan-progress-percentage">
                {Math.trunc(pipelinesProgressPercentage)}%
              </span>
            </Split>
          ) : (
            <PlanStatusLabel plan={plan} />
          )}
        </FlexItem>
        <FlexItem>
          <ModalHOC>
            <VMStatusIconsRow plan={plan} statuses={vmStatuses} />
          </ModalHOC>
        </FlexItem>
      </Flex>
    </>
  );
};

export default PlanStatus;
